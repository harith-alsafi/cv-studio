import { useUserContext } from "@/context/user-context";
import { User, userSample } from "@/types/user";
import { useUser } from "@clerk/nextjs";
import type { UserResource } from "@clerk/types";
import { useEffect } from "react";

export interface UseCombinedUser {
  user: User | null;
  isLoading: boolean;
  initializeUser: (clerkId: string, emailAddress: string) => Promise<void>;
  clearUserData: () => void;
  isLoaded: boolean;
  isSignedIn: boolean;
  clerkUser: UserResource | null;
  setUser: (user: User | null) => void;
}

export function useCombinedUser(): UseCombinedUser {
  const isDevelopment = process.env.NODE_ENV === "development";

  // Hook 1: Only call Clerk hook in production
  const clerkData = isDevelopment ? null : useUser();
  const {
    isLoaded,
    isSignedIn,
    user: clerkUser,
  } = clerkData || {
    isLoaded: true,
    isSignedIn: true,
    user: null,
  };

  // Hook 2: User context hook
  const { user, initializeUser, clearUserData, isLoading, setUser } =
    useUserContext();

  // Development mode: override with sample data
  useEffect(() => {
    if (isDevelopment) {
      // Auto-load sample data in development
      setUser(userSample);
    }
  }, [isDevelopment, setUser]);

  // Return combined interface
  return {
    user: isDevelopment ? userSample : user,
    isLoading: isDevelopment ? false : isLoading,
    initializeUser,
    clearUserData,
    isLoaded: isDevelopment ? true : isLoaded,
    isSignedIn: isDevelopment ? true : isSignedIn ?? false,
    clerkUser: isDevelopment ? null : clerkUser ?? null, // No clerk user in dev mode
    setUser,
  };
}
