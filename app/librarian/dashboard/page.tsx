
import { createClient } from "@/lib/supabase/server";
import LogoutButton from "@/components/LogoutButton";
import Link from "next/link";

export default async function LibrarianDashboard() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return <div className="p-8">Please login.</div>;
  }

  // Verify role
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "librarian") {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-bold">
            Access Denied
          </h1>

          <p className="mt-2 text-gray-500">
            You do not have librarian permissions.
          </p>
        </div>
      </main>
    );
  }

  // Total books
  const { count: totalBooks } = await supabase
    .from("books")
    .select("*", {
      count: "exact",
      head: true,
    });

  // Total physical copies
  const { count: totalCopies } = await supabase
    .from("book_copies")
    .select("*", {
      count: "exact",
      head: true,
    });

  // Available copies
  const { count: availableCopies } =
    await supabase
      .from("book_copies")
      .select("*", {
        count: "exact",
        head: true,
      })
      .eq("status", "available");

  // Borrowed copies
  const { count: borrowedCopies } =
    await supabase
      .from("book_copies")
      .select("*", {
        count: "exact",
        head: true,
      })
      .eq("status", "borrowed");

  // Students
  const { count: totalStudents } =
    await supabase
      .from("students")
      .select("*", {
        count: "exact",
        head: true,
      });

  // Active borrowings
  const { count: activeBorrowings } =
    await supabase
      .from("borrowings")
      .select("*", {
        count: "exact",
        head: true,
      })
      .is("returned_at", null);

  // Overdue
  const { count: overdueBooks } =
    await supabase
      .from("borrowings")
      .select("*", {
        count: "exact",
        head: true,
      })
      .is("returned_at", null)
      .lt("due_date", new Date().toISOString());

  // Unpaid fines
  const { data: fines } = await supabase
    .from("fines")
    .select("amount")
    .eq("status", "unpaid");

  const unpaidFines =
    fines?.reduce(
      (sum, fine) => sum + Number(fine.amount),
      0
    ) || 0;

  return (
    <main className="min-h-screen bg-gray-100">
      <nav className="flex items-center justify-between bg-white px-6 py-4 shadow">
        <h1 className="text-xl font-bold">
          📚 Library Admin
        </h1>

        <LogoutButton />
      </nav>

      <div className="mx-auto max-w-7xl p-6">
        <div className="mb-8">
          <h2 className="text-3xl font-bold">
            Librarian Dashboard
          </h2>

          <p className="mt-2 text-gray-500">
            Welcome back, {profile.first_name}.
          </p>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <Card
            title="Total Books"
            value={totalBooks || 0}
          />

          <Card
            title="Available Copies"
            value={availableCopies || 0}
          />

          <Card
            title="Borrowed Copies"
            value={borrowedCopies || 0}
          />

          <Card
            title="Students"
            value={totalStudents || 0}
          />

          <Card
            title="Active Borrowings"
            value={activeBorrowings || 0}
          />

          <Card
            title="Overdue"
            value={overdueBooks || 0}
          />

          <Card
            title="Total Copies"
            value={totalCopies || 0}
          />

          <Card
            title="Unpaid Fines"
            value={`₦${unpaidFines.toLocaleString()}`}
          />
        </div>

        <div className="mt-8 grid gap-5 md:grid-cols-3">
          <Link
            href="/librarian/books"
            className="rounded-xl bg-white p-6 shadow hover:shadow-lg"
          >
            <h3 className="text-xl font-bold">
              📚 Manage Books
            </h3>

            <p className="mt-2 text-gray-500">
              Add, edit and manage library books.
            </p>
          </Link>

          <Link
            href="/librarian/borrowings"
            className="rounded-xl bg-white p-6 shadow hover:shadow-lg"
          >
            <h3 className="text-xl font-bold">
              📋 Borrowings
            </h3>

            <p className="mt-2 text-gray-500">
              View current and previous borrowings.
            </p>
          </Link>

          <Link
            href="/librarian/returns"
            className="rounded-xl bg-white p-6 shadow hover:shadow-lg"
          >
            <h3 className="text-xl font-bold">
              🔄 Process Returns
            </h3>

            <p className="mt-2 text-gray-500">
              Process returned library books.
            </p>
          </Link>
        </div>
      </div>
    </main>
  );
}

function Card({
  title,
  value,
}: {
  title: string;
  value: string | number;
}) {
  return (
    <div className="rounded-xl bg-white p-6 shadow">
      <p className="text-sm text-gray-500">
        {title}
      </p>

      <p className="mt-2 text-3xl font-bold">
        {value}
      </p>
    </div>
  );
}

