import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import Image from "next/image";
import BorrowButton from "@/components/BorrowButton";

type BookCopy = {
  id: number;
  barcode: string;
  status: string;
};

type Props = {
  params: Promise<{
    id: string;
  }>;
};

export default async function BookDetailsPage({
  params,
}: Props) {
  const { id } = await params;

  const supabase = await createClient();

  const { data: book, error } = await supabase
    .from("books")
    .select(`
      *,
      categories (
        id,
        name
      ),
      book_copies (
        id,
        barcode,
        status
      )
    `)
    .eq("id", id)
    .single();

  if (error || !book) {
    return (
      <main className="p-8">
        <h1 className="text-2xl font-bold">
          Book not found
        </h1>

        <Link
          href="/student/books"
          className="mt-4 inline-block underline"
        >
          Back to books
        </Link>
      </main>
    );
  }

  const bookCopies = (book.book_copies ?? []) as BookCopy[];

  const availableCopies = bookCopies.filter(
    (copy) => copy.status === "available"
  ).length;

  return (
    <main className="min-h-screen bg-gray-100 p-6">
      <div className="mx-auto max-w-5xl">

        <Link
          href="/student/books"
          className="text-sm underline"
        >
          ← Back to books
        </Link>

        <div className="mt-6 grid gap-8 rounded-2xl bg-white p-8 shadow md:grid-cols-2">

          <div className="flex min-h-100 items-center justify-center rounded-xl bg-gray-200">
            {book.cover_image ? (
             <Image
  src={book.cover_image}
  alt={book.title}
  width={500}
  height={500}
  className="max-h-100 w-full object-contain"
/>
            ) : (
              <span className="text-8xl">📖</span>
            )}
          </div>

          <div>
            <p className="text-sm text-gray-500">
              {book.categories?.name || "Uncategorized"}
            </p>

            <h1 className="mt-2 text-4xl font-bold">
              {book.title}
            </h1>

            <p className="mt-4 text-xl text-gray-600">
              by {book.author}
            </p>

            {book.description && (
              <p className="mt-6 leading-7 text-gray-600">
                {book.description}
              </p>
            )}

            <div className="mt-6 space-y-2">

              {book.isbn && (
                <p>
                  <strong>ISBN:</strong> {book.isbn}
                </p>
              )}

              {book.publisher && (
                <p>
                  <strong>Publisher:</strong>{" "}
                  {book.publisher}
                </p>
              )}

              {book.publication_year && (
                <p>
                  <strong>Published:</strong>{" "}
                  {book.publication_year}
                </p>
              )}

              <p>
                <strong>Available copies:</strong>{" "}
                {availableCopies}
              </p>

            </div>

            <div className="mt-8">
              <BorrowButton
                bookId={book.id}
                available={availableCopies > 0}
              />
            </div>

          </div>
        </div>
      </div>
    </main>
  );
}