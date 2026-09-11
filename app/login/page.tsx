"use client";

import { FormEvent, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
const router = useRouter();
const supabase = createClient();

const [email, setEmail] = useState("");
const [password, setPassword] = useState("");

const [loading, setLoading] = useState(false);
const [error, setError] = useState("");

async function handleLogin(e: FormEvent) {
e.preventDefault();


setLoading(true);
setError("");

try {
  const { data, error } =
    await supabase.auth.signInWithPassword({
      email,
      password,
    });

  if (error) {
    throw error;
  }

  if (!data.user) {
    throw new Error("Login failed.");
  }

  // Get the user's role
  const { data: profile, error: profileError } =
    await supabase
      .from("profiles")
      .select("role")
      .eq("id", data.user.id)
      .single();

  if (profileError) {
    throw new Error(
      "User profile could not be found."
    );
  }

  if (profile.role === "librarian") {
    router.replace("/librarian/dashboard");
  } else {
    router.replace("/student/dashboard");
  }
} catch (err: unknown) {
  const errorMessage =
    err instanceof Error
      ? err.message
      : "Invalid email or password.";

  setError(errorMessage);
} finally {
  setLoading(false);
}


}

return ( <main className="flex min-h-screen items-center justify-center bg-gray-100 p-6"> <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-lg"> <h1 className="text-center text-3xl font-bold text-black">
Welcome Back </h1>


    <p className="mt-2 text-center text-gray-500">
      Login to your library account
    </p>

    {error && (
      <div className="mt-5 rounded-lg bg-red-100 p-3 text-sm text-red-700">
        {error}
      </div>
    )}

    <form
      onSubmit={handleLogin}
      className="mt-6 space-y-5"
    >
      <div>
        <label className="mb-2 block font-medium text-black">
          Email
        </label>

        <input
          type="email"
          required
          value={email}
          onChange={(e) =>
            setEmail(e.target.value)
          }
          placeholder="Enter your email"
          className="w-full rounded-lg border p-3 outline-none text-black"
        />
      </div>

      <div>
        <label className="mb-2 block font-medium text-black">
          Password
        </label>

        <input
          type="password"
          required
          value={password}
          onChange={(e) =>
            setPassword(e.target.value)
          }
          placeholder="Enter your password"
          className="w-full rounded-lg border p-3  text-black"
        />

        <div className="mt-2 text-right">
          <Link
            href="/forgot-password"
            className="text-sm text-gray-600 hover:underline"
          >
            Forgot password?
          </Link>
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-lg bg-black py-3 text-white transition hover:bg-gray-800 disabled:opacity-50"
      >
        {loading
          ? "Logging in..."
          : "Login"}
      </button>
    </form>

    <p className="mt-6 text-center text-gray-600">
      Don&apos;t have an account?{" "}
      <button
        onClick={() =>
          router.push("/register")
        }
        className="font-semibold text-black underline"
      >
        Register
      </button>
    </p>
  </div>
</main>


);
}
