import { createClient } from "@/lib/supabase/server";
import MarkNotificationsReadButton from "@/components/MarkNotificationsReadButton";
import Link from "next/link";

export default async function NotificationsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return <div className="p-8">Please login.</div>;
  }

  const { data: notifications, error } = await supabase
    .from("notifications")
    .select(`
      id,
      title,
      message,
      type,
      is_read,
      created_at
    `)
    .eq("profile_id", user.id)
    .order("created_at", {
      ascending: false,
    });

  if (error) {
    return (
      <div className="p-8 text-red-600">
        Unable to load notifications.
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gray-100 p-6">
      <div className="mx-auto max-w-4xl">

        <Link
          href="/student/dashboard"
          className="text-sm underline"
        >
          ← Dashboard
        </Link>

        <div className="mt-5">
          <h1 className="text-3xl font-bold">
            Notifications
          </h1>

          <p className="mt-2 text-gray-500">
            Stay updated about your library activities.
          </p>
        </div>

        <div className="mt-8 space-y-4">
          {!notifications?.length ? (
            <div className="rounded-xl bg-white p-8 text-center shadow">
              <div className="text-4xl">🔔</div>

              <p className="mt-3 text-gray-500">
                You don&apos;t have any notifications yet.
              </p>
            </div>
          ) : (
            notifications.map((notification) => (
              <div
                key={notification.id}
                className={`rounded-xl bg-white p-5 shadow ${
                  !notification.is_read
                    ? "border-l-4 border-black"
                    : ""
                }`}
              >
                <div className="flex items-start gap-4">

                  <div className="text-2xl">
                    {notification.type === "fine"
                      ? "💰"
                      : notification.type ===
                        "overdue"
                      ? "⚠️"
                      : notification.type ===
                        "return"
                      ? "↩️"
                      : "📚"}
                  </div>

                  <div className="flex-1">
                    <div className="flex flex-col gap-1 md:flex-row md:items-center md:justify-between">
                      <h2 className="font-bold">
                        {notification.title}
                      </h2>

                      <span className="text-xs text-gray-400">
                        {new Date(
                          notification.created_at
                        ).toLocaleString()}
                      </span>
                    </div>

                    <p className="mt-2 text-gray-600">
                      {notification.message}
                    </p>

                    {!notification.is_read && (
                      <span className="mt-3 inline-block rounded-full bg-black px-3 py-1 text-xs text-white">
                        New
                      </span>
                    )}
                    <div className="mt-4">
  <MarkNotificationsReadButton />
</div>
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