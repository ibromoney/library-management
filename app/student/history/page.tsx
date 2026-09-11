import { createClient } from "@/lib/supabase/server";
import Link from "next/link";

export default async function StudentHistoryPage() {
  const supabase = await createClient();


  type Borrowing = {
  id: number;
  borrowed_at: string;
  due_date: string;
  returned_at: string | null;
  status: string;
  book_copies: {
    barcode: string;
    books: {
      title: string;
      author: string;
    } | null;
  } | null;
};

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

  const { data: borrowings, error } =
    await supabase
      .from("borrowings")
      .select(`
        *,
        book_copies (
          barcode,
          books (
            title,
            author
          )
        )
      `)
      .eq("student_id", student.id)
      .order("borrowed_at", {
        ascending: false,
      });

  if (error) {
    return (
      <div className="p-8 text-red-600">
        {error.message}
      </div>
    );
  }

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
          Borrowing History
        </h1>

        <div className="mt-8 overflow-hidden rounded-xl bg-white shadow">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b bg-gray-50">
                <tr>
                  <th className="p-4 text-left">
                    Book
                  </th>

                  <th className="p-4 text-left">
                    Borrowed
                  </th>

                  <th className="p-4 text-left">
                    Due Date
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
                {borrowings?.map(
                  (borrowing: Borrowing) => {
                    const book =
                      borrowing.book_copies?.books;

                    return (
                      <tr
                        key={borrowing.id}
                        className="border-b"
                      >
                        <td className="p-4">
                          <p className="font-semibold">
                            {book?.title}
                          </p>

                          <p className="text-sm text-gray-500">
                            {book?.author}
                          </p>
                        </td>

                        <td className="p-4">
                          {new Date(
                            borrowing.borrowed_at
                          ).toLocaleDateString()}
                        </td>

                        <td className="p-4">
                          {new Date(
                            borrowing.due_date
                          ).toLocaleDateString()}
                        </td>

                        <td className="p-4">
                          {borrowing.returned_at
                            ? new Date(
                                borrowing.returned_at
                              ).toLocaleDateString()
                            : "Not returned"}
                        </td>

                        <td className="p-4">
                          <span
                            className={
                              borrowing.status ===
                              "returned"
                                ? "font-medium text-green-600"
                                : "font-medium text-orange-600"
                            }
                          >
                            {borrowing.status}
                          </span>
                        </td>
                      </tr>
                    );
                  }
                )}
              </tbody>
            </table>
          </div>

          {!borrowings?.length && (
            <div className="p-10 text-center text-gray-500">
              No borrowing history yet.
            </div>
          )}
        </div>
      </div>
    </main>
  );
}   