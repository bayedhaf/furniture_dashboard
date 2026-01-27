import React from "react";
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#F8F9FA] text-center px-4">
      <h1 className="text-5xl font-bold text-[#1B3A57] mb-2">404</h1>

      <p className="text-[#6C757D] mb-6">
        The page you are looking for does not exist.
      </p>

      <Link
        href="/"
        className="rounded-md bg-[#007B7F] px-5 py-2 text-white font-medium hover:bg-[#00686C] transition-colors"
      >
        Go back home
      </Link>
    </div>
  );
}
