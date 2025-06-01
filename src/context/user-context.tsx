"use client";
import React, { createContext, useContext, useState, ReactNode, useEffect, useRef } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase-config";
import { User } from "@/types/user";
import { saveUser, findOrCreateUser } from "@/lib/firestore-db";

// Define the shape of the context
interface UserContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  isLoading: boolean;
  initializeUser: (clerkId: string, emailAddress: string) => Promise<void>;
  clearUserData: () => void;
}

// Create the context
const UserContext = createContext<UserContextType | undefined>(undefined);

// Provider component
export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUserState] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  // Refs to manage timers and prevent memory leaks
  const updateTimerRef = useRef<NodeJS.Timeout | null>(null);
  const firestoreUnsubscribeRef = useRef<(() => void) | null>(null);
  const isInitializedRef = useRef(false);

  // Keys for localStorage
  const USER_STORAGE_KEY = "app_user_data";
  const USER_INITIALIZED_KEY = "app_user_initialized";

  // Load user from localStorage
  const loadUserFromStorage = (): User | null => {
    try {
      const storedUser = localStorage.getItem(USER_STORAGE_KEY);
      return storedUser ? JSON.parse(storedUser) : null;
    } catch (error) {
      console.error("Error loading user from localStorage:", error);
      return null;
    }
  };

  // Save user to localStorage
  const saveUserToStorage = (userData: User | null) => {
    try {
      if (userData) {
        localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(userData));
      } else {
        localStorage.removeItem(USER_STORAGE_KEY);
      }
    } catch (error) {
      console.error("Error saving user to localStorage:", error);
    }
  };

  // Debounced database update
  const scheduleDbUpdate = (userData: User) => {
    // Clear existing timer
    if (updateTimerRef.current) {
      clearTimeout(updateTimerRef.current);
    }

    // Schedule new update after 60 seconds
    updateTimerRef.current = setTimeout(async () => {
      try {
        await saveUser(userData);
        console.log("User data synced to database");
      } catch (error) {
        console.error("Error syncing user data to database:", error);
      }
    }, 60000); // 60 seconds
  };

  // Enhanced setUser function that handles localStorage and database sync
  const setUser = (userData: User | null) => {
    setUserState(userData);
    saveUserToStorage(userData);
    
    if (userData) {
      scheduleDbUpdate(userData);
    }
  };

  // Initialize user - check localStorage first, then Firestore
  const initializeUser = async (clerkId: string, emailAddress: string) => {
    if (isInitializedRef.current) return;
    
    setIsLoading(true);
    
    try {
      // Check if user exists in localStorage
      const cachedUser = loadUserFromStorage();
      
      if (cachedUser && cachedUser.clerkId === clerkId) {
        console.log("Loading user from localStorage cache");
        setUserState(cachedUser);
        
        // Set up Firestore listener for this user
        setupFirestoreListener(clerkId);
      } else {
        console.log("Fetching user from Firestore");
        // Fetch from Firestore and cache
        const fetchedUser = await findOrCreateUser(clerkId, emailAddress);
        setUserState(fetchedUser);
        saveUserToStorage(fetchedUser);
        
        // Set up Firestore listener
        setupFirestoreListener(clerkId);
      }
      
      // Mark as initialized
      localStorage.setItem(USER_INITIALIZED_KEY, "true");
      isInitializedRef.current = true;
      
    } catch (error) {
      console.error("Error initializing user:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Set up Firestore listener for real-time updates
  const setupFirestoreListener = (clerkId: string) => {
    // Clean up existing listener
    if (firestoreUnsubscribeRef.current) {
      firestoreUnsubscribeRef.current();
    }

    const userRef = doc(db, "users", clerkId);
    
    firestoreUnsubscribeRef.current = onSnapshot(
      userRef,
      (docSnapshot) => {
        if (docSnapshot.exists()) {
          const updatedUser = docSnapshot.data() as User;
          console.log("User data updated from Firestore");
          
          // Update both React state and localStorage
          setUserState(updatedUser);
          saveUserToStorage(updatedUser);
        }
      },
      (error) => {
        console.error("Error listening to user changes:", error);
      }
    );
  };

  // Clear user data (for logout/tab close)
  const clearUserData = () => {
    // Clear React state
    setUserState(null);
    
    // Clear localStorage
    localStorage.removeItem(USER_STORAGE_KEY);
    localStorage.removeItem(USER_INITIALIZED_KEY);
    
    // Clear timers
    if (updateTimerRef.current) {
      clearTimeout(updateTimerRef.current);
      updateTimerRef.current = null;
    }
    
    // Unsubscribe from Firestore listener
    if (firestoreUnsubscribeRef.current) {
      firestoreUnsubscribeRef.current();
      firestoreUnsubscribeRef.current = null;
    }
    
    // Reset initialization flag
    isInitializedRef.current = false;
  };

  // Handle browser tab close/refresh
  useEffect(() => {
    const handleBeforeUnload = () => {
      clearUserData();
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        // Optionally clear data when tab becomes hidden
        // Uncomment if you want to clear on tab switch
        // clearUserData();
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      
      // Cleanup on unmount
      if (updateTimerRef.current) {
        clearTimeout(updateTimerRef.current);
      }
      if (firestoreUnsubscribeRef.current) {
        firestoreUnsubscribeRef.current();
      }
    };
  }, []);

  // Initialize on mount if user was previously logged in
  useEffect(() => {
    const wasInitialized = localStorage.getItem(USER_INITIALIZED_KEY);
    if (wasInitialized && !isInitializedRef.current) {
      const cachedUser = loadUserFromStorage();
      if (cachedUser) {
        setUserState(cachedUser);
        setupFirestoreListener(cachedUser.clerkId);
        isInitializedRef.current = true;
      }
    }
  }, []);

  return (
    <UserContext.Provider 
      value={{ 
        user, 
        setUser, 
        isLoading, 
        initializeUser, 
        clearUserData 
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

// Custom hook for accessing the context
export const useUserContext = (): UserContextType => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUserContext must be used within a UserProvider");
  }
  return context;
};