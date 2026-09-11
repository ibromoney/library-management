import { createClient } from "@/lib/supabase/server";
import Link from "next/link";

type Borrowing = {
  id: number;
  due_date: string;
  returned_at: string | null;
  students: {
    matric_number: string;
    profiles: {
      first_name: string;
      last_name: string;
      email: string;
      phone_number: string | null;
    } | null;
  } | null;
  book_copies: {
    barcode: string;
    books: {
      title: string;
      author: string;
    } | null;
  } | null;
};

export default async function OverduePage() {
  const supabase = await createClient();

  const now = new Date();
  const currentTime = now.getTime();

  const { data, error } = await supabase
    .from("borrowings")
    .select(`
      *,
      students (
        matric_number,
        profiles (
          first_name,
          last_name,
          email,
          phone_number
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
    .is("returned_at", null)
    .lt("due_date", now.toISOString())
    .order("due_date");

  if (error) {
    return (
      <main className="min-h-screen bg-gray-100 p-6">
        <div className="mx-auto max-w-7xl">
          <Link
            href="/librarian/dashboard"
            className="text-sm underline"
          >
            ← Dashboard
          </Link>

          <div className="mt-8 rounded-xl bg-white p-8 shadow">
            <h1 className="text-2xl font-bold text-red-600">
              Error loading overdue books
            </h1>

            <p className="mt-3 text-gray-600">
              {error.message}
            </p>
          </div>
        </div>
      </main>
    );
  }

  const overdueBorrowings = (data || []) as Borrowing[];

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
          Overdue Books
        </h1>

        <p className="mt-2 text-gray-500">
          Books that have passed their due date.
        </p>

        <div className="mt-8 grid gap-5">
          {!overdueBorrowings.length ? (
            <div className="rounded-xl bg-white p-10 text-center shadow">
              <p className="text-green-600">
                No overdue books 🎉
              </p>
            </div>
          ) : (
            overdueBorrowings.map((borrowing) => {
              const student = borrowing.students;
              const profile = student?.profiles;
              const book = borrowing.book_copies?.books;

              const dueDate = new Date(
                borrowing.due_date
              );

              const daysLate = Math.max(
                1,
                Math.ceil(
                  (currentTime - dueDate.getTime()) /
                    86400000
                )
              );

              const estimatedFine = daysLate * 100;

              return (
                <div
                  key={borrowing.id}
                  className="rounded-xl bg-white p-6 shadow"
                >
                  <div className="flex flex-col justify-between gap-6 md:flex-row">

                    {/* Student */}
                    <div>
                      <p className="text-sm text-gray-500">
                        Student
                      </p>

                      <h2 className="text-xl font-bold">
                        {profile?.first_name || ""}{" "}
                        {profile?.last_name || ""}
                      </h2>

                      <p>
                        {student?.matric_number || "N/A"}
                      </p>

                      <p className="text-sm text-gray-500">
                        {profile?.email || "N/A"}
                      </p>
                    </div>

                    {/* Book */}
                    <div>
                      <p className="text-sm text-gray-500">
                        Book
                      </p>

                      <h2 className="text-xl font-bold">
                        {book?.title || "Unknown book"}
                      </h2>

                      <p>
                        {book?.author || "Unknown author"}
                      </p>

                      <p className="text-sm text-gray-500">
                        Barcode:{" "}
                        {borrowing.book_copies?.barcode ||
                          "N/A"}
                      </p>
                    </div>

                    {/* Due Date */}
                    <div>
                      <p className="text-sm text-gray-500">
                        Due date
                      </p>

                      <p className="font-bold text-red-600">
                        {dueDate.toLocaleDateString()}
                      </p>

                      <p className="mt-2">
                        {daysLate} day(s) late
                      </p>

                      <p className="font-bold">
                        Fine: ₦
                        {estimatedFine.toLocaleString()}
                      </p>
                    </div>

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

