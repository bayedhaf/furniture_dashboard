import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authConfig } from "@/lib/auth";
import { getMongoClient } from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import path from "path";
// Vercel Blob: use dynamic import to avoid type resolution issues in some TS configs

export async function GET() {
  const session = await getServerSession(authConfig);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const client = await getMongoClient();
  const db = client.db();
  const userId = session.userId ?? (session.user as Record<string, unknown>)?.id;
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await db
    .collection<Record<string, unknown>>("users")
    .findOne({ _id: new ObjectId(String(userId)) }, { projection: { name: 1, email: 1, phone: 1, profileImageUrl: 1 } });

  const out = {
    name: user?.name ?? "",
    email: user?.email ?? (session.user?.email ?? ""),
    phone: user?.phone ?? "",
    profileImageUrl: user?.profileImageUrl ?? "",
  };
  return NextResponse.json(out);
}

export async function PUT(request: Request) {
  const session = await getServerSession(authConfig);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userId = session.userId ?? (session.user as Record<string, unknown>)?.id;
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Parse multipart/form-data via request.formData() when supported
  let form: FormData | null = null;
  try {
    // Request in Next.js route handlers supports formData(); guard via unknown cast
  // @ts-expect-error - runtime may provide formData
  form = await (request as unknown as { formData?: () => Promise<FormData> }).formData?.();
  } catch {
    form = null;
  }

  if (!form) {
    // If parsing fails, try reading json
    const body = await request.json().catch(() => ({}));
    const name = body.name ?? undefined;
    const phone = body.phone ?? undefined;
    const client = await getMongoClient();
    const db = client.db();
    const update: Record<string, unknown> = { updatedAt: new Date() };
    if (name !== undefined) update.name = String(name);
    if (phone !== undefined) update.phone = String(phone);
    await db.collection("users").updateOne({ _id: new ObjectId(String(userId)) }, { $set: update });
    return NextResponse.json({ ok: true });
  }

  const nameVal = form.get("name");
  const phoneVal = form.get("phone");
  const entry = form.get("profileImage");

  const update: Record<string, unknown> = { updatedAt: new Date() };
  if (nameVal !== null) update.name = String(nameVal);
  if (phoneVal !== null) update.phone = String(phoneVal);

  if (entry instanceof File) {
    try {
      const fileNameRaw = entry.name ?? `${Date.now()}`;
      const ext = path.extname(String(fileNameRaw)) || "";
      const filename = `profiles/${String(userId)}-${Date.now()}${ext}`;
      const blobToken = process.env.BLOB_READ_WRITE_TOKEN;
      if (!blobToken) {
        console.error("Missing BLOB_READ_WRITE_TOKEN env for Vercel Blob");
      } else {
  const { put } = await import("@vercel/blob");
        const res = await put(filename, entry, {
          access: "public",
          token: blobToken,
        });
        update.profileImageUrl = res.url;
      }
    } catch (e) {
      console.error("profile image blob upload failed", e);
    }
  }

  const client = await getMongoClient();
  const db = client.db();
  await db.collection("users").updateOne({ _id: new ObjectId(String(userId)) }, { $set: update });
  return NextResponse.json({ ok: true });
}
