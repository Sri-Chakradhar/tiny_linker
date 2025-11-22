"use client";
import { signOut } from "next-auth/react";

export default function Header() {
  return (
    <header className="flex justify-end p-4 border-b bg-white">
      <button
        onClick={() => signOut({ callbackUrl: "/login" })}
        className="px-4 py-2 border rounded-lg"
      >
        Logout
      </button>
    </header>
  );
}
