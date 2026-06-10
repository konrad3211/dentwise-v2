"use client";
import { syncUser } from "@/lib/actions/users";
import { useUser } from "@clerk/nextjs";
import { useEffect } from "react";

const UserSync = () => {
  const { isSignedIn, isLoaded } = useUser();
  useEffect(() => {
    const handleUserSync = async () => {
      if (isLoaded && isSignedIn) {
        try {
          await syncUser();
        } catch (error) {
          console.log("Failed to sync user", error);
        }
      }
    };
    handleUserSync();
  }, [isLoaded, isSignedIn]);
  return null;
};

export default UserSync;

// isLoaded   -> czy Clerk już się załadował
// isSignedIn -> czy użytkownik jest zalogowany
