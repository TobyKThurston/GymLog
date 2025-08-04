// src/components/AuthForm.tsx
"use client";

import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { auth } from "@/lib/firebase";
import { GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth";

export default function AuthForm() {
  const { user, loading } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [working, setWorking] = useState(false);

  const signInWithGoogle = async () => {
    setError(null);
    setWorking(true);
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (e: any) {
      setError(e.message || "Google sign-in failed");
    } finally {
      setWorking(false);
    }
  };

  if (loading) return <div className="p-4">Loading auth...</div>;

  if (user) {
    return (
      <div className="flex items-center gap-4 p-4 bg-white/5 rounded max-w-md mx-auto">
        <div className="flex-1">
          Signed in as <span className="font-bold">{user.displayName || user.email}</span>
        </div>
        <button
          onClick={() => signOut(auth)}
          className="px-3 py-1 bg-red-600 rounded text-sm"
        >
          Log out
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto bg-white/5 p-6 rounded-lg">
      {error && <div className="text-red-400 mb-2 text-sm">{error}</div>}
      <button
        onClick={signInWithGoogle}
        disabled={working}
        className="w-full py-2 bg-white text-black rounded font-semibold flex items-center justify-center gap-2"
      >
        {working ? "Signing in..." : "Sign in with Google"}
      </button>
    </div>
  );
}

