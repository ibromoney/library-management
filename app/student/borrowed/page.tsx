
import { createClient } from "@/lib/supabase/server";
import ReturnBookButton from "@/components/ReturnBookButton";
import Link from "next/link";
import Image from "next/image";

type Book = {
  id: number;
  title: string;
  author: string;
  cover_image: string | null;
};

type BookCopy = {
  barcode: string;
  books: Book | null;
};

type Borrowing = {
  id: number;
  due_date: string;
  returned_at: string | null;
  book_copies: BookCopy | null;
};

export default async function BorrowedBooksPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return <div className="p-8">Please login.</div>;
  }

  const { data: student } = await supabase
    .from("students")
    .select("id")
    .eq("profile_id", user.id)
    .single();

  if (!student) {
    return (
      <div className="p-8">
        Student record not found.
      </div>
    );
  }

  const { data: borrowings, error } = await supabase
    .from("borrowings")
    .select(`
      *,
      book_copies (
        barcode,
        books (
          id,
          title,
          author,
          cover_image
        )
      )
    `)
    .eq("student_id", student.id)
    .is("returned_at", null)
    .order("due_date");

  if (error) {
    return (
      <main className="p-8">
        <p className="text-red-600">
          Unable to load borrowed books.
        </p>

        <p className="mt-2 text-sm text-gray-500">
          {error.message}
        </p>
      </main>
    );
  }

  const borrowedBooks = (borrowings || []) as Borrowing[];

  // Calculate the current time once before rendering.
  const currentTime = new Date().getTime();

  return (
    <main className="min-h-screen bg-gray-100 p-6">
      <div className="mx-auto max-w-6xl">
        <Link
          href="/student/dashboard"
          className="text-sm underline"
        >
          ← Dashboard
        </Link>

        <h1 className="mt-5 text-3xl font-bold">
          My Borrowed Books
        </h1>

        <div className="mt-8 space-y-4">
          {!borrowedBooks.length ? (
            <div className="rounded-xl bg-white p-8 text-center shadow">
              <p className="text-gray-500">
                You currently have no borrowed books.
              </p>

              <Link
                href="/student/books"
                className="mt-4 inline-block rounded-lg bg-black px-5 py-3 text-white"
              >
                Browse Books
              </Link>
            </div>
          ) : (
            borrowedBooks.map((borrowing) => {
              const dueDate = new Date(borrowing.due_date);

              const overdue =
                dueDate.getTime() < currentTime;

              const book =
                borrowing.book_copies?.books;

              return (
                <div
                  key={borrowing.id}
                  className="rounded-xl bg-white p-5 shadow"
                >
                  <div className="flex flex-col gap-5 md:flex-row md:items-center">
                    <div className="flex h-28 w-20 items-center justify-center rounded-lg bg-gray-200">
                      {book?.cover_image ? (
                        <Image
                          src={book.cover_image}
                          alt={book.title}
                          className="h-full w-full rounded-lg object-cover"
                        />
                      ) : (
                        <span className="text-3xl">
                          📖
                        </span>
                      )}
                    </div>

                    <div className="flex-1">
                      <h2 className="text-xl font-bold">
                        {book?.title}
                      </h2>

                      <p className="text-gray-500">
                        {book?.author}
                      </p>

                      <p className="mt-3">
                        Due:{" "}
                        <strong
                          className={
                            overdue
                              ? "text-red-600"
                              : "text-green-600"
                          }
                        >
                          {dueDate.toLocaleDateString()}
                        </strong>
                      </p>

                      {overdue && (
                        <p className="mt-1 text-sm font-medium text-red-600">
                          This book is overdue.
                        </p>
                      )}
                    </div>

                    {book && (
                      <Link
                        href={`/student/books/${book.id}`}
                        className="rounded-lg border px-5 py-3 text-center hover:bg-gray-50"
                      >
                        View Book
                      </Link>
                    )}
                  </div>

                  <div className="mt-5 border-t pt-4">
                    <ReturnBookButton
                      borrowingId={borrowing.id}
                    />
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </main>
  );
}

