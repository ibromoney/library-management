"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function MarkNotificationsReadButton() {
  const supabase = createClient();
  const router = useRouter();

  const [loading, setLoading] = useState(false);

  async function markAllAsRead() {
    setLoading(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setLoading(false);
      return;
    }

    await supabase
      .from("notifications")
      .update({
        is_read: true,
      })
      .eq("profile_id", user.id)
      .eq("is_read", false);

    router.refresh();

    setLoading(false);
  }

  return (
    <button
      onClick={markAllAsRead}
      disabled={loading}
      className="rounded-lg border bg-white px-4 py-2 text-sm hover:bg-gray-50 disabled:opacity-50"
    >
      {loading
        ? "Updating..."
        : "Mark all as read"}
    </button>
  );
}