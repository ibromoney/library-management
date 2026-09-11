"use client";

import { FormEvent, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

const supabase = createClient();

type RegisterForm = {
firstName: string;
lastName: string;
email: string;
password: string;
phone: string;
role: "student" | "librarian";
matricNumber: string;
department: string;
faculty: string;
level: string;
staffId: string;
};

export default function RegisterPage() {
const router = useRouter();

const [loading, setLoading] = useState(false);
const [error, setError] = useState("");
const [message, setMessage] = useState("");

const [form, setForm] = useState<RegisterForm>({
firstName: "",
lastName: "",
email: "",
password: "",
phone: "",
role: "student",
matricNumber: "",
department: "",
faculty: "",
level: "",
staffId: "",
});

async function handleRegister(e: FormEvent) {
e.preventDefault();


setLoading(true);
setError("");
setMessage("");

try {
  const firstName = form.firstName.trim();
  const lastName = form.lastName.trim();
  const email = form.email.trim().toLowerCase();
  const phone = form.phone.trim();
  const matricNumber = form.matricNumber.trim();
  const department = form.department.trim();
  const faculty = form.faculty.trim();
  const staffId = form.staffId.trim();

  if (!firstName || !lastName) {
    throw new Error(
      "First name and last name are required."
    );
  }

  if (form.password.length < 6) {
    throw new Error(
      "Password must be at least 6 characters."
    );
  }

  if (
    form.role === "student" &&
    !matricNumber
  ) {
    throw new Error(
      "Matric number is required."
    );
  }

  if (
    form.role === "librarian" &&
    !staffId
  ) {
    throw new Error(
      "Staff ID is required."
    );
  }

  const { data, error: authError } =
    await supabase.auth.signUp({
      email,
      password: form.password,
      options: {
        data: {
          first_name: firstName,
          last_name: lastName,
          phone_number: phone || null,
          role: form.role,
          matric_number:
            form.role === "student"
              ? matricNumber
              : null,
          department:
            form.role === "student"
              ? department || null
              : null,
          faculty:
            form.role === "student"
              ? faculty || null
              : null,
          level:
            form.role === "student" && form.level
              ? Number(form.level)
              : null,
          staff_id:
            form.role === "librarian"
              ? staffId
              : null,
        },
      },
    });

  if (authError) {
    throw new Error(
      authError.message
    );
  }

  if (!data.user) {
    throw new Error(
      "Unable to create account."
    );
  }

  setMessage(
    "Account created successfully. Please check your email to confirm your account."
  );

  setTimeout(() => {
    router.push("/login");
  }, 2500);
} catch (err: unknown) {
  if (
    err &&
    typeof err === "object" &&
    "message" in err &&
    typeof err.message === "string"
  ) {
    setError(err.message);
  } else if (err instanceof Error) {
    setError(err.message);
  } else {
    setError(
      "Registration failed. Please try again."
    );
  }
} finally {
  setLoading(false);
}


}

function updateField(
name: keyof RegisterForm,
value: string
) {
setForm((prev) => ({
...prev,
[name]: value,
}));
}

return ( <main className="flex min-h-screen items-center justify-center bg-gray-100 p-6"> <div className="w-full max-w-2xl rounded-2xl bg-white p-8 shadow-lg"> <h1 className="text-center text-3xl font-bold text-gray-700">
Create Account </h1>

    <p className="mt-2 text-center text-black">
      Library Management System
    </p>

    {error && (
      <div className="mt-5 rounded-lg bg-red-100 p-4 text-red-700">
        <p className="font-medium">
          Registration failed
        </p>

        <p className="mt-1 text-sm">
          {error}
        </p>
      </div>
    )}

    {message && (
      <div className="mt-5 rounded-lg bg-green-100 p-4 text-green-700">
        {message}
      </div>
    )}

    <form
      onSubmit={handleRegister}
      className="mt-6 space-y-5"
    >
      <div className="grid gap-4 md:grid-cols-2">
        <input
          required
          placeholder="First name"
          value={form.firstName}
          onChange={(e) =>
            updateField(
              "firstName",
              e.target.value
            )
          }
          className="w-full rounded-lg border p-3 text-black"
        />

        <input
          required
          placeholder="Last name"
          value={form.lastName}
          onChange={(e) =>
            updateField(
              "lastName",
              e.target.value
            )
          }
          className="w-full rounded-lg border p-3  text-black"
        />
      </div>

      <input
        required
        type="email"
        placeholder="Email"
        value={form.email}
        onChange={(e) =>
          updateField(
            "email",
            e.target.value
          )
        }
        className="w-full rounded-lg border p-3  text-black"
      />

      <input
        required
        type="password"
        minLength={6}
        placeholder="Password"
        value={form.password}
        onChange={(e) =>
          updateField(
            "password",
            e.target.value
          )
        }
        className="w-full rounded-lg border p-3  text-black"
      />

      <input
        placeholder="Phone number"
        value={form.phone}
        onChange={(e) =>
          updateField(
            "phone",
            e.target.value
          )
        }
        className="w-full rounded-lg border p-3  text-black"
      />

      <select
        value={form.role}
        onChange={(e) =>
          updateField(
            "role",
            e.target.value as
              | "student"
              | "librarian"
          )
        }
        className="w-full rounded-lg border p-3  text-black"
      >
        <option value="student">
          Student
        </option>

        <option value="librarian">
          Librarian
        </option>
      </select>

      {form.role === "student" && (
        <div className="space-y-4">
          <input
            required
            placeholder="Matric Number"
            value={form.matricNumber}
            onChange={(e) =>
              updateField(
                "matricNumber",
                e.target.value
              )
            }
            className="w-full rounded-lg border p-3  text-black"
          />

          <input
            placeholder="Department"
            value={form.department}
            onChange={(e) =>
              updateField(
                "department",
                e.target.value
              )
            }
            className="w-full rounded-lg border p-3  text-black"
          />

          <input
            placeholder="Faculty"
            value={form.faculty}
            onChange={(e) =>
              updateField(
                "faculty",
                e.target.value
              )
            }
            className="w-full rounded-lg border p-3  text-black"
          />

          <input
            type="number"
            placeholder="Level"
            value={form.level}
            onChange={(e) =>
              updateField(
                "level",
                e.target.value
              )
            }
            className="w-full rounded-lg border p-3  text-black"
          />
        </div>
      )}

      {form.role === "librarian" && (
        <input
          required
          placeholder="Staff ID"
          value={form.staffId}
          onChange={(e) =>
            updateField(
              "staffId",
              e.target.value
            )
          }
          className="w-full rounded-lg border p-3  text-black"
        />
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-lg bg-black py-3 font-medium text-white transition hover:bg-gray-800 disabled:opacity-50"
      >
        {loading
          ? "Creating account..."
          : "Create Account"}
      </button>
    </form>

    <p className="mt-6 text-center text-sm text-gray-600">
      Already have an account?{" "}
      <button
        type="button"
        onClick={() =>
          router.push("/login")
        }
        className="font-semibold text-black underline"
      >
        Login
      </button>
    </p>
  </div>
</main>

);
}
