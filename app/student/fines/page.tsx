import { createClient } from "@/lib/supabase/server";
import Link from "next/link";

export default async function StudentFinesPage() {
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

  const { data: fines } = await supabase
    .from("fines")
    .select("*")
    .eq("student_id", student.id)
    .order("created_at", {
      ascending: false,
    });

  const totalUnpaid =
    fines
      ?.filter(
        (fine) => fine.status === "unpaid"
      )
      .reduce(
        (sum, fine) =>
          sum + Number(fine.amount),
        0
      ) || 0;

  return (
    <main className="min-h-screen bg-gray-100 p-6">
      <div className="mx-auto max-w-5xl">

        <Link
          href="/student/dashboard"
          className="text-sm underline"
        >
          ← Dashboard
        </Link>

        <div className="mt-5 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">
              My Fines
            </h1>

            <p className="mt-2 text-gray-500">
              Outstanding and previous library fines.
            </p>
          </div>

          <div className="rounded-xl bg-white p-5 shadow">
            <p className="text-sm text-gray-500">
              Unpaid
            </p>

            <p className="text-2xl font-bold text-red-600">
              ₦{totalUnpaid.toLocaleString()}
            </p>
          </div>
        </div>

        <div className="mt-8 space-y-4">
          {!fines?.length ? (
            <div className="rounded-xl bg-white p-8 text-center shadow">
              <p className="text-green-600">
                You have no fines 🎉
              </p>
            </div>
          ) : (
            fines.map((fine) => (
              <div
                key={fine.id}
                className="rounded-xl bg-white p-6 shadow"
              >
                <div className="flex flex-col justify-between gap-4 sm:flex-row">
                  <div>
                    <h2 className="font-bold">
                      {fine.reason}
                    </h2>

                    <p className="mt-1 text-sm text-gray-500">
                      {new Date(
                        fine.created_at
                      ).toLocaleDateString()}
                    </p>
                  </div>

                  <div className="text-right">
                    <p className="text-xl font-bold">
                      ₦
                      {Number(
                        fine.amount
                      ).toLocaleString()}
                    </p>

                    <p
                      className={
                        fine.status === "paid"
                          ? "text-green-600"
                          : fine.status === "waived"
                          ? "text-gray-500"
                          : "text-red-600"
                      }
                    >
                      {fine.status}
                    </p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </main>
  );
}