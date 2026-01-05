import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { MongoDBAdapter } from "@auth/mongodb-adapter";
import { getMongoClient } from "./mongodb";
import bcrypt from "bcryptjs";
// import bcrypt from "bcryptjs"; // If you plan to hash passwords

type AppUser = {
  id: string;
  name?: string;
  email: string;
};

export const authConfig: NextAuthOptions = {
  adapter: MongoDBAdapter(async () => await getMongoClient()),
  session: { strategy: "jwt" as const },
  pages: {
    signIn: "/auth/login",
  },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        // If env-defined admin is present, verify against hashed or plain ADMIN_PASSWORD
        if (credentials.email === process.env.ADMIN_EMAIL) {
          const adminPass = process.env.ADMIN_PASSWORD ?? "";
          if (adminPass && credentials.password === adminPass) {
            // Ensure admin exists in DB with hashed password
            const client = await getMongoClient();
            const db = client.db();
            const hashed = await bcrypt.hash(adminPass, 10);
            const user = await db
              .collection<{ _id: unknown; name?: string; email: string; password: string; role?: string }>("users")
              .findOne({ email: credentials.email });
            if (!user) {
              const insertRes = await db.collection("users").insertOne({
                email: credentials.email,
                password: hashed,
                role: "admin",
                name: credentials.email,
              });
              return { id: String(insertRes.insertedId), name: credentials.email, email: credentials.email };
            }
            const appUser: AppUser = { id: String(user._id), name: user.name ?? user.email, email: user.email };
            return appUser;
          }
        }

        const client = await getMongoClient();
        const db = client.db();
  const user = await db.collection<{ _id: unknown; name?: string; email: string; password: string }>("users").findOne({ email: credentials.email });
        if (!user) return null;

  // bcrypt compare (user.password should be a bcrypt hash)
  const ok = await bcrypt.compare(credentials.password, user.password);
  if (!ok) return null;

        const appUser: AppUser = {
          id: String(user._id),
          name: user.name ?? user.email,
          email: user.email,
        };
        return appUser;
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        // augment token with userId
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (token as any).userId = (user as AppUser).id;
      }
      return token;
    },
    async session({ session, token }) {
      if (token?.userId) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (session as any).userId = (token as any).userId;
      }
      return session;
    },
  },
};
