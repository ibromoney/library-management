import { createClient } from "@/lib/supabase/server";
import Link from "next/link";

type Profile = {
  first_name: string;
  last_name: string;
  email: string;
};

type Student = {
  matric_number: string;
  profiles: Profile | null;
};

type Book = {
  title: string;
  author: string;
};

type BookCopy = {
  barcode: string;
  books: Book | null;
};

type Borrowing = {
  id: number;
  borrowed_at: string;
  due_date: string;
  returned_at: string | null;
  status: string;
  students: Student | null;
  book_copies: BookCopy | null;
};

export default async function LibrarianBorrowingsPage() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("borrowings")
    .select(`
      *,
      students (
        matric_number,
        profiles (
          first_name,
          last_name,
          email
        )
      ),
      book_copies (
        barcode,
        books (
          title,
          author
        )
      )
    `)
    .order("borrowed_at", {
      ascending: false,
    });

  if (error) {
    return (
      <main className="p-8">
        <p className="text-red-600">
          {error.message}
        </p>
      </main>
    );
  }

  const borrowings = (data || []) as Borrowing[];

  return (
    <main className="min-h-screen bg-gray-100 p-6">
      <div className="mx-auto max-w-7xl">

        <Link
          href="/librarian/dashboard"
          className="text-sm underline"
        >
          ← Dashboard
        </Link>

        <h1 className="mt-5 text-3xl font-bold">
          Borrowings
        </h1>

        <p className="mt-1 text-gray-500">
          View all book borrowing records.
        </p>

        <div className="mt-8 overflow-hidden rounded-xl bg-white shadow">
          <div className="overflow-x-auto">
            <table className="w-full">

              <thead className="border-b bg-gray-50">
                <tr>
                  <th className="p-4 text-left">
                    Student
                  </th>

                  <th className="p-4 text-left">
                    Book
                  </th>

                  <th className="p-4 text-left">
                    Borrowed
                  </th>

                  <th className="p-4 text-left">
                    Due
                  </th>

                  <th className="p-4 text-left">
                    Returned
                  </th>

                  <th className="p-4 text-left">
                    Status
                  </th>
                </tr>
              </thead>

              <tbody>
                {borrowings.map((borrowing) => {
                  const student =
                    borrowing.students;

                  const profile =
                    student?.profiles;

                  const book =
                    borrowing.book_copies?.books;

                  const overdue =
                    !borrowing.returned_at &&
                    new Date(borrowing.due_date) <
                      new Date();

                  return (
                    <tr
                      key={borrowing.id}
                      className="border-b last:border-0"
                    >

                      {/* Student */}
                      <td className="p-4">
                        <p className="font-semibold">
                          {profile?.first_name || ""}{" "}
                          {profile?.last_name || ""}
                        </p>

                        <p className="text-sm text-gray-500">
                          {student?.matric_number ||
                            "No matric number"}
                        </p>

                        <p className="text-xs text-gray-400">
                          {profile?.email || ""}
                        </p>
                      </td>

                      {/* Book */}
                      <td className="p-4">
                        <p className="font-semibold">
                          {book?.title ||
                            "Unknown book"}
                        </p>

                        <p className="text-sm text-gray-500">
                          {book?.author ||
                            "Unknown author"}
                        </p>

                        <p className="text-xs text-gray-400">
                          Barcode:{" "}
                          {borrowing.book_copies
                            ?.barcode || "-"}
                        </p>
                      </td>

                      {/* Borrowed */}
                      <td className="p-4">
                        {new Date(
                          borrowing.borrowed_at
                        ).toLocaleDateString()}
                      </td>

                      {/* Due */}
                      <td className="p-4">
                        <span
                          className={
                            overdue
                              ? "font-medium text-red-600"
                              : ""
                          }
                        >
                          {new Date(
                            borrowing.due_date
                          ).toLocaleDateString()}
                        </span>
                      </td>

                      {/* Returned */}
                      <td className="p-4">
                        {borrowing.returned_at
                          ? new Date(
                              borrowing.returned_at
                            ).toLocaleDateString()
                          : "-"}
                      </td>

                      {/* Status */}
                      <td className="p-4">
                        {overdue ? (
                          <span className="rounded-full bg-red-100 px-3 py-1 text-sm font-medium text-red-700">
                            Overdue
                          </span>
                        ) : borrowing.status ===
                          "returned" ? (
                          <span className="rounded-full bg-gray-100 px-3 py-1 text-sm font-medium text-gray-700">
                            Returned
                          </span>
                        ) : (
                          <span className="rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-700">
                            Borrowed
                          </span>
                        )}
                      </td>

                    </tr>
                  );
                })}
              </tbody>

            </table>
          </div>

          {!borrowings.length && (
            <div className="p-10 text-center text-gray-500">
              No borrowing records.
            </div>
          )}
        </div>

      </div>
    </main>
  );
}