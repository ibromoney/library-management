"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function ReturnBookButton({
  borrowingId,
}: {
  borrowingId: number;
}) {
  const supabase = createClient();
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function returnBook() {
    const confirmed = window.confirm(
      "Are you sure you want to return this book?"
    );

    if (!confirmed) return;

    setLoading(true);
    setMessage("");
    setError("");

    try {
      const { data, error } =
        await supabase.rpc("return_book", {
          p_borrowing_id: borrowingId,
        });

      if (error) {
        throw error;
      }

      if (data.fine_amount > 0) {
        setMessage(
          `Book returned. You were ${data.days_late} day(s) late. Fine: ₦${Number(
            data.fine_amount
          ).toLocaleString()}`
        );
      } else {
        setMessage(
          "Book returned successfully. No fine."
        );
      }

      router.refresh();
    } catch (err: unknown) {
  setError(
    err instanceof Error
      ? err.message
      : "Unable to return book."
  );
} finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <button
        onClick={returnBook}
        disabled={loading}
        className="rounded-lg bg-black px-5 py-2 text-white hover:bg-gray-800 disabled:opacity-50"
      >
        {loading ? "Returning..." : "Return Book"}
      </button>

      {message && (
        <p className="mt-2 text-sm text-green-600">
          {message}
        </p>
      )}

      {error && (
        <p className="mt-2 text-sm text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}