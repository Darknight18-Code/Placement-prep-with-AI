"use client";

import { useUser, useAuth as useClerkAuth } from "@clerk/nextjs";
import { createContext, useContext, useState, useEffect, ReactNode } from "react";

interface UserData {
  userId: string;
  email: string;
  name: string;
  xp?: number;
  streak?: number;
  badges?: string[];
  skills?: Record<string, number>;
}

interface AuthContextType {
  user: UserData | null;
  loading: boolean;
  isSignedIn: boolean;
  signOut: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { user: clerkUser, isLoaded: clerkLoaded } = useUser();
  const { isSignedIn, signOut: clerkSignOut } = useClerkAuth();
  const [dbUser, setDbUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDbUser = async () => {
      if (!clerkLoaded) {
        setLoading(true);
        return;
      }

      if (!clerkUser || !isSignedIn) {
        setDbUser(null);
        setLoading(false);
        return;
      }

      try {
        // Sync user with database
        const res = await fetch("/api/users/sync", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
        });

        if (res.ok) {
          const data = await res.json();
          setDbUser(data.user);
        }
      } catch (error) {
        console.error("Error fetching user:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDbUser();
  }, [clerkUser, clerkLoaded, isSignedIn]);

  const signOut = async () => {
    await clerkSignOut();
    setDbUser(null);
  };

  const refreshUser = async () => {
    if (clerkUser && isSignedIn) {
      try {
        const res = await fetch("/api/users/sync", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
        });

        if (res.ok) {
          const data = await res.json();
          setDbUser(data.user);
        }
      } catch (error) {
        console.error("Error refreshing user:", error);
      }
    }
  };

  const user = dbUser || (clerkUser ? {
    userId: clerkUser.id,
    email: clerkUser.emailAddresses[0]?.emailAddress || "",
    name: clerkUser.fullName || clerkUser.firstName || "User",
  } : null);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading: loading || !clerkLoaded,
        isSignedIn: isSignedIn || false,
        signOut,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

