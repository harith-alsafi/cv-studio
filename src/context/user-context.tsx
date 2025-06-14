"use client";
import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
  useRef,
} from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase-config";
import {
  User,
  ResumeInfo,
  Generation,
  GenerationInput,
  GenerationOutput,
} from "@/types/user";
import { saveUser, findOrCreateUser } from "@/lib/firestore-db";
import { Resume } from "@/types/resume";
import {
  clearUserStorage,
  isUserInitialized,
  loadCurrentGenerationFromStorage,
  loadUserFromStorage,
  saveCurrentGenerationToStorage,
  saveUserToStorage,
  setUserInitialized,
} from "@/lib/local-storage";
import { TemplateEntry } from "@/types/latex-template";
import { LLMGenerateResume } from "@/lib/llm-logic";
import { deletePdfFromR2, generatePdf, uploadPdfToR2 } from "@/lib/pdf-gen";

// Define the shape of the context
interface UserContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  isLoading: boolean;
  currentGeneration: Generation | null;
  setCurrentGeneration: (generation: Generation | null) => void;
  initializeUser: (clerkId: string, emailAddress: string) => Promise<void>;
  clearUserData: () => void;

  // Resume management functions
  addResumeInfo: (resumeInfo: ResumeInfo) => void;
  findResumeByName: (name: string) => ResumeInfo | null;
  updateResumeInResumeInfo: (resumeName: string, updatedResume: Resume) => void;
  deleteResumeInfo: (resumeName: string) => void;

  // Generation management functions
  addGeneration: (generation: Generation) => void;
  findGenerationById: (id: string) => Generation | null;
  updateResumeInGeneration: (
    generationId: string,
    updatedResume: Resume
  ) => void;
  getNewGenerationId: () => string;
  deleteGeneraion: (id: string) => boolean;

  newGeneration: (
    resumeName: string,
    template: TemplateEntry,
    jobDescription: string,
    onPdfGen?: (blob: Blob) => void
  ) => Promise<Generation | null>;
}

// Create the context
const UserContext = createContext<UserContextType | undefined>(undefined);

