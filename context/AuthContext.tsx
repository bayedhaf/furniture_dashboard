// context/AuthContext.tsx
"use client";
import React, { createContext, useContext, useState } from "react";
import { User } from "@/types/auth";

const AuthContext = createContext<{
  user: User | null;
  managers: User[];
  addManager: (manager: User) => void;
}>({
  user: null,
  managers: [],
  addManager: () => {},
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User>({
    id: "1",
    name: "System Admin",
    role: "SA",
    locations: ["*"],
  });

  const [managers, setManagers] = useState<User[]>([]);

  const addManager = (manager: User) => {
    setManagers((prev) => [...prev, manager]);
  };

  return (
    <AuthContext.Provider value={{ user, managers, addManager }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
