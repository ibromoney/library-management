"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export default function ForgotPasswordPage() {
  const supabase = createClient();

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();

    setLoading(true);
    setMessage("");
    setError("");

    const { error } = await supabase.auth.resetPasswordForEmail(
      email,
      {
        redirectTo: `${window.location.origin}/reset-password`,
      }
    );

    if (error) {
      setError(error.message);
    } else {
      setMessage(
        "If an account exists with this email, a password reset link has been sent."
      );
    }

    setLoading(false);
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-100 px-6">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-lg">
        <Link
          href="/login"
          className="text-sm text-gray-500 hover:underline"
        >
          ← Back to login
        </Link>

        <h1 className="mt-6 text-3xl font-bold">
          Forgot Password?
        </h1>

        <p className="mt-2 text-gray-500">
          Enter your email address and we will send you a
          password reset link.
        </p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
          <div>
            <label className="mb-2 block text-sm font-medium">
              Email Address
            </label>

            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full rounded-lg border px-4 py-3 outline-none focus:ring-2 focus:ring-black"
            />
          </div>

          {error && (
            <div className="rounded-lg bg-red-50 p-4 text-sm text-red-600">
              {error}
            </div>
          )}

          {message && (
            <div className="rounded-lg bg-green-50 p-4 text-sm text-green-700">
              {message}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-black px-4 py-3 font-medium text-white hover:bg-gray-800 disabled:opacity-50"
          >
            {loading ? "Sending..." : "Send Reset Link"}
          </button>
        </form>
      </div>
    </main>
  );
}