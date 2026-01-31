import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

// Auth proxy: protect manager routes
export async function proxy(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

  // If not authenticated, redirect to login with callbackUrl
  if (!token) {
    const loginUrl = new URL("/auth/login", req.url);
    const callback = req.nextUrl.pathname + req.nextUrl.search;
    if (callback && callback !== "/auth/login") {
      loginUrl.searchParams.set("callbackUrl", callback);
    }
    return NextResponse.redirect(loginUrl);
  }

  // Ensure role is manager
  const role = (token as unknown as { role?: string }).role?.toLowerCase?.();
  if (role !== "manager") {
    return NextResponse.redirect(new URL("/auth/login", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/manager",
    "/manager/:path*",
  ],
};