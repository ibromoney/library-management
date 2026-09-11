"use client";

import { FormEvent, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";

type Category = {
  id: number;
  name: string;
};

const supabase = createClient();

export default function NewBookPage() {
  const router = useRouter();

  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingCategories, setLoadingCategories] =
    useState(true);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    title: "",
    author: "",
    isbn: "",
    publisher: "",
    publicationYear: "",
    description: "",
    categoryId: "",
    coverImage: "",
  });

  useEffect(() => {
    let cancelled = false;

    async function loadCategories() {
      const { data, error: categoryError } =
        await supabase
          .from("categories")
          .select("id, name")
          .order("name");

      if (cancelled) return;

      if (categoryError) {
        setError(categoryError.message);
        setCategories([]);
      } else {
        setCategories(data || []);
      }

      setLoadingCategories(false);
    }

    void loadCategories();

    return () => {
      cancelled = true;
    };
  }, []);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();

    setLoading(true);
    setError("");

    try {
      if (!form.title.trim()) {
        throw new Error("Book title is required.");
      }

      if (!form.author.trim()) {
        throw new Error("Author is required.");
      }

      const { error: insertError } = await supabase
        .from("books")
        .insert({
          title: form.title.trim(),
          author: form.author.trim(),
          isbn: form.isbn.trim() || null,
          publisher: form.publisher.trim() || null,
          publication_year: form.publicationYear
            ? Number(form.publicationYear)
            : null,
          description: form.description.trim() || null,
          category_id: form.categoryId
            ? Number(form.categoryId)
            : null,
          cover_image: form.coverImage.trim() || null,
        });

      if (insertError) {
        throw insertError;
      }

      router.push("/librarian/books");
      router.refresh();
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Unable to add book.");
      }
    } finally {
      setLoading(false);
    }
  }

  function updateField(field: string, value: string) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  return (
    <main className="min-h-screen bg-gray-100 p-6">
      <div className="mx-auto max-w-3xl">
        <Link
          href="/librarian/books"
          className="text-sm underline"
        >
          ← Books
        </Link>

        <div className="mt-5 rounded-2xl bg-white p-8 shadow">
          <h1 className="text-3xl font-bold">
            Add New Book
          </h1>

          <p className="mt-2 text-gray-500">
            Add a book to the library catalogue.
          </p>

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
              <label className="mb-2 block font-medium">
                Book Title *
              </label>

              <input
                required
                value={form.title}
                onChange={(e) =>
                  updateField("title", e.target.value)
                }
                className="w-full rounded-lg border p-3"
                placeholder="e.g. Gray's Anatomy"
              />
            </div>

            <div>
              <label className="mb-2 block font-medium">
                Author *
              </label>

              <input
                required
                value={form.author}
                onChange={(e) =>
                  updateField("author", e.target.value)
                }
                className="w-full rounded-lg border p-3"
                placeholder="Author name"
              />
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <div>
                <label className="mb-2 block font-medium">
                  ISBN
                </label>

                <input
                  value={form.isbn}
                  onChange={(e) =>
                    updateField("isbn", e.target.value)
                  }
                  className="w-full rounded-lg border p-3"
                />
              </div>

              <div>
                <label className="mb-2 block font-medium">
                  Publisher
                </label>

                <input
                  value={form.publisher}
                  onChange={(e) =>
                    updateField(
                      "publisher",
                      e.target.value
                    )
                  }
                  className="w-full rounded-lg border p-3"
                />
              </div>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <div>
                <label className="mb-2 block font-medium">
                  Publication Year
                </label>

                <input
                  type="number"
                  value={form.publicationYear}
                  onChange={(e) =>
                    updateField(
                      "publicationYear",
                      e.target.value
                    )
                  }
                  className="w-full rounded-lg border p-3"
                />
              </div>

              <div>
                <label className="mb-2 block font-medium">
                  Category
                </label>

                <select
                  value={form.categoryId}
                  onChange={(e) =>
                    updateField(
                      "categoryId",
                      e.target.value
                    )
                  }
                  className="w-full rounded-lg border p-3"
                >
                  <option value="">
                    Select category
                  </option>

                  {categories.map((category) => (
                    <option
                      key={category.id}
                      value={category.id}
                    >
                      {category.name}
                    </option>
                  ))}
                </select>

                {loadingCategories && (
                  <p className="mt-1 text-xs text-gray-500">
                    Loading categories...
                  </p>
                )}
              </div>
            </div>

            <div>
              <label className="mb-2 block font-medium">
                Cover Image URL
              </label>

              <input
                value={form.coverImage}
                onChange={(e) =>
                  updateField(
                    "coverImage",
                    e.target.value
                  )
                }
                className="w-full rounded-lg border p-3"
                placeholder="https://..."
              />
            </div>

            <div>
              <label className="mb-2 block font-medium">
                Description
              </label>

              <textarea
                rows={5}
                value={form.description}
                onChange={(e) =>
                  updateField(
                    "description",
                    e.target.value
                  )
                }
                className="w-full rounded-lg border p-3"
                placeholder="Book description..."
              />
            </div>

            <div className="flex gap-3 pt-3">
              <Link
                href="/librarian/books"
                className="rounded-lg border px-6 py-3"
              >
                Cancel
              </Link>

              <button
                type="submit"
                disabled={loading}
                className="rounded-lg bg-black px-6 py-3 text-white disabled:opacity-50"
              >
                {loading ? "Adding..." : "Add Book"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
}

