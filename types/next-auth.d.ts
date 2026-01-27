import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    userId?: string;
    role?: string;
    locations?: string[];
    user: DefaultSession["user"] & { id?: string | null };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    userId?: string;
    role?: string;
    locations?: string[];
  }
}
