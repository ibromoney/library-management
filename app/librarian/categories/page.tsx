"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type Category = {
  id: number;
  name: string;
  description: string | null;
  created_at: string;
};

const supabase = createClient();

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const [editingId, setEditingId] = useState<number | null>(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  async function loadCategories() {
    setLoading(true);
    setError("");

    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .order("name");

    if (error) {
      setError(error.message);
    } else {
      setCategories(data || []);
    }

    setLoading(false);
  }

  useEffect(() => {
    let cancelled = false;

    async function loadInitialCategories() {
      setLoading(true);
      setError("");

      const { data, error } = await supabase
        .from("categories")
        .select("*")
        .order("name");

      if (cancelled) return;

      if (error) {
        setError(error.message);
      } else {
        setCategories(data || []);
      }

      setLoading(false);
    }

    void loadInitialCategories();

    return () => {
      cancelled = true;
    };
  }, []);

  function resetForm() {
    setName("");
    setDescription("");
    setEditingId(null);
  }

  async function saveCategory(e: React.FormEvent) {
    e.preventDefault();

    setError("");
    setMessage("");

    if (!name.trim()) {
      setError("Category name is required.");
      return;
    }

    setSaving(true);

    try {
      if (editingId !== null) {
        const { error } = await supabase
          .from("categories")
          .update({
            name: name.trim(),
            description: description.trim() || null,
          })
          .eq("id", editingId);

        if (error) {
          throw error;
        }

        setMessage("Category updated successfully.");
      } else {
        const { error } = await supabase
          .from("categories")
          .insert({
            name: name.trim(),
            description: description.trim() || null,
          });

        if (error) {
          if (error.code === "23505") {
            throw new Error(
              "A category with this name already exists."
            );
          }

          throw error;
        }

        setMessage("Category added successfully.");
      }

      resetForm();
      await loadCategories();
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Unable to save category.");
      }
    } finally {
      setSaving(false);
    }
  }

  function editCategory(category: Category) {
    setEditingId(category.id);
    setName(category.name);
    setDescription(category.description || "");

    setError("");
    setMessage("");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  async function deleteCategory(id: number) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this category?"
    );

    if (!confirmed) return;

    setError("");
    setMessage("");

    const { error } = await supabase
      .from("categories")
      .delete()
      .eq("id", id);

    if (error) {
      if (error.code === "23503") {
        setError(
          "This category cannot be deleted because books are using it."
        );
      } else {
        setError(error.message);
      }

      return;
    }

    setMessage("Category deleted successfully.");

    await loadCategories();
  }

  return (
    <main className="min-h-screen bg-gray-100 p-6">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">
            Categories
          </h1>

          <p className="mt-2 text-gray-500">
            Manage your library book categories.
          </p>
        </div>

        {error && (
          <div className="mb-5 rounded-lg bg-red-50 p-4 text-red-700">
            {error}
          </div>
        )}

        {message && (
          <div className="mb-5 rounded-lg bg-green-50 p-4 text-green-700">
            {message}
          </div>
        )}

        <div className="rounded-xl bg-white p-6 shadow">
          <h2 className="text-xl font-bold">
            {editingId !== null
              ? "Edit Category"
              : "Add Category"}
          </h2>

          <form
            onSubmit={saveCategory}
            className="mt-5 space-y-4"
          >
            <div>
              <label className="mb-2 block text-sm font-medium">
                Category Name
              </label>

              <input
                type="text"
                value={name}
                onChange={(e) =>
                  setName(e.target.value)
                }
                placeholder="e.g. Physiology"
                className="w-full rounded-lg border px-4 py-3 outline-none focus:ring-2 focus:ring-black"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">
                Description
              </label>

              <textarea
                value={description}
                onChange={(e) =>
                  setDescription(e.target.value)
                }
                placeholder="Describe this category..."
                rows={4}
                className="w-full rounded-lg border px-4 py-3 outline-none focus:ring-2 focus:ring-black"
              />
            </div>

            <div className="flex gap-3">
              <button
                type="submit"
                disabled={saving}
                className="rounded-lg bg-black px-6 py-3 text-white disabled:opacity-50"
              >
                {saving
                  ? "Saving..."
                  : editingId !== null
                  ? "Update Category"
                  : "Add Category"}
              </button>

              {editingId !== null && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="rounded-lg border px-6 py-3"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>

        <div className="mt-8 rounded-xl bg-white shadow">
          <div className="border-b p-6">
            <h2 className="text-xl font-bold">
              All Categories
            </h2>
          </div>

          {loading ? (
            <div className="p-6 text-gray-500">
              Loading categories...
            </div>
          ) : categories.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              No categories have been created yet.
            </div>
          ) : (
            <div className="divide-y">
              {categories.map((category) => (
                <div
                  key={category.id}
                  className="flex flex-col gap-4 p-6 md:flex-row md:items-center md:justify-between"
                >
                  <div>
                    <h3 className="font-semibold">
                      {category.name}
                    </h3>

                    <p className="mt-1 text-sm text-gray-500">
                      {category.description ||
                        "No description"}
                    </p>
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={() =>
                        editCategory(category)
                      }
                      className="rounded-lg border px-4 py-2 hover:bg-gray-50"
                    >
                      Edit
                    </button>

                    <button
                      onClick={() =>
                        deleteCategory(category.id)
                      }
                      className="rounded-lg bg-red-600 px-4 py-2 text-white hover:bg-red-700"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

