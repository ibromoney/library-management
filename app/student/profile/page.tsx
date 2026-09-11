"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type Profile = {
first_name: string;
last_name: string;
email: string;
phone_number: string | null;
};

type Student = {
matric_number: string;
department: string | null;
faculty: string | null;
level: number | null;
};

const supabase = createClient();

export default function StudentProfilePage() {
const [profile, setProfile] = useState<Profile | null>(null);
const [student, setStudent] = useState<Student | null>(null);

const [firstName, setFirstName] = useState("");
const [lastName, setLastName] = useState("");
const [phoneNumber, setPhoneNumber] = useState("");

const [loading, setLoading] = useState(true);
const [saving, setSaving] = useState(false);
const [message, setMessage] = useState("");
const [error, setError] = useState("");

useEffect(() => {
let cancelled = false;


async function loadInitialProfile() {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (cancelled) return;

  if (!user) {
    setError("You must be logged in.");
    setLoading(false);
    return;
  }

  const { data: profileData, error: profileError } =
    await supabase
      .from("profiles")
      .select(
        "first_name, last_name, email, phone_number"
      )
      .eq("id", user.id)
      .single();

  if (cancelled) return;

  if (profileError) {
    setError(profileError.message);
    setLoading(false);
    return;
  }

  const { data: studentData, error: studentError } =
    await supabase
      .from("students")
      .select(
        "matric_number, department, faculty, level"
      )
      .eq("profile_id", user.id)
      .single();

  if (cancelled) return;

  if (studentError) {
    setError(studentError.message);
    setLoading(false);
    return;
  }

  setProfile(profileData);
  setStudent(studentData);

  setFirstName(profileData.first_name);
  setLastName(profileData.last_name);
  setPhoneNumber(profileData.phone_number || "");

  setLoading(false);
}

void loadInitialProfile();

return () => {
  cancelled = true;
};


}, []);

async function updateProfile() {
setSaving(true);
setMessage("");
setError("");


const {
  data: { user },
} = await supabase.auth.getUser();

if (!user) {
  setError("You must be logged in.");
  setSaving(false);
  return;
}

const { error: updateError } = await supabase
  .from("profiles")
  .update({
    first_name: firstName,
    last_name: lastName,
    phone_number: phoneNumber || null,
    updated_at: new Date().toISOString(),
  })
  .eq("id", user.id);

if (updateError) {
  setError(updateError.message);
  setSaving(false);
  return;
}

setProfile((current) =>
  current
    ? {
        ...current,
        first_name: firstName,
        last_name: lastName,
        phone_number: phoneNumber || null,
      }
    : current
);

setMessage("Profile updated successfully.");
setSaving(false);


}

if (loading) {
return ( <main className="min-h-screen bg-gray-100 p-6"> <div className="mx-auto max-w-4xl"> <div className="rounded-xl bg-white p-8 shadow">
Loading profile.... </div> </div> </main>
);
}

if (!profile || !student) {
return ( <main className="min-h-screen bg-gray-100 p-6"> <div className="mx-auto max-w-4xl"> <div className="rounded-xl bg-white p-8 shadow"> <p className="text-red-600">
{error || "Profile not found."} </p> </div> </div> </main>
);
}

return ( <main className="min-h-screen bg-gray-100 p-6"> <div className="mx-auto max-w-4xl">

```
    {/* Header */}
    <div className="mb-8">
      <a
        href="/student/dashboard"
        className="text-sm text-gray-600 hover:underline"
      >
        ← Dashboard
      </a>

      <h1 className="mt-4 text-3xl font-bold">
        My Profile
      </h1>

      <p className="mt-2 text-gray-500">
        View and update your personal information.
      </p>
    </div>

    {/* Personal Information */}
    <section className="rounded-xl bg-white p-6 shadow">
      <h2 className="text-xl font-bold">
        Personal Information
      </h2>

      <div className="mt-6 grid gap-5 md:grid-cols-2">

        <div>
          <label className="mb-2 block text-sm font-medium">
            First Name
          </label>

          <input
            type="text"
            value={firstName}
            onChange={(e) =>
              setFirstName(e.target.value)
            }
            className="w-full rounded-lg border px-4 py-3 outline-none focus:ring-2 focus:ring-black"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium">
            Last Name
          </label>

          <input
            type="text"
            value={lastName}
            onChange={(e) =>
              setLastName(e.target.value)
            }
            className="w-full rounded-lg border px-4 py-3 outline-none focus:ring-2 focus:ring-black"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium">
            Email
          </label>

          <input
            type="email"
            value={profile.email}
            disabled
            className="w-full rounded-lg border bg-gray-100 px-4 py-3 text-gray-500"
          />

          <p className="mt-1 text-xs text-gray-400">
            Email is managed by your account.
          </p>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium">
            Phone Number
          </label>

          <input
            type="tel"
            value={phoneNumber}
            onChange={(e) =>
              setPhoneNumber(e.target.value)
            }
            placeholder="Enter phone number"
            className="w-full rounded-lg border px-4 py-3 outline-none focus:ring-2 focus:ring-black"
          />
        </div>

      </div>

      {error && (
        <div className="mt-5 rounded-lg bg-red-50 p-4 text-sm text-red-600">
          {error}
        </div>
      )}

      {message && (
        <div className="mt-5 rounded-lg bg-green-50 p-4 text-sm text-green-700">
          {message}
        </div>
      )}

      <button
        onClick={updateProfile}
        disabled={saving}
        className="mt-6 rounded-lg bg-black px-6 py-3 font-medium text-white hover:bg-gray-800 disabled:opacity-50"
      >
        {saving ? "Saving..." : "Save Changes"}
      </button>
    </section>

    {/* Student Information */}
    <section className="mt-6 rounded-xl bg-white p-6 shadow">
      <h2 className="text-xl font-bold">
        Student Information
      </h2>

      <p className="mt-2 text-sm text-gray-500">
        Academic information associated with your library account.
      </p>

      <div className="mt-6 grid gap-5 md:grid-cols-2">

        <div className="rounded-lg bg-gray-50 p-4">
          <p className="text-sm text-gray-500">
            Matric Number
          </p>

          <p className="mt-1 font-semibold">
            {student.matric_number}
          </p>
        </div>

        <div className="rounded-lg bg-gray-50 p-4">
          <p className="text-sm text-gray-500">
            Level
          </p>

          <p className="mt-1 font-semibold">
            {student.level
              ? `${student.level} Level`
              : "Not provided"}
          </p>
        </div>

        <div className="rounded-lg bg-gray-50 p-4">
          <p className="text-sm text-gray-500">
            Department
          </p>

          <p className="mt-1 font-semibold">
            {student.department || "Not provided"}
          </p>
        </div>

        <div className="rounded-lg bg-gray-50 p-4">
          <p className="text-sm text-gray-500">
            Faculty
          </p>

          <p className="mt-1 font-semibold">
            {student.faculty || "Not provided"}
          </p>
        </div>

      </div>
    </section>

  </div>
</main>


);
}
