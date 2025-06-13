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

  // Hook 2: User context hook
  const { user, initializeUser, clearUserData, isLoading, setUser } =
    useUserContext();

  const dummyClerkUser = user
    ? {
        id: user.clerkId,
        primaryEmailAddress: {
          emailAddress: user.email,
        },
        primaryPhoneNumber: {
          phoneNumber: "+1234567890", // Placeholder phone number
        },
        firstName: "John",
        lastName: "Doe",
        fullName: "John Doe",
        imageUrl: "https://placehold.co/100x100", // Placeholder avatar
        username: "johndoe",
        // Add any other fields your app expects from Clerk's user object
      } as UserResource
    : null;

  // Hook 1: Only call Clerk hook in production
  const clerkData = isDevelopment
    ? {
        isLoaded: true,
        isSignedIn: true,
        user: dummyClerkUser,
      }
    : useUser();
  const {
    isLoaded,
    isSignedIn,
    user: clerkUser,
  } = clerkData || {
    isLoaded: true,
    isSignedIn: true,
    user: null,
  };

  // Development mode: override with sample data
  useEffect(() => {
    if (isDevelopment) {
      const delay = setTimeout(() => {
        setUser(userSample);
      }, 2500); // 1 second delay

      return () => clearTimeout(delay); // Cleanup
    }
  }, [isDevelopment, setUser]);

  const isDevUserLoaded = isDevelopment && user?.clerkId === userSample.clerkId;

  return {
    user: isDevelopment ? userSample : user,
    isLoading: isDevelopment ? !isDevUserLoaded : isLoading,
    initializeUser,
    clearUserData,
    isLoaded: isDevelopment ? isDevUserLoaded : isLoaded,
    isSignedIn: isDevelopment ? isDevUserLoaded : isSignedIn ?? false,
    clerkUser:  clerkUser ?? null,
    setUser,
  };
}
