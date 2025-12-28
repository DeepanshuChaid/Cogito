"use client";

import { createContext, useContext } from "react";
import type { ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import { getCurrentUser } from "../api/auth"; // your fetch function

type AuthContextType = {
  user: User | null;
  isPending: boolean;
  error: unknown | null;
};

export type User = {
  id: string;
  name: string;
  email: string;
  password: string;
  profilePicture: string;
  isVerified: boolean;
  instagram: string | null;
  facebook: string | null;
  bio: string | null;
  createdAt: string;
  updatedAt: string;
};
type CurrentUserResponse = {
  message: string;
  CACHED?: boolean;
  user: User;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);


export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const { isPending, error, data } = useQuery<CurrentUserResponse>({
    queryKey: ["currentUser"],
    queryFn: getCurrentUser,
    staleTime: 300 * 1000,
  });

  const user = data?.user ?? null;

  return (
    <AuthContext.Provider
      value={{
        user,
        isPending,
        error,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Hook for easy access
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be inside AuthProvider");
  return context;
};
