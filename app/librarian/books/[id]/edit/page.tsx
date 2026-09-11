"use client";

import { FormEvent, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

const supabase = createClient();

export default function EditBookPage() {
const router = useRouter();
const params = useParams();

const bookId = Number(params.id);

const [loading, setLoading] = useState(true);
const [saving, setSaving] = useState(false);
const [error, setError] = useState("");

const [form, setForm] = useState({
title: "",
author: "",
isbn: "",
publisher: "",
publicationYear: "",
description: "",
coverImage: "",
});

useEffect(() => {
let cancelled = false;


async function loadBook() {
  const { data, error } = await supabase
    .from("books")
    .select("*")
    .eq("id", bookId)
    .single();

  if (cancelled) return;

  if (error || !data) {
    setError("Book could not be found.");
    setLoading(false);
    return;
  }

  setForm({
    title: data.title || "",
    author: data.author || "",
    isbn: data.isbn || "",
    publisher: data.publisher || "",
    publicationYear:
      data.publication_year?.toString() || "",
    description: data.description || "",
    coverImage: data.cover_image || "",
  });

  setLoading(false);
}

if (Number.isFinite(bookId) && bookId > 0) {
  void loadBook();
}

return () => {
  cancelled = true;
};


}, [bookId]);

async function handleSubmit(e: FormEvent) {
e.preventDefault();

setSaving(true);
setError("");

const { error } = await supabase
  .from("books")
  .update({
    title: form.title.trim(),
    author: form.author.trim(),
    isbn: form.isbn.trim() || null,
    publisher: form.publisher.trim() || null,
    publication_year: form.publicationYear
      ? Number(form.publicationYear)
      : null,
    description: form.description.trim() || null,
    cover_image: form.coverImage.trim() || null,
    updated_at: new Date().toISOString(),
  })
  .eq("id", bookId);

if (error) {
  setError(error.message);
  setSaving(false);
  return;
}

router.push("/librarian/books");
router.refresh();


}

function update(field: string, value: string) {
setForm((current) => ({
...current,
[field]: value,
}));
}

if (loading) {
return ( <main className="p-8">
Loading book... </main>
);
}

if (!Number.isFinite(bookId) || bookId <= 0) {
return ( <main className="min-h-screen bg-gray-100 p-6"> <div className="mx-auto max-w-3xl rounded-2xl bg-white p-8 shadow"> <h1 className="text-2xl font-bold">
Invalid Book </h1>


      <p className="mt-2 text-gray-500">
        The book ID is invalid.
      </p>

      <Link
        href="/librarian/books"
        className="mt-6 inline-block rounded-lg bg-black px-6 py-3 text-white"
      >
        Back to Books
      </Link>
    </div>
  </main>
);


}

return ( <main className="min-h-screen bg-gray-100 p-6"> <div className="mx-auto max-w-3xl"> <Link
       href="/librarian/books"
       className="text-sm underline"
     >
← Books </Link>


    <div className="mt-5 rounded-2xl bg-white p-8 shadow">
      <h1 className="text-3xl font-bold">
        Edit Book
      </h1>

      {error && (
        <div className="mt-5 rounded-lg bg-red-100 p-4 text-red-700">
          {error}
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="mt-8 space-y-5"
      >
        <div>
          <label className="mb-2 block text-sm font-medium">
            Book Title
          </label>
          <input
            required
            value={form.title}
            onChange={(e) =>
              update("title", e.target.value)
            }
            placeholder="Book title"
            className="w-full rounded-lg border p-3"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium">
            Author
          </label>
          <input
            required
            value={form.author}
            onChange={(e) =>
              update("author", e.target.value)
            }
            placeholder="Author"
            className="w-full rounded-lg border p-3"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium">
            ISBN
          </label>
          <input
            value={form.isbn}
            onChange={(e) =>
              update("isbn", e.target.value)
            }
            placeholder="ISBN"
            className="w-full rounded-lg border p-3"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium">
            Publisher
          </label>
          <input
            value={form.publisher}
            onChange={(e) =>
              update("publisher", e.target.value)
            }
            placeholder="Publisher"
            className="w-full rounded-lg border p-3"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium">
            Publication Year
          </label>
          <input
            type="number"
            value={form.publicationYear}
            onChange={(e) =>
              update(
                "publicationYear",
                e.target.value
              )
            }
            placeholder="Publication year"
            className="w-full rounded-lg border p-3"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium">
            Cover Image URL
          </label>
          <input
            value={form.coverImage}
            onChange={(e) =>
              update("coverImage", e.target.value)
            }
            placeholder="Cover image URL"
            className="w-full rounded-lg border p-3"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium">
            Description
          </label>
          <textarea
            rows={6}
            value={form.description}
            onChange={(e) =>
              update(
                "description",
                e.target.value
              )
            }
            placeholder="Description"
            className="w-full rounded-lg border p-3"
          />
        </div>

        <div className="flex gap-3">
          <Link
            href="/librarian/books"
            className="rounded-lg border px-6 py-3"
          >
            Cancel
          </Link>

          <button
            type="submit"
            disabled={saving}
            className="rounded-lg bg-black px-6 py-3 text-white disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </form>
    </div>
  </div>
</main>


);
}
