"use client"
import { useEffect } from "react";
import { useAuth } from "@clerk/nextjs";
import { useUserContext } from "@/context/user-context";

/**
 * Hook to handle user logout and cleanup
 * Use this in your main layout or app component
 */
export const useLogoutHandler = () => {
  const { signOut } = useAuth();
  const { clearUserData } = useUserContext();

  // Custom logout function that clears user data
  const handleLogout = async () => {
    try {
      // Clear user data first
      clearUserData();
      
      // Then sign out from Clerk
      await signOut();
    } catch (error) {
      console.error("Error during logout:", error);
    }
  };

  return { handleLogout };
};

/**
 * Component to handle automatic cleanup on navigation away
 * Place this in your main layout or app component
 */
export const UserCleanupHandler = () => {
  const { clearUserData } = useUserContext();

  useEffect(() => {
    // Handle page refresh/navigation away
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      clearUserData();
    };

    // Handle visibility change (tab switching, minimizing)
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        // Optionally clear on tab hide - uncomment if needed
        // clearUserData();
      }
    };

    // Add event listeners
    window.addEventListener('beforeunload', handleBeforeUnload);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Cleanup
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [clearUserData]);

  return null; // This component doesn't render anything
};