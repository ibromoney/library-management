"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

type Fine = {
  id: number;
  amount: number;
  reason: string;
  status: "unpaid" | "paid" | "waived";
  created_at: string;
  paid_at: string | null;
  student_id: number;
  borrowing_id: number;

  students: {
    matric_number: string;
    profiles: {
      first_name: string;
      last_name: string;
      email: string;
    } | null;
  } | null;

  borrowings: {
    book_copies: {
      barcode: string;
      books: {
        title: string;
        author: string;
      } | null;
    } | null;
  } | null;
};

const supabase = createClient();

export default function LibrarianFinesPage() {
  const [fines, setFines] = useState<Fine[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<number | null>(null);

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  async function loadFines() {
    setError("");

    const { data, error } = await supabase
      .from("fines")
      .select(`
        id,
        amount,
        reason,
        status,
        created_at,
        paid_at,
        student_id,
        borrowing_id,

        students (
          matric_number,

          profiles (
            first_name,
            last_name,
            email
          )
        ),

        borrowings (
          book_copies (
            barcode,

            books (
              title,
              author
            )
          )
        )
      `)
      .order("created_at", {
        ascending: false,
      });

    if (error) {
      setError(error.message);
      setFines([]);
    } else {
      setFines((data || []) as unknown as Fine[]);
    }

    setLoading(false);
  }

  useEffect(() => {
    let cancelled = false;

    async function loadInitialFines() {
      const { data, error } = await supabase
        .from("fines")
        .select(`
          id,
          amount,
          reason,
          status,
          created_at,
          paid_at,
          student_id,
          borrowing_id,

          students (
            matric_number,

            profiles (
              first_name,
              last_name,
              email
            )
          ),

          borrowings (
            book_copies (
              barcode,

              books (
                title,
                author
              )
            )
          )
        `)
        .order("created_at", {
          ascending: false,
        });

      if (cancelled) return;

      if (error) {
        setError(error.message);
        setFines([]);
      } else {
        setFines((data || []) as unknown as Fine[]);
      }

      setLoading(false);
    }

    void loadInitialFines();

    return () => {
      cancelled = true;
    };
  }, []);

  async function markAsPaid(fineId: number) {
    const confirmed = window.confirm(
      "Are you sure you want to mark this fine as paid?"
    );

    if (!confirmed) return;

    setProcessing(fineId);
    setError("");
    setMessage("");

    try {
      const { data, error } = await supabase.rpc(
        "mark_fine_paid",
        {
          p_fine_id: fineId,
          p_payment_method: "cash",
        }
      );

      if (error) {
        throw error;
      }

      setMessage(
        `Payment recorded successfully. Amount: ₦${Number(
          data.amount
        ).toLocaleString()}`
      );

      await loadFines();
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Unable to process payment.";

      setError(errorMessage);
    } finally {
      setProcessing(null);
    }
  }

  const filteredFines = fines.filter((fine) => {
    const profile = fine.students?.profiles;
    const book = fine.borrowings?.book_copies?.books;

    const text = `
      ${profile?.first_name || ""}
      ${profile?.last_name || ""}
      ${profile?.email || ""}
      ${fine.students?.matric_number || ""}
      ${book?.title || ""}
      ${fine.reason}
    `.toLowerCase();

    const matchesSearch = text.includes(
      search.toLowerCase()
    );

    const matchesStatus =
      statusFilter === "all" ||
      fine.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const totalOutstanding = fines
    .filter((fine) => fine.status === "unpaid")
    .reduce(
      (total, fine) =>
        total + Number(fine.amount),
      0
    );

  const totalPaid = fines
    .filter((fine) => fine.status === "paid")
    .reduce(
      (total, fine) =>
        total + Number(fine.amount),
      0
    );

  const unpaidCount = fines.filter(
    (fine) => fine.status === "unpaid"
  ).length;

  return (
    <main className="min-h-screen bg-gray-100 p-6">
      <div className="mx-auto max-w-7xl">

        {/* Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold">
              Fines & Payments
            </h1>

            <p className="mt-2 text-gray-500">
              Manage student fines and record payments.
            </p>
          </div>

          <Link
            href="/librarian/dashboard"
            className="rounded-lg border bg-white px-5 py-3 text-center hover:bg-gray-50"
          >
            ← Dashboard
          </Link>
        </div>

        {/* Messages */}
        {error && (
          <div className="mt-6 rounded-lg bg-red-50 p-4 text-red-700">
            {error}
          </div>
        )}

        {message && (
          <div className="mt-6 rounded-lg bg-green-50 p-4 text-green-700">
            {message}
          </div>
        )}

        {/* Statistics */}
        <div className="mt-8 grid gap-4 md:grid-cols-3">

          <div className="rounded-xl bg-white p-5 shadow">
            <p className="text-sm text-gray-500">
              Outstanding
            </p>

            <p className="mt-2 text-3xl font-bold text-red-600">
              ₦{totalOutstanding.toLocaleString()}
            </p>

            <p className="mt-1 text-sm text-gray-500">
              {unpaidCount} unpaid fine
              {unpaidCount !== 1 ? "s" : ""}
            </p>
          </div>

          <div className="rounded-xl bg-white p-5 shadow">
            <p className="text-sm text-gray-500">
              Collected
            </p>

            <p className="mt-2 text-3xl font-bold text-green-600">
              ₦{totalPaid.toLocaleString()}
            </p>
          </div>

          <div className="rounded-xl bg-white p-5 shadow">
            <p className="text-sm text-gray-500">
              Total Fines
            </p>

            <p className="mt-2 text-3xl font-bold">
              {fines.length}
            </p>
          </div>

        </div>

        {/* Filters */}
        <div className="mt-8 rounded-xl bg-white p-5 shadow">
          <div className="grid gap-4 md:grid-cols-[1fr_200px]">

            <input
              type="text"
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
              placeholder="Search student, matric number, email or book..."
              className="rounded-lg border px-4 py-3 outline-none focus:ring-2 focus:ring-black"
            />

            <select
              value={statusFilter}
              onChange={(e) =>
                setStatusFilter(e.target.value)
              }
              className="rounded-lg border px-4 py-3 outline-none"
            >
              <option value="all">
                All Status
              </option>

              <option value="unpaid">
                Unpaid
              </option>

              <option value="paid">
                Paid
              </option>

              <option value="waived">
                Waived
              </option>
            </select>

          </div>
        </div>

        {/* Fines */}
        <div className="mt-8 overflow-hidden rounded-xl bg-white shadow">

          <div className="border-b p-6">
            <h2 className="text-xl font-bold">
              Fine Records
            </h2>
          </div>

          {loading ? (
            <div className="p-8 text-center text-gray-500">
              Loading fines...
            </div>
          ) : filteredFines.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              No fines found.
            </div>
          ) : (
            <div className="divide-y">

              {filteredFines.map((fine) => {
                const profile =
                  fine.students?.profiles;

                const book =
                  fine.borrowings?.book_copies?.books;

                const isProcessing =
                  processing === fine.id;

                return (
                  <div
                    key={fine.id}
                    className="p-6"
                  >

                    <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">

                      {/* Student */}
                      <div className="min-w-0">
                        <p className="font-semibold">
                          {profile?.first_name}{" "}
                          {profile?.last_name}
                        </p>

                        <p className="text-sm text-gray-500">
                          {profile?.email}
                        </p>

                        <p className="mt-1 text-sm font-medium">
                          {fine.students?.matric_number}
                        </p>
                      </div>

                      {/* Book */}
                      <div className="min-w-0">
                        <p className="font-medium">
                          {book?.title ||
                            "Unknown book"}
                        </p>

                        <p className="text-sm text-gray-500">
                          {book?.author}
                        </p>

                        <p className="mt-1 text-xs text-gray-400">
                          Barcode:{" "}
                          {fine.borrowings
                            ?.book_copies?.barcode ||
                            "N/A"}
                        </p>
                      </div>

                      {/* Fine */}
                      <div>
                        <p className="text-sm text-gray-500">
                          Amount
                        </p>

                        <p className="text-xl font-bold">
                          ₦
                          {Number(
                            fine.amount
                          ).toLocaleString()}
                        </p>
                      </div>

                      {/* Status */}
                      <div>
                        <span
                          className={`rounded-full px-3 py-1 text-sm font-medium ${
                            fine.status === "paid"
                              ? "bg-green-100 text-green-700"
                              : fine.status ===
                                "waived"
                              ? "bg-gray-100 text-gray-700"
                              : "bg-red-100 text-red-700"
                          }`}
                        >
                          {fine.status}
                        </span>

                        <p className="mt-2 text-xs text-gray-500">
                          {new Date(
                            fine.created_at
                          ).toLocaleDateString()}
                        </p>
                      </div>

                      {/* Action */}
                      <div>
                        {fine.status === "unpaid" && (
                          <button
                            onClick={() =>
                              markAsPaid(fine.id)
                            }
                            disabled={isProcessing}
                            className="rounded-lg bg-black px-5 py-3 text-white hover:bg-gray-800 disabled:opacity-50"
                          >
                            {isProcessing
                              ? "Processing..."
                              : "Mark as Paid"}
                          </button>
                        )}

                        {fine.status === "paid" && (
                          <span className="text-sm text-green-600">
                            Payment completed
                          </span>
                        )}
                      </div>

                    </div>

                    {/* Payment Date */}
                    {fine.paid_at && (
                      <p className="mt-4 border-t pt-4 text-sm text-gray-500">
                        Paid on{" "}
                        {new Date(
                          fine.paid_at
                        ).toLocaleDateString()}
                      </p>
                    )}

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
