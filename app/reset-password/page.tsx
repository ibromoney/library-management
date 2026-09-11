"use client";

import { FormEvent, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

const supabase = createClient();

export default function ResetPasswordPage() {
  const router = useRouter();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function checkSession() {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (cancelled) return;

      if (!session) {
        setError(
          "This password reset link is invalid or has expired."
        );
      }

      setLoading(false);
    }

    void checkSession();

    return () => {
      cancelled = true;
    };
  }, []);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();

    setError("");
    setMessage("");

    if (password.length < 6) {
      setError(
        "Password must be at least 6 characters long."
      );
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setSaving(true);

    const { error } = await supabase.auth.updateUser({
      password,
    });

    if (error) {
      setError(error.message);
      setSaving(false);
      return;
    }

    setMessage(
      "Password updated successfully. Redirecting to login..."
    );

    await supabase.auth.signOut();

    setTimeout(() => {
      router.push("/login");
    }, 2000);
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-100">
        <p>Checking reset link...</p>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-100 px-6">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-lg">
        <h1 className="text-3xl font-bold">
          Reset Password
        </h1>

        <p className="mt-2 text-gray-500">
          Enter your new password below.
        </p>

        {error && (
          <div className="mt-6 rounded-lg bg-red-50 p-4 text-sm text-red-600">
            {error}
          </div>
        )}

        {!error && (
          <form
            onSubmit={handleSubmit}
            className="mt-8 space-y-5"
          >
            <div>
              <label className="mb-2 block text-sm font-medium">
                New Password
              </label>

              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) =>
                  setPassword(e.target.value)
                }
                placeholder="Enter new password"
                className="w-full rounded-lg border px-4 py-3 outline-none focus:ring-2 focus:ring-black"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">
                Confirm Password
              </label>

              <input
                type="password"
                required
                minLength={6}
                value={confirmPassword}
                onChange={(e) =>
                  setConfirmPassword(e.target.value)
                }
                placeholder="Confirm new password"
                className="w-full rounded-lg border px-4 py-3 outline-none focus:ring-2 focus:ring-black"
              />
            </div>

            {message && (
              <div className="rounded-lg bg-green-50 p-4 text-sm text-green-700">
                {message}
              </div>
            )}

            <button
              type="submit"
              disabled={saving}
              className="w-full rounded-lg bg-black px-4 py-3 font-medium text-white hover:bg-gray-800 disabled:opacity-50"
            >
              {saving
                ? "Updating..."
                : "Update Password"}
            </button>
          </form>
        )}

        {error && (
          <a
            href="/forgot-password"
            className="mt-6 block text-center text-sm underline"
          >
            Request a new reset link
          </a>
        )}
      </div>
    </main>
  );
}