// Provider component
export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUserState] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [currentGeneration, setCurrentGeneration] = useState<Generation | null>(
    null
  );

  // Refs to manage timers and prevent memory leaks
  const updateTimerRef = useRef<NodeJS.Timeout | null>(null);
  const firestoreUnsubscribeRef = useRef<(() => void) | null>(null);
  const isInitializedRef = useRef(false);

  // Compare lastUpdated timestamps to determine which version is newer
  const isDataNewer = (data1: User, data2: User): boolean => {
    if (!data1.lastUpdated && !data2.lastUpdated) return false;
    if (!data1.lastUpdated) return false;
    if (!data2.lastUpdated) return true;

    const timestamp1 =
      typeof data1.lastUpdated === "string"
        ? new Date(data1.lastUpdated)
        : data1.lastUpdated;
    const timestamp2 =
      typeof data2.lastUpdated === "string"
        ? new Date(data2.lastUpdated)
        : data2.lastUpdated;

    return timestamp1 > timestamp2;
  };

  const getNewGenerationId = (): string => {
    const generationsLength = user?.data.generations
      ? user.data.generations.length
      : 0;
    return `gen_${Date.now()}_${generationsLength + 1}`;
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
          lastUpdated: new Date(),
        };

        await saveUser(updatedUserData);
        console.log(
          "User data synced to database with timestamp:",
          updatedUserData.lastUpdated
        );

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
      const updatedUserData: User = {
        ...userData,
        lastUpdated: new Date(),
      };

      setUserState(updatedUserData);
      saveUserToStorage(updatedUserData);
      scheduleDbUpdate(updatedUserData);
    } else {
      setUserState(null);
      saveUserToStorage(null);
    }
  };

  // Resume management functions
  const addResumeInfo = (resumeInfo: ResumeInfo) => {
    if (!user) return;

    const updatedUser = {
      ...user,
      data: {
        ...user.data,
        resumes: [...user.data.resumes, resumeInfo],
      },
    };

    setUser(updatedUser);
  };

  const findResumeByName = (name: string): ResumeInfo | null => {
    if (!user) return null;

    return (
      user.data.resumes.find(
        (resume) => resume.name.toLowerCase() === name.toLowerCase()
      ) || null
    );
  };

  const updateResumeInResumeInfo = (
    resumeName: string,
    updatedResume: Resume
  ) => {
    if (!user) return;

    const updatedResumes = user.data.resumes.map((resumeInfo) =>
      resumeInfo.name === resumeName
        ? { ...resumeInfo, resume: updatedResume }
        : resumeInfo
    );

    const updatedUser = {
      ...user,
      data: {
        ...user.data,
        resumes: updatedResumes,
      },
    };

    setUser(updatedUser);
  };

  const deleteResumeInfo = (resumeName: string) => {
    if (!user) return;
    const updatedResumes = user.data.resumes.filter(
      (resumeInfo) => resumeInfo.name !== resumeName
    );
    const updatedUser = {
      ...user,
      data: {
        ...user.data,
        resumes: updatedResumes,
      },
    };
    setUser(updatedUser);
  };

  // Generation management functions
  const addGeneration = (generation: Generation) => {
    if (!user) return;

    const updatedUser = {
      ...user,
      data: {
        ...user.data,
        generations: [...user.data.generations, generation],
      },
    };

    setUser(updatedUser);
  };

  const findGenerationById = (id: string): Generation | null => {
    if (!user) return null;

    return (
      user.data.generations.find((generation) => generation.id === id) || null
    );
  };

  const updateResumeInGeneration = (
    generationId: string,
    updatedResume: Resume
  ) => {
    if (!user) return;

    const updatedGenerations = user.data.generations.map((generation) =>
      generation.id === generationId
        ? {
            ...generation,
            output: {
              ...generation.output,
              generatedResume: updatedResume,
            },
          }
        : generation
    );

    const updatedUser = {
      ...user,
      data: {
        ...user.data,
        generations: updatedGenerations,
      },
    };

    setUser(updatedUser);

    // Update current generation if it matches the updated one
    if (currentGeneration && currentGeneration.id === generationId) {
      const updatedCurrentGeneration = {
        ...currentGeneration,
        output: {
          ...currentGeneration.output,
          generatedResume: updatedResume,
        },
      };
      setCurrentGeneration(updatedCurrentGeneration);
      saveCurrentGenerationToStorage(updatedCurrentGeneration);
    }
  };

  const deleteGeneraion = (id: string): boolean => {
    if (!user) return false;

    const updatedGenerations = user.data.generations.filter(
      (generation) => generation.id !== id
    );

    if (updatedGenerations.length === user.data.generations.length) {
      // No generation was deleted
      return false;
    }

    const updatedUser = {
      ...user,
      data: {
        ...user.data,
        generations: updatedGenerations,
      },
    };

    setUser(updatedUser);

    // If the deleted generation was the current one, clear it
    if (currentGeneration && currentGeneration.id === id) {
      setCurrentGeneration(null);
      saveCurrentGenerationToStorage(null);
    }

    // delete from r2
    const fileName = `${id}.pdf`;
    deletePdfFromR2(user.clerkId, fileName)
      .then((success) => {
        if (!success) {
          console.error(`Failed to delete PDF for generation ${id} from R2`);
        } else {
          console.log(`Successfully deleted PDF for generation ${id} from R2`);
        }
      })
      .catch((error) => {
        console.error(
          `Error deleting PDF for generation ${id} from R2:`,
          error
        );
      });

    return true;
  };

  // Enhanced setCurrentGeneration function
  const setCurrentGenerationEnhanced = (generation: Generation | null) => {
    setCurrentGeneration(generation);
    saveCurrentGenerationToStorage(generation);
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
          console.log(
            "Both versions have same timestamp, using Firestore version"
          );
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

      // Load current generation from localStorage
      const cachedGeneration = loadCurrentGenerationFromStorage();
      if (cachedGeneration) {
        setCurrentGeneration(cachedGeneration);
      }

      // Mark as initialized
      setUserInitialized(true);
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
            console.log(
              "Local data is newer or same, ignoring Firestore update"
            );
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
    setCurrentGeneration(null);

    // Clear localStorage
    clearUserStorage();

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

  const newGeneration = async (
    resumeName: string,
    template: TemplateEntry,
    jobDescription: string,
    onPdfGen?: (blob: Blob) => void
  ): Promise<Generation | null> => {
    if (!user) {
      console.error("User is not logged in");
      return null;
    }

    const resumeInfo = findResumeByName(resumeName);

    if (!resumeInfo) {
      console.error(`Resume with name "${resumeName}" not found`);
      return null;
    }

    const newGenId = getNewGenerationId();
    const generationInput: GenerationInput = {
      resumeName: resumeName,
      templateId: template.id,
      jobDescription: jobDescription,
    };

    const resumeDataLlm = await LLMGenerateResume(
      resumeInfo.resume,
      jobDescription
    );

    if (!resumeDataLlm) {
      console.error("Failed to generate PDF:");
      throw new Error(`Failed to generate PDF:`);
    }

    const pdfBuffer = await generatePdf(resumeDataLlm, template.data);
    const blob = new Blob([pdfBuffer], { type: "application/pdf" });

    if (onPdfGen) {
      onPdfGen(blob);
    }

    const url = await uploadPdfToR2(
      user?.clerkId || "",
      pdfBuffer,
      `${newGenId}.pdf`
    );

    const generationOutput: GenerationOutput = {
      createdAt: new Date(),
      generatedResume: resumeDataLlm,
      pdfUrl: url,
    };

    const newGeneration: Generation = {
      id: newGenId,
      input: generationInput,
      output: generationOutput,
    };

    // Add the new generation to the user data
    addGeneration(newGeneration);

    return newGeneration;
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
          lastUpdated: new Date(),
        }).catch(console.error);
      }
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        // Optionally sync when tab becomes hidden
        if (user && updateTimerRef.current) {
          clearTimeout(updateTimerRef.current);
          saveUser({
            ...user,
            lastUpdated: new Date(),
          }).catch(console.error);
        }
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      document.removeEventListener("visibilitychange", handleVisibilityChange);

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
    const wasInitialized = isUserInitialized();
    if (wasInitialized && !isInitializedRef.current) {
      const cachedUser = loadUserFromStorage();
      if (cachedUser) {
        setUserState(cachedUser);
        setupFirestoreListener(cachedUser.clerkId);

        // Load current generation
        const cachedGeneration = loadCurrentGenerationFromStorage();
        if (cachedGeneration) {
          setCurrentGeneration(cachedGeneration);
        }

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
        currentGeneration,
        setCurrentGeneration: setCurrentGenerationEnhanced,
        initializeUser,
        clearUserData,

        // Resume management functions
        addResumeInfo,
        findResumeByName,
        updateResumeInResumeInfo,
        deleteResumeInfo,

        // Generation management functions
        addGeneration,
        findGenerationById,
        updateResumeInGeneration,
        getNewGenerationId,
        deleteGeneraion,

        newGeneration,
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
