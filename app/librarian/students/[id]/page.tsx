import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

type Props = {
params: Promise<{
id: string;
}>;
};

type Profile = {
first_name: string | null;
last_name: string | null;
email: string | null;
phone_number: string | null;
};

type Student = {
id: number;
matric_number: string;
department: string | null;
faculty: string | null;
level: number | null;
profiles: Profile | Profile[] | null;
};

type Book = {
title: string;
author: string;
};

type BookCopy = {
barcode: string;
books: Book | Book[] | null;
};

type Borrowing = {
id: number;
borrowed_at: string;
due_date: string;
returned_at: string | null;
status: string;
book_copies: BookCopy | BookCopy[] | null;
};

type Fine = {
id: number;
amount: number | string;
reason: string;
status: string;
created_at: string;
};

export default async function StudentDetailsPage({
params,
}: Props) {
const { id } = await params;

const supabase = await createClient();

const studentId = Number(id);

if (Number.isNaN(studentId)) {
return ( <div className="p-8 text-red-600">
Invalid student ID. </div>
);
}

const { data: studentData, error } = await supabase
.from("students")
.select(`       id,
      matric_number,
      department,
      faculty,
      level,
      profiles (
        first_name,
        last_name,
        email,
        phone_number
      )
    `)
.eq("id", studentId)
.single();

if (error || !studentData) {
return ( <div className="p-8"> <p className="text-red-600">
Student not found. </p>


    <Link
      href="/librarian/students"
      className="mt-4 inline-block underline"
    >
      ← Back to Students
    </Link>
  </div>
);


}

const student = studentData as unknown as Student;

const profile = Array.isArray(student.profiles)
? student.profiles[0]
: student.profiles;

// Borrowing history
const { data: borrowingsData } = await supabase
.from("borrowings")
.select(`       id,
      borrowed_at,
      due_date,
      returned_at,
      status,
      book_copies (
        barcode,
        books (
          title,
          author
        )
      )
    `)
.eq("student_id", studentId)
.order("borrowed_at", {
ascending: false,
});

const borrowings =
(borrowingsData as unknown as Borrowing[] | null) || [];

// Fines
const { data: finesData } = await supabase
.from("fines")
.select(`       id,
      amount,
      reason,
      status,
      created_at
    `)
.eq("student_id", studentId)
.order("created_at", {
ascending: false,
});

const fines =
(finesData as unknown as Fine[] | null) || [];

const unpaidFines = fines.filter(
(fine) => fine.status === "unpaid"
);

const totalOutstanding = unpaidFines.reduce(
(total, fine) =>
total + Number(fine.amount),
0
);

const activeBorrowings = borrowings.filter(
(borrowing) =>
borrowing.returned_at === null
);

// Calculate once outside the render/map to avoid
// Date.now() purity warnings.
const currentTime = new Date().getTime();

return ( <main className="min-h-screen bg-gray-100 p-6"> <div className="mx-auto max-w-6xl">

```
    <Link
      href="/librarian/students"
      className="text-sm underline"
    >
      ← Back to Students
    </Link>

    {/* Student Header */}
    <div className="mt-5 rounded-xl bg-white p-6 shadow">
      <div className="flex flex-col gap-5 md:flex-row md:items-center">

        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gray-200 text-2xl font-bold">
          {profile?.first_name?.charAt(0)}
          {profile?.last_name?.charAt(0)}
        </div>

        <div>
          <h1 className="text-3xl font-bold">
            {profile?.first_name}{" "}
            {profile?.last_name}
          </h1>

          <p className="mt-1 text-gray-500">
            {profile?.email}
          </p>

          <p className="mt-1 font-medium">
            {student.matric_number}
          </p>
        </div>

      </div>

      {/* Student Information */}
      <div className="mt-8 grid gap-5 border-t pt-6 md:grid-cols-2 lg:grid-cols-4">

        <div>
          <p className="text-sm text-gray-500">
            Department
          </p>
          <p className="font-medium">
            {student.department ||
              "Not specified"}
          </p>
        </div>

        <div>
          <p className="text-sm text-gray-500">
            Faculty
          </p>
          <p className="font-medium">
            {student.faculty ||
              "Not specified"}
          </p>
        </div>

        <div>
          <p className="text-sm text-gray-500">
            Level
          </p>
          <p className="font-medium">
            {student.level
              ? `${student.level} Level`
              : "Not specified"}
          </p>
        </div>

        <div>
          <p className="text-sm text-gray-500">
            Phone
          </p>
          <p className="font-medium">
            {profile?.phone_number ||
              "Not provided"}
          </p>
        </div>

      </div>
    </div>

    {/* Statistics */}
    <div className="mt-6 grid gap-4 md:grid-cols-3">

      <div className="rounded-xl bg-white p-5 shadow">
        <p className="text-sm text-gray-500">
          Currently Borrowed
        </p>

        <p className="mt-2 text-3xl font-bold">
          {activeBorrowings.length}
        </p>
      </div>

      <div className="rounded-xl bg-white p-5 shadow">
        <p className="text-sm text-gray-500">
          Total Borrowings
        </p>

        <p className="mt-2 text-3xl font-bold">
          {borrowings.length}
        </p>
      </div>

      <div className="rounded-xl bg-white p-5 shadow">
        <p className="text-sm text-gray-500">
          Outstanding Fine
        </p>

        <p className="mt-2 text-3xl font-bold text-red-600">
          ₦{totalOutstanding.toLocaleString()}
        </p>
      </div>

    </div>

    {/* Current Books */}
    <section className="mt-8 rounded-xl bg-white shadow">

      <div className="border-b p-6">
        <h2 className="text-xl font-bold">
          Currently Borrowed
        </h2>
      </div>

      {activeBorrowings.length === 0 ? (
        <p className="p-6 text-gray-500">
          This student has no borrowed books.
        </p>
      ) : (
        <div className="divide-y">
          {activeBorrowings.map(
            (borrowing) => {
              const copy = Array.isArray(
                borrowing.book_copies
              )
                ? borrowing.book_copies[0]
                : borrowing.book_copies;

              const book = copy?.books
                ? Array.isArray(copy.books)
                  ? copy.books[0]
                  : copy.books
                : null;

              const overdue =
                new Date(
                  borrowing.due_date
                ).getTime() < currentTime;

              return (
                <div
                  key={borrowing.id}
                  className="p-6"
                >
                  <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">

                    <div>
                      <h3 className="font-semibold">
                        {book?.title}
                      </h3>

                      <p className="text-sm text-gray-500">
                        {book?.author}
                      </p>

                      <p className="mt-1 text-sm">
                        Barcode:{" "}
                        {copy?.barcode}
                      </p>
                    </div>

                    <div>
                      <p
                        className={
                          overdue
                            ? "font-medium text-red-600"
                            : "font-medium text-green-600"
                        }
                      >
                        Due:{" "}
                        {new Date(
                          borrowing.due_date
                        ).toLocaleDateString()}
                      </p>

                      {overdue && (
                        <p className="text-sm text-red-600">
                          Overdue
                        </p>
                      )}
                    </div>

                  </div>
                </div>
              );
            }
          )}
        </div>
      )}

    </section>

    {/* Borrowing History */}
    <section className="mt-8 rounded-xl bg-white shadow">

      <div className="border-b p-6">
        <h2 className="text-xl font-bold">
          Borrowing History
        </h2>
      </div>

      {!borrowings.length ? (
        <p className="p-6 text-gray-500">
          No borrowing history.
        </p>
      ) : (
        <div className="divide-y">
          {borrowings.map(
            (borrowing) => {
              const copy = Array.isArray(
                borrowing.book_copies
              )
                ? borrowing.book_copies[0]
                : borrowing.book_copies;

              const book = copy?.books
                ? Array.isArray(copy.books)
                  ? copy.books[0]
                  : copy.books
                : null;

              return (
                <div
                  key={borrowing.id}
                  className="p-6"
                >
                  <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">

                    <div>
                      <h3 className="font-semibold">
                        {book?.title}
                      </h3>

                      <p className="text-sm text-gray-500">
                        Borrowed:{" "}
                        {new Date(
                          borrowing.borrowed_at
                        ).toLocaleDateString()}
                      </p>
                    </div>

                    <div className="text-sm">
                      <p>
                        Due:{" "}
                        {new Date(
                          borrowing.due_date
                        ).toLocaleDateString()}
                      </p>

                      <p>
                        Returned:{" "}
                        {borrowing.returned_at
                          ? new Date(
                              borrowing.returned_at
                            ).toLocaleDateString()
                          : "Not returned"}
                      </p>
                    </div>

                    <span
                      className={`rounded-full px-3 py-1 text-sm ${
                        borrowing.status ===
                        "returned"
                          ? "bg-green-100 text-green-700"
                          : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      {borrowing.status}
                    </span>

                  </div>
                </div>
              );
            }
          )}
        </div>
      )}

    </section>

    {/* Fines */}
    <section className="mt-8 rounded-xl bg-white shadow">

      <div className="border-b p-6">
        <h2 className="text-xl font-bold">
          Fines
        </h2>
      </div>

      {!fines.length ? (
        <p className="p-6 text-gray-500">
          No fines recorded.
        </p>
      ) : (
        <div className="divide-y">
          {fines.map((fine) => (
            <div
              key={fine.id}
              className="flex flex-col gap-3 p-6 md:flex-row md:items-center md:justify-between"
            >
              <div>
                <p className="font-medium">
                  {fine.reason}
                </p>

                <p className="text-sm text-gray-500">
                  {new Date(
                    fine.created_at
                  ).toLocaleDateString()}
                </p>
              </div>

              <p className="font-bold">
                ₦{Number(fine.amount).toLocaleString()}
              </p>

              <span
                className={`rounded-full px-3 py-1 text-sm ${
                  fine.status === "paid"
                    ? "bg-green-100 text-green-700"
                    : "bg-red-100 text-red-700"
                }`}
              >
                {fine.status}
              </span>
            </div>
          ))}
        </div>
      )}

    </section>

  </div>
</main>


);
}
