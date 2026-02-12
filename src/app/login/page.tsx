"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [message, setMessage] = useState("");

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const supabase = createClient();

    if (mode === "login") {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        setMessage(error.message);
        return;
      }

      router.push("/dashboard");
      router.refresh();
      return;
    }

    const { error } = await supabase.auth.signUp({ email, password });
    if (error) {
      setMessage(error.message);
      return;
    }

    setMessage("Account created. Check your email if confirmation is enabled.");
  }

  return (
    <div className="min-h-screen grid place-items-center px-4 bg-base">
      <form onSubmit={onSubmit} className="w-full max-w-sm space-y-4 rounded border border-line bg-white p-6">
        <h1 className="text-2xl font-semibold tracking-tight">BENCHmark</h1>
        <p className="text-sm text-gray-700">Minimal macro tracking for lifters.</p>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setMode("login")}
            className={`rounded border px-3 py-1 text-sm ${
              mode === "login" ? "bg-black text-white" : "border-line"
            }`}
          >
            Login
          </button>
          <button
            type="button"
            onClick={() => setMode("signup")}
            className={`rounded border px-3 py-1 text-sm ${
              mode === "signup" ? "bg-black text-white" : "border-line"
            }`}
          >
            Sign Up
          </button>
        </div>
        <label className="block text-sm">
          Email
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
            className="mt-1 w-full rounded border border-line px-3 py-2"
          />
        </label>
        <label className="block text-sm">
          Password
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
            className="mt-1 w-full rounded border border-line px-3 py-2"
          />
        </label>
        <button type="submit" className="w-full rounded bg-black px-4 py-2 text-sm text-white">
          {mode === "login" ? "Login" : "Create Account"}
        </button>
        {message ? <p className="text-sm text-gray-700">{message}</p> : null}
      </form>
    </div>
  );
}
