"use client";
import React from "react";
import { useSession } from "next-auth/react";

type Props = {
  roles: string[];
  children: React.ReactNode;
};

export default function RequireRole({ roles, children }: Props) {
  const { data: session, status } = useSession();
  if (status === "loading") return <div className="p-4">Loading...</div>;
  if (!session) return <div className="p-4 text-red-600">Not authenticated.</div>;

  const allowed = roles.map((r) => r.toLowerCase());
  const role = (session as typeof session & { role?: string }).role?.toLowerCase();
  if (!role || !allowed.includes(role)) {
    return <div className="p-4 text-red-600">Forbidden: insufficient role.</div>;
  }
  return <>{children}</>;
}
