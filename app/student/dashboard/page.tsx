
import { createClient } from "@/lib/supabase/server";
import LogoutButton from "@/components/LogoutButton";
import Link from "next/link";

export default async function StudentDashboard() {
  const supabase = await createClient();

  // Get logged-in user
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return (
      <main className="p-10">
        <h1 className="text-2xl font-bold">
          You must be logged in.
        </h1>
      </main>
    );
  }

  // Get profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  // Get student record
  const { data: student } = await supabase
    .from("students")
    .select("*")
    .eq("profile_id", user.id)
    .single();

  if (!student) {
    return (
      <main className="p-10">
        <h1 className="text-2xl font-bold">
          Student record not found.
        </h1>
      </main>
    );
  }

  // Current borrowings
  const { data: activeBorrowings } = await supabase
    .from("borrowings")
    .select("*")
    .eq("student_id", student.id)
    .is("returned_at", null);

  // Returned books
  const { count: returnedCount } = await supabase
    .from("borrowings")
    .select("*", {
      count: "exact",
      head: true,
    })
    .eq("student_id", student.id)
    .not("returned_at", "is", null);

  // Unpaid fines
  const { data: fines } = await supabase
    .from("fines")
    .select("amount")
    .eq("student_id", student.id)
    .eq("status", "unpaid");

  const totalFines =
    fines?.reduce(
      (total, fine) => total + Number(fine.amount),
      0
    ) || 0;

  // Notifications
  const { count: unreadNotifications } = await supabase
    .from("notifications")
    .select("*", {
      count: "exact",
      head: true,
    })
    .eq("profile_id", user.id)
    .eq("is_read", false);

  return (
    <main className="min-h-screen bg-gray-100">
      <nav className="flex items-center justify-between bg-white px-6 py-4 shadow">
        <div>
          <h1 className="text-xl font-bold text-black">
            📚 Library
          </h1>
        </div>

        <LogoutButton />
      </nav>

      <div className="mx-auto max-w-7xl p-6">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-black">
            Welcome, {profile?.first_name} 👋
          </h2>

          <p className="mt-2 text-gray-500 ">
            {student.matric_number}
          </p>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4 text-black">
          <DashboardCard
            title="Current Books"
            value={activeBorrowings?.length || 0}
          
          />

          <DashboardCard 
            title="Returned Books"
            value={returnedCount || 0}
          />

          <DashboardCard
            title="Unpaid Fines"
            value={`₦${totalFines.toLocaleString()}`}
          />

          <DashboardCard
            title="Notifications"
            value={unreadNotifications || 0}
          />
        </div>

        <div className="mt-8 grid gap-5 md:grid-cols-2">
          <Link
            href="/student/books"
            className="rounded-xl bg-black p-6 text-white transition hover:scale-[1.01]"
          >
            <h3 className="text-xl font-bold">
              Browse Books
            </h3>

            <p className="mt-2 text-gray-300">
              Search and borrow books from the library.
            </p>
          </Link>

          <Link
            href="/student/borrowed"
            className="rounded-xl bg-white p-6 shadow transition hover:scale-[1.01]"
          >
            <h3 className="text-xl font-bold text-black">
              My Borrowed Books
            </h3>

            <p className="mt-2 text-gray-500">
              View books currently borrowed by you.
            </p>
          </Link>
        </div>
      </div>
    </main>
  );
}

function DashboardCard({
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

      <h3 className="mt-2 text-3xl font-bold">
        {value}
      </h3>
    </div>
  );
}

