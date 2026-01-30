"use client";
import React from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

type Props = {
  roles: string[];
  children: React.ReactNode;
};

export default function RequireRole({ roles, children }: Props) {
  const { data: session, status } = useSession();
  const router = useRouter();

  // Redirect unauthenticated users to login using an effect to avoid updating router during render
  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/auth/login");
    }
  }, [status, router]);

  if (status === "loading") return <div className="p-4">Loading...</div>;
  if (!session) return null;

  const allowed = roles.map((r) => r.toLowerCase());
  const role = (session as typeof session & { role?: string }).role?.toLowerCase();
  if (!role || !allowed.includes(role)) {
    // For authenticated but unauthorized users, optionally redirect or show forbidden
    return <div className="p-4 text-red-600">Forbidden: insufficient role.</div>;
  }
  return <>{children}</>;
}
