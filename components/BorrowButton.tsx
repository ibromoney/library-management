"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function BorrowButton({
  bookId,
  available,
}: {
  bookId: number;
  available: boolean;
}) {
  const supabase = createClient();
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function borrowBook() {
    setLoading(true);
    setError("");
    setMessage("");

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/login");
        return;
      }

      const { data, error } = await supabase.rpc(
        "borrow_book",
        {
          p_book_id: bookId,
        }
      );

      if (error) {
        throw error;
      }

      setMessage(
        `Book borrowed successfully. Due date: ${new Date(
          data.due_date
        ).toLocaleDateString()}`
      );

      router.refresh();
    } catch (err: unknown) {
  setError(
    err instanceof Error
      ? err.message
      : "Unable to borrow book."
  );
} finally {
      setLoading(false);
    }
  }

  if (!available) {
    return (
      <button
        disabled
        className="rounded-lg bg-gray-300 px-6 py-3 text-gray-600"
      >
        Currently Unavailable
      </button>
    );
  }

  return (
    <div>
      <button
        onClick={borrowBook}
        disabled={loading}
        className="rounded-lg bg-black px-6 py-3 text-white hover:bg-gray-800 disabled:opacity-50"
      >
        {loading ? "Borrowing..." : "Borrow Book"}
      </button>

      {message && (
        <p className="mt-3 text-green-600">
          {message}
        </p>
      )}

      {error && (
        <p className="mt-3 text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}