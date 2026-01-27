import { NextAuthOptions, type Session } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { MongoDBAdapter } from "@auth/mongodb-adapter";
import { getMongoClient } from "./mongodb";
import bcrypt from "bcryptjs";
import { ObjectId } from "mongodb";
import type { JWT } from "next-auth/jwt";


type AppUser = {
  id: string;
  name?: string;
  email: string;
};

const debugAuth = process.env.DEBUG_AUTH === "true";
const dbg = (...args: unknown[]) => {
  if (debugAuth) {
    console.log("[auth]", ...args);
  }
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

  const inputEmail = String(credentials.email).trim().toLowerCase();
  const inputPassword = String(credentials.password);
  dbg("authorize", { email: inputEmail });

        // If env-defined admin is present, verify against hashed or plain ADMIN_PASSWORD
        const adminEnvEmail = (process.env.ADMIN_EMAIL ?? "").trim().toLowerCase();
        if (inputEmail === adminEnvEmail) {
          const adminPassRaw = process.env.ADMIN_PASSWORD ?? "";
          const isHash = adminPassRaw.startsWith("$2");
          const adminOk = isHash
            ? await bcrypt.compare(inputPassword, adminPassRaw)
            : inputPassword === adminPassRaw.trim();
          dbg("env-admin", { match: true, ok: adminOk, isHash });
          if (adminPassRaw && adminOk) {
            const client = await getMongoClient();
            const db = client.db();
            const desiredHash = isHash ? adminPassRaw : await bcrypt.hash(adminPassRaw.trim(), 10);
            const user = await db
              .collection<{ _id: ObjectId; name?: string; email: string; password: string; role?: string }>("users")
              .findOne({ email: inputEmail });
            if (!user) {
              dbg("env-admin insert");
              const insertRes = await db.collection("users").insertOne({
                email: inputEmail,
                password: desiredHash,
                role: "admin",
                name: inputEmail,
              });
              return { id: String(insertRes.insertedId), name: inputEmail, email: inputEmail };
            }
            // Normalize existing admin record if needed (email casing, role, ensure hashed password presence)
            const needsPassword = typeof user.password !== "string" || !user.password.startsWith("$2");
            const updates: Record<string, unknown> = {};
            if (user.email !== inputEmail) updates.email = inputEmail;
            if (user.role !== "admin") updates.role = "admin";
            if (needsPassword) updates.password = desiredHash;
            if (Object.keys(updates).length) {
              dbg("env-admin update", Object.keys(updates));
              await db.collection("users").updateOne({ _id: user._id }, { $set: updates });
            }
            const appUser: AppUser = { id: String(user._id), name: user.name ?? inputEmail, email: inputEmail };
            return appUser;
          }
        }

        const client = await getMongoClient();
        const db = client.db();
          const escapeRegex = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
          const user = await db
            .collection<{ _id: ObjectId; name?: string; email: string; password: string }>("users")
            .findOne({ email: { $regex: `^${escapeRegex(inputEmail)}$`, $options: "i" } });
        if (!user) {
          dbg("no user", inputEmail);
          return null;
        }

  // Primary bcrypt check
  let ok = false;
  try {
    ok = await bcrypt.compare(inputPassword, user.password);
  } catch {
    ok = false;
  }
  // Fallback: legacy plaintext password migration
  const looksHashed = typeof user.password === "string" && user.password.startsWith("$2");
  if (!ok && !looksHashed && user.password === inputPassword) {
    const newHash = await bcrypt.hash(inputPassword, 10);
    await db.collection("users").updateOne({ _id: user._id }, { $set: { password: newHash } });
    dbg("migrated plaintext->bcrypt", inputEmail);
    ok = true;
  }
  if (!ok) {
    dbg("password failed", inputEmail);
    return null;
  }

        const appUser: AppUser = {
          id: String(user._id),
          name: user.name ?? user.email,
          email: user.email,
        };
          // Migrate stored email to lowercase for consistency
          if (user.email !== inputEmail) {
            await db.collection("users").updateOne({ _id: user._id }, { $set: { email: inputEmail } });
            dbg("normalized email", { from: user.email, to: inputEmail });
            appUser.email = inputEmail;
          }
        return appUser;
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      const t = token as JWT & { userId?: string; role?: string; locations?: string[]; name?: string; email?: string };
      if (user) {
        t.userId = (user as AppUser).id;
      }
      if (t.userId) {
        try {
          const client = await getMongoClient();
          const db = client.db();
          const doc = await db
            .collection<{ _id: ObjectId; role?: string; locations?: string[]; name?: string; email?: string }>("users")
            .findOne({ _id: new ObjectId(t.userId) }, { projection: { role: 1, locations: 1, name: 1, email: 1 } });
          if (doc?.role) t.role = doc.role;
          if (doc?.locations) t.locations = doc.locations;
          if (doc?.name) t.name = doc.name;
          if (doc?.email) t.email = doc.email;
        } catch {
          // ignore
        }
      }
      return t as JWT;
    },
    async session({ session, token }) {
      const t = token as JWT & { userId?: string; role?: string; locations?: string[]; name?: string; email?: string };
      const s = session as Session & { userId?: string; role?: string; locations?: string[] };
      if (t?.userId) s.userId = t.userId;
      if (t?.role) s.role = t.role;
      if (t?.locations) s.locations = t.locations;
      // keep session.user populated for convenience
      if (session.user) {
        if (t?.name) session.user.name = t.name;
        if (t?.email) session.user.email = t.email;
      }
      return session;
    },
  },
};
