"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Scale } from "lucide-react";

function LoginForm() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const params = useSearchParams();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    setLoading(false);
    if (res.ok) {
      router.push(params.get("next") || "/admin");
      router.refresh();
    } else {
      setError("Incorrect password.");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-sm bg-white rounded-md p-8 shadow-lg space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <div className="w-8 h-8 rounded bg-crimson-800 text-white flex items-center justify-center">
          <Scale className="w-5 h-5" />
        </div>
        <span className="font-serif text-lg font-extrabold text-slate-900">LawsForum Admin</span>
      </div>
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
        autoFocus
        required
        className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-crimson-700"
      />
      {error && <p className="text-xs text-red-600">{error}</p>}
      <button
        type="submit"
        disabled={loading}
        className="w-full bg-crimson-800 hover:bg-crimson-700 text-white text-sm font-bold py-2 rounded transition-colors disabled:opacity-50"
      >
        {loading ? "Checking…" : "Log In"}
      </button>
    </form>
  );
}

export default function AdminLoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 px-4">
      <Suspense fallback={null}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
