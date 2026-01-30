"use client";

import { signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";

interface LogoutButtonProps {
  className?: string;
  label?: React.ReactNode;
  redirectTo?: string; // defaults to /auth/login
  variant?: "default" | "destructive" | "ghost" | "link" | "outline" | "secondary";
  size?: "default" | "sm" | "lg" | "icon";
}

export function LogoutButton({ className, label = "Logout", redirectTo = "/auth/login", variant = "outline", size = "default" }: LogoutButtonProps) {
  const handleLogout = async () => {
    // NextAuth signOut will clear the session cookie and can redirect client-side
    await signOut({ callbackUrl: redirectTo });
  };

  return (
  <Button variant={variant} size={size} className={className} onClick={handleLogout}>
      {label}
    </Button>
  );
}
