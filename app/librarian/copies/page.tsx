"use client";

import { FormEvent, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type Book = {
  id: number;
  title: string;
  author: string;
};

type Copy = {
  id: number;
  barcode: string;
  status: string;
  book_id: number;
  books: {
    title: string;
    author: string;
  } | null;
};

const supabase = createClient();

export default function CopiesPage() {
  const [books, setBooks] = useState<Book[]>([]);
  const [copies, setCopies] = useState<Copy[]>([]);

  const [bookId, setBookId] = useState("");
  const [barcode, setBarcode] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function loadData() {
    const { data: booksData, error: booksError } = await supabase
      .from("books")
      .select("id, title, author")
      .order("title");

    if (booksError) {
      setError(booksError.message);
      return;
    }

    const { data: copiesData, error: copiesError } = await supabase
      .from("book_copies")
      .select(`
        *,
        books (
          title,
          author
        )
      `)
      .order("created_at", {
        ascending: false,
      });

    if (copiesError) {
      setError(copiesError.message);
      return;
    }

    setBooks(booksData || []);
    setCopies((copiesData || []) as Copy[]);
  }

  useEffect(() => {
    let cancelled = false;

    async function loadInitialData() {
      const { data: booksData, error: booksError } = await supabase
        .from("books")
        .select("id, title, author")
        .order("title");

      if (cancelled) return;

      if (booksError) {
        setError(booksError.message);
        return;
      }

      const { data: copiesData, error: copiesError } = await supabase
        .from("book_copies")
        .select(`
          *,
          books (
            title,
            author
          )
        `)
        .order("created_at", {
          ascending: false,
        });

      if (cancelled) return;

      if (copiesError) {
        setError(copiesError.message);
        return;
      }

      setBooks(booksData || []);
      setCopies((copiesData || []) as Copy[]);
    }

    void loadInitialData();

    return () => {
      cancelled = true;
    };
  }, []);

  async function addCopy(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    setLoading(true);
    setError("");

    if (!bookId) {
      setError("Select a book.");
      setLoading(false);
      return;
    }

    if (!barcode.trim()) {
      setError("Enter a barcode.");
      setLoading(false);
      return;
    }

    const { error: insertError } = await supabase
      .from("book_copies")
      .insert({
        book_id: Number(bookId),
        barcode: barcode.trim(),
        status: "available",
      });

    if (insertError) {
      setError(insertError.message);
    } else {
      setBarcode("");
      setBookId("");
      await loadData();
    }

    setLoading(false);
  }

  return (
    <main className="min-h-screen bg-gray-100 p-6">
      <div className="mx-auto max-w-6xl">
        <h1 className="text-3xl font-bold">
          Book Copies
        </h1>

        <p className="mt-2 text-gray-500">
          Manage physical copies of library books.
        </p>

        <div className="mt-8 rounded-xl bg-white p-6 shadow">
          <h2 className="text-xl font-bold">
            Add Physical Copy
          </h2>

          {error && (
            <p className="mt-3 text-red-600">
              {error}
            </p>
          )}

          <form
            onSubmit={addCopy}
            className="mt-5 grid gap-4 md:grid-cols-3"
          >
            <select
              value={bookId}
              onChange={(e) => setBookId(e.target.value)}
              className="rounded-lg border p-3"
            >
              <option value="">
                Select book
              </option>

              {books.map((book) => (
                <option
                  key={book.id}
                  value={book.id}
                >
                  {book.title}
                </option>
              ))}
            </select>

            <input
              value={barcode}
              onChange={(e) => setBarcode(e.target.value)}
              placeholder="Barcode e.g. PHY-001"
              className="rounded-lg border p-3"
            />

            <button
              type="submit"
              disabled={loading}
              className="rounded-lg bg-black p-3 text-white disabled:opacity-50"
            >
              {loading ? "Adding..." : "Add Copy"}
            </button>
          </form>
        </div>

        <div className="mt-8 overflow-hidden rounded-xl bg-white shadow">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b bg-gray-50">
                <tr>
                  <th className="p-4 text-left">
                    Book
                  </th>

                  <th className="p-4 text-left">
                    Barcode
                  </th>

                  <th className="p-4 text-left">
                    Status
                  </th>
                </tr>
              </thead>

              <tbody>
                {copies.map((copy) => (
                  <tr
                    key={copy.id}
                    className="border-b"
                  >
                    <td className="p-4">
                      <p className="font-semibold">
                        {copy.books?.title || "Unknown book"}
                      </p>

                      <p className="text-sm text-gray-500">
                        {copy.books?.author || "Unknown author"}
                      </p>
                    </td>

                    <td className="p-4">
                      {copy.barcode}
                    </td>

                    <td className="p-4">
                      <span
                        className={
                          copy.status === "available"
                            ? "text-green-600"
                            : copy.status === "borrowed"
                            ? "text-orange-600"
                            : "text-gray-600"
                        }
                      >
                        {copy.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {!copies.length && (
            <div className="p-10 text-center text-gray-500">
              No physical copies yet.
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
