"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

type Student = {
id: number;
matric_number: string;
department: string | null;
faculty: string | null;
level: number | null;
profile_id: string;
profiles: {
first_name: string;
last_name: string;
email: string;
phone_number: string | null;
} | null;
};

const supabase = createClient();

export default function StudentsPage() {
const [students, setStudents] = useState<Student[]>([]);
const [search, setSearch] = useState("");
const [loading, setLoading] = useState(true);
const [error, setError] = useState("");

useEffect(() => {
let cancelled = false;


async function loadInitialStudents() {
  setLoading(true);
  setError("");

  const { data, error: fetchError } = await supabase
    .from("students")
    .select(`
      id,
      matric_number,
      department,
      faculty,
      level,
      profile_id,
      profiles (
        first_name,
        last_name,
        email,
        phone_number
      )
    `)
    .order("matric_number");

  if (cancelled) return;

  if (fetchError) {
    setError(fetchError.message);
    setStudents([]);
  } else {
    setStudents(
      (data as unknown as Student[]) || []
    );
  }

  setLoading(false);
}

void loadInitialStudents();

return () => {
  cancelled = true;
};


}, []);

const filteredStudents = students.filter((student) => {
const profile = student.profiles;


const searchText = `
  ${profile?.first_name || ""}
  ${profile?.last_name || ""}
  ${profile?.email || ""}
  ${student.matric_number}
  ${student.department || ""}
  ${student.faculty || ""}
`.toLowerCase();

return searchText.includes(search.toLowerCase());

});

return ( <main className="min-h-screen bg-gray-100 p-6"> <div className="mx-auto max-w-7xl">

```
    {/* Header */}
    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <div>
        <h1 className="text-3xl font-bold">
          Students
        </h1>

        <p className="mt-2 text-gray-500">
          View and manage registered library students.
        </p>
      </div>

      <Link
        href="/librarian/dashboard"
        className="rounded-lg border bg-white px-5 py-3 text-center hover:bg-gray-50"
      >
        ← Dashboard
      </Link>
    </div>

    {/* Error */}
    {error && (
      <div className="mt-6 rounded-lg bg-red-50 p-4 text-red-700">
        {error}
      </div>
    )}

    {/* Search */}
    <div className="mt-8 rounded-xl bg-white p-5 shadow">
      <label className="mb-2 block text-sm font-medium">
        Search Students
      </label>

      <input
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search by name, matric number, email, department..."
        className="w-full rounded-lg border px-4 py-3 outline-none focus:ring-2 focus:ring-black"
      />
    </div>

    {/* Statistics */}
    <div className="mt-6 grid gap-4 md:grid-cols-3">
      <div className="rounded-xl bg-white p-5 shadow">
        <p className="text-sm text-gray-500">
          Total Students
        </p>

        <p className="mt-2 text-3xl font-bold">
          {students.length}
        </p>
      </div>

      <div className="rounded-xl bg-white p-5 shadow">
        <p className="text-sm text-gray-500">
          Search Results
        </p>

        <p className="mt-2 text-3xl font-bold">
          {filteredStudents.length}
        </p>
      </div>

      <div className="rounded-xl bg-white p-5 shadow">
        <p className="text-sm text-gray-500">
          Departments
        </p>

        <p className="mt-2 text-3xl font-bold">
          {
            new Set(
              students
                .map((student) => student.department)
                .filter(Boolean)
            ).size
          }
        </p>
      </div>
    </div>

    {/* Student List */}
    <div className="mt-8 overflow-hidden rounded-xl bg-white shadow">

      <div className="border-b p-6">
        <h2 className="text-xl font-bold">
          Registered Students
        </h2>
      </div>

      {loading ? (
        <div className="p-8 text-center text-gray-500">
          Loading students...
        </div>
      ) : filteredStudents.length === 0 ? (
        <div className="p-8 text-center text-gray-500">
          {search
            ? "No students match your search."
            : "No students registered yet."}
        </div>
      ) : (
        <div className="divide-y">
          {filteredStudents.map((student) => {
            const profile = student.profiles;

            return (
              <div
                key={student.id}
                className="flex flex-col gap-5 p-6 md:flex-row md:items-center md:justify-between"
              >
                {/* Student */}
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-200 font-bold">
                    {profile?.first_name?.charAt(0)}
                    {profile?.last_name?.charAt(0)}
                  </div>

                  <div>
                    <h3 className="font-semibold">
                      {profile?.first_name}{" "}
                      {profile?.last_name}
                    </h3>

                    <p className="text-sm text-gray-500">
                      {profile?.email}
                    </p>
                  </div>
                </div>

                {/* Academic Info */}
                <div>
                  <p className="text-sm font-medium">
                    {student.matric_number}
                  </p>

                  <p className="text-sm text-gray-500">
                    {student.department ||
                      "Department not specified"}
                  </p>
                </div>

                {/* Level */}
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

                {/* View */}
                <Link
                  href={`/librarian/students/${student.id}`}
                  className="rounded-lg bg-black px-5 py-3 text-center text-white hover:bg-gray-800"
                >
                  View Student
                </Link>
              </div>
            );
          })}
        </div>
      )}

    </div>
  </div>
</main>


);
}
