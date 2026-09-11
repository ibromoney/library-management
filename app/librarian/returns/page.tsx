"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

type Book = {
id: number;
title: string;
author: string;
};

type Copy = {
id: number;
barcode: string;
books: Book[] | null;
};

type Profile = {
first_name: string;
last_name: string;
email: string;
};

type Student = {
id: number;
matric_number: string;
profiles: Profile[] | null;
};

type ActiveBorrowing = {
id: number;
borrowed_at: string;
due_date: string;
returned_at: string | null;
students: Student[] | null;
};

type Borrowing = {
id: number;
borrowed_at: string;
due_date: string;
returned_at: string | null;
students: Student[] | null;
copy: Copy;
};

type ReturnResult = {
fine_amount: number;
days_late: number;
};

const supabase = createClient();

export default function LibrarianReturnsPage() {
const [barcode, setBarcode] = useState("");
const [borrowing, setBorrowing] =
useState<Borrowing | null>(null);

const [loading, setLoading] = useState(false);
const [returning, setReturning] = useState(false);

const [error, setError] = useState("");
const [message, setMessage] = useState("");

async function findBook() {
if (!barcode.trim()) {
setError("Please enter a barcode.");
return;
}


setLoading(true);
setError("");
setMessage("");
setBorrowing(null);

try {
  const { data: copy, error: copyError } =
    await supabase
      .from("book_copies")
      .select(`
        id,
        barcode,
        books (
          id,
          title,
          author
        )
      `)
      .eq("barcode", barcode.trim())
      .single();

  if (copyError || !copy) {
    throw new Error("Book copy not found.");
  }

  const { data: activeBorrowing, error: borrowingError } =
    await supabase
      .from("borrowings")
      .select(`
        id,
        borrowed_at,
        due_date,
        returned_at,
        students (
          id,
          matric_number,
          profiles (
            first_name,
            last_name,
            email
          )
        )
      `)
      .eq("book_copy_id", copy.id)
      .is("returned_at", null)
      .single();

  if (borrowingError || !activeBorrowing) {
    throw new Error(
      "This book is not currently borrowed."
    );
  }

  const typedCopy = copy as unknown as Copy;
  const typedBorrowing =
    activeBorrowing as unknown as ActiveBorrowing;

  setBorrowing({
    ...typedBorrowing,
    copy: typedCopy,
  });
} catch (err: unknown) {
  const errorMessage =
    err instanceof Error
      ? err.message
      : "Unable to find this book.";

  setError(errorMessage);
} finally {
  setLoading(false);
}


}

async function returnBook() {
if (!borrowing) return;


const confirmed = window.confirm(
  "Are you sure you want to return this book?"
);

if (!confirmed) return;

setReturning(true);
setError("");
setMessage("");

try {
  const { data, error } =
    await supabase.rpc(
      "process_librarian_return",
      {
        p_borrowing_id: borrowing.id,
      }
    );

  if (error) {
    throw error;
  }

  const result = data as ReturnResult;

  if (result.fine_amount > 0) {
    setMessage(
      `Book returned successfully. ${result.days_late} day(s) late. Fine: ₦${Number(
        result.fine_amount
      ).toLocaleString()}`
    );
  } else {
    setMessage(
      "Book returned successfully. No fine."
    );
  }

  setBorrowing(null);
  setBarcode("");
} catch (err: unknown) {
  const errorMessage =
    err instanceof Error
      ? err.message
      : "Unable to process book return.";

  setError(errorMessage);
} finally {
  setReturning(false);
}


}

const book = borrowing?.copy?.books?.[0];
const student = borrowing?.students?.[0];
const profile = student?.profiles?.[0];

return ( <main className="min-h-screen bg-gray-100 p-6"> <div className="mx-auto max-w-4xl">


    <h1 className="text-3xl font-bold">
      Return Desk
    </h1>

    <p className="mt-2 text-gray-500">
      Enter the book barcode to process a return.
    </p>

    {/* Barcode Search */}
    <div className="mt-8 rounded-xl bg-white p-6 shadow">

      <label className="block text-sm font-medium">
        Book Barcode
      </label>

      <div className="mt-2 flex gap-3">

        <input
          type="text"
          value={barcode}
          onChange={(e) =>
            setBarcode(e.target.value)
          }
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              void findBook();
            }
          }}
          placeholder="e.g. LIB-0001"
          className="flex-1 rounded-lg border px-4 py-3 outline-none focus:ring-2 focus:ring-black"
        />

        <button
          onClick={() => void findBook()}
          disabled={loading}
          className="rounded-lg bg-black px-6 py-3 text-white disabled:opacity-50"
        >
          {loading
            ? "Searching..."
            : "Find Book"}
        </button>

      </div>

      {error && (
        <p className="mt-4 text-sm text-red-600">
          {error}
        </p>
      )}

      {message && (
        <p className="mt-4 text-sm font-medium text-green-600">
          {message}
        </p>
      )}
    </div>

    {/* Borrowing Information */}
    {borrowing && (
      <div className="mt-6 rounded-xl bg-white p-6 shadow">

        <h2 className="text-xl font-bold">
          Book Information
        </h2>

        <div className="mt-5 grid gap-4 md:grid-cols-2">

          <div>
            <p className="text-sm text-gray-500">
              Book
            </p>

            <p className="font-semibold">
              {book?.title || "Unknown"}
            </p>
          </div>

          <div>
            <p className="text-sm text-gray-500">
              Author
            </p>

            <p className="font-semibold">
              {book?.author || "Unknown"}
            </p>
          </div>

          <div>
            <p className="text-sm text-gray-500">
              Barcode
            </p>

            <p className="font-semibold">
              {borrowing.copy.barcode}
            </p>
          </div>

          <div>
            <p className="text-sm text-gray-500">
              Student
            </p>

            <p className="font-semibold">
              {profile?.first_name || ""}{" "}
              {profile?.last_name || ""}
            </p>
          </div>

          <div>
            <p className="text-sm text-gray-500">
              Matric Number
            </p>

            <p className="font-semibold">
              {student?.matric_number || "Unknown"}
            </p>
          </div>

          <div>
            <p className="text-sm text-gray-500">
              Email
            </p>

            <p className="font-semibold">
              {profile?.email || "Unknown"}
            </p>
          </div>

          <div>
            <p className="text-sm text-gray-500">
              Borrowed
            </p>

            <p className="font-semibold">
              {new Date(
                borrowing.borrowed_at
              ).toLocaleDateString()}
            </p>
          </div>

          <div>
            <p className="text-sm text-gray-500">
              Due Date
            </p>

            <p className="font-semibold">
              {new Date(
                borrowing.due_date
              ).toLocaleDateString()}
            </p>
          </div>

        </div>

        {/* Return Button */}
        <div className="mt-8 border-t pt-6">

          <button
            onClick={() => void returnBook()}
            disabled={returning}
            className="w-full rounded-lg bg-black px-6 py-3 font-medium text-white hover:bg-gray-800 disabled:opacity-50"
          >
            {returning
              ? "Processing Return..."
              : "Confirm Book Return"}
          </button>

        </div>

      </div>
    )}

  </div>
</main>


);
}
