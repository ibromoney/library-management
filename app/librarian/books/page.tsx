import Image from "next/image";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

type BookCopy = {
  id: number;
  status: string;
};

type Category = {
  name: string;
};

type Book = {
  id: number;
  title: string;
  author: string;
  isbn: string | null;
  cover_image: string | null;
  created_at: string;
  categories: Category | null;
  book_copies: BookCopy[];
};

export default async function LibrarianBooksPage() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("books")
    .select(`
      *,
      categories (
        name
      ),
      book_copies (
        id,
        status
      )
    `)
    .order("created_at", {
      ascending: false,
    });

  if (error) {
    return (
      <main className="p-8">
        <h1 className="text-2xl font-bold">
          Error loading books
        </h1>

        <p className="mt-2 text-red-600">
          {error.message}
        </p>
      </main>
    );
  }

  const books = (data || []) as Book[];

  return (
    <main className="min-h-screen bg-gray-100 p-6">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <Link
              href="/librarian/dashboard"
              className="text-sm underline"
            >
              ← Dashboard
            </Link>

            <h1 className="mt-3 text-3xl font-bold">
              Manage Books
            </h1>

            <p className="mt-1 text-gray-500">
              Manage the library catalogue.
            </p>
          </div>

          <Link
            href="/librarian/books/new"
            className="rounded-lg bg-black px-5 py-3 text-center text-white hover:bg-gray-800"
          >
            + Add Book
          </Link>
        </div>

        {/* Books Table */}
        <div className="mt-8 overflow-hidden rounded-xl bg-white shadow">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="border-b bg-gray-50">
                <tr>
                  <th className="p-4">
                    Book
                  </th>

                  <th className="p-4">
                    Author
                  </th>

                  <th className="p-4">
                    Category
                  </th>

                  <th className="p-4">
                    Copies
                  </th>

                  <th className="p-4">
                    Available
                  </th>

                  <th className="p-4">
                    Action
                  </th>
                </tr>
              </thead>

              <tbody>
                {books.map((book) => {
                  const total =
                    book.book_copies?.length || 0;

                  const available =
                    book.book_copies?.filter(
                      (copy) =>
                        copy.status === "available"
                    ).length || 0;

                  return (
                    <tr
                      key={book.id}
                      className="border-b last:border-0"
                    >
                      {/* Book */}
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="relative flex h-12 w-10 items-center justify-center overflow-hidden rounded bg-gray-200">
                            {book.cover_image ? (
                              <Image
                                src={book.cover_image}
                                alt={book.title}
                                fill
                                sizes="40px"
                                className="object-cover"
                              />
                            ) : (
                              "📖"
                            )}
                          </div>

                          <div>
                            <p className="font-semibold">
                              {book.title}
                            </p>

                            {book.isbn && (
                              <p className="text-xs text-gray-500">
                                ISBN: {book.isbn}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Author */}
                      <td className="p-4">
                        {book.author}
                      </td>

                      {/* Category */}
                      <td className="p-4">
                        {book.categories?.name ||
                          "Uncategorized"}
                      </td>

                      {/* Total Copies */}
                      <td className="p-4">
                        {total}
                      </td>

                      {/* Available Copies */}
                      <td className="p-4">
                        <span
                          className={
                            available > 0
                              ? "font-medium text-green-600"
                              : "font-medium text-red-600"
                          }
                        >
                          {available}
                        </span>
                      </td>

                      {/* Action */}
                      <td className="p-4">
                        <Link
                          href={`/librarian/books/${book.id}/edit`}
                          className="rounded-lg border px-3 py-2 text-sm hover:bg-gray-50"
                        >
                          Edit
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Empty State */}
          {!books.length && (
            <div className="p-10 text-center">
              <p className="text-gray-500">
                No books have been added yet.
              </p>

              <Link
                href="/librarian/books/new"
                className="mt-4 inline-block rounded-lg bg-black px-5 py-3 text-white"
              >
                Add First Book
              </Link>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
