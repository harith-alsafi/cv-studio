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

  // Compare lastUpdated timestamps to determine which version is newer
  const isDataNewer = (data1: User, data2: User): boolean => {
    if (!data1.lastUpdated && !data2.lastUpdated) return false;
    if (!data1.lastUpdated) return false;
    if (!data2.lastUpdated) return true;
    
    const timestamp1 = typeof data1.lastUpdated === 'string' 
      ? new Date(data1.lastUpdated).getTime() 
      : data1.lastUpdated.getTime();
    const timestamp2 = typeof data2.lastUpdated === 'string' 
      ? new Date(data2.lastUpdated).getTime() 
      : data2.lastUpdated.getTime();
    
    return timestamp1 > timestamp2;
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
        // Update lastUpdated timestamp before saving
        const updatedUserData = {
          ...userData,
          lastUpdated: new Date()
        };
        
        await saveUser(updatedUserData);
        console.log("User data synced to database with timestamp:", updatedUserData.lastUpdated);
        
        // Update local state with the new timestamp
        setUserState(updatedUserData);
        saveUserToStorage(updatedUserData);
      } catch (error) {
        console.error("Error syncing user data to database:", error);
      }
    }, 60000); // 60 seconds
  };

  // Enhanced setUser function that handles localStorage and database sync
  const setUser = (userData: User | null) => {
    if (userData) {
      // Add/update lastUpdated timestamp for local changes
      const updatedUserData = {
        ...userData,
        lastUpdated: new Date()
      };
      
      setUserState(updatedUserData);
      saveUserToStorage(updatedUserData);
      scheduleDbUpdate(updatedUserData);
    } else {
      setUserState(null);
      saveUserToStorage(null);
    }
  };

  // Initialize user - check localStorage first, then Firestore, sync based on lastUpdated
  const initializeUser = async (clerkId: string, emailAddress: string) => {
    if (isInitializedRef.current) return;
    
    setIsLoading(true);
    
    try {
      // Check if user exists in localStorage
      const cachedUser = loadUserFromStorage();
      
      if (cachedUser && cachedUser.clerkId === clerkId) {
        console.log("Found user in localStorage cache");
        
        // Fetch from Firestore to compare timestamps
        const firestoreUser = await findOrCreateUser(clerkId, emailAddress);
        
        // Compare lastUpdated timestamps to determine which is newer
        let finalUser: User;
        
        if (isDataNewer(cachedUser, firestoreUser)) {
          console.log("localStorage version is newer, using cached data");
          finalUser = cachedUser;
          // Schedule an immediate sync to update Firestore
          scheduleDbUpdate(cachedUser);
        } else if (isDataNewer(firestoreUser, cachedUser)) {
          console.log("Firestore version is newer, updating cache");
          finalUser = firestoreUser;
          saveUserToStorage(firestoreUser);
        } else {
          console.log("Both versions have same timestamp, using Firestore version");
          finalUser = firestoreUser;
          saveUserToStorage(firestoreUser);
        }
        
        setUserState(finalUser);
        setupFirestoreListener(clerkId);
      } else {
        console.log("No cached user found, fetching from Firestore");
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
          const currentUser = user;
          
          // Only update if the Firestore version is newer than our current version
          if (!currentUser || isDataNewer(updatedUser, currentUser)) {
            console.log("Firestore data is newer, updating local state");
            setUserState(updatedUser);
            saveUserToStorage(updatedUser);
          } else {
            console.log("Local data is newer or same, ignoring Firestore update");
          }
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
      // Force immediate sync before closing if there are pending changes
      if (updateTimerRef.current && user) {
        clearTimeout(updateTimerRef.current);
        // Note: You might want to use navigator.sendBeacon for more reliable sync on close
        saveUser({
          ...user,
          lastUpdated: new Date()
        }).catch(console.error);
      }
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        // Optionally sync when tab becomes hidden
        if (user && updateTimerRef.current) {
          clearTimeout(updateTimerRef.current);
          saveUser({
            ...user,
            lastUpdated: new Date()
          }).catch(console.error);
        }
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
  }, [user]);

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