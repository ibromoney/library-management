import Link from "next/link";

export default function Home() {
return ( <main className="min-h-screen bg-white text-gray-900">
{/* Navigation */} <header className="border-b bg-white"> <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5 lg:px-8"> <Link
         href="/"
         className="flex items-center gap-3"
       > <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-black text-xl">
📚 </div>

```
        <div>
          <h1 className="text-lg font-bold">
            Library Management
          </h1>
          <p className="text-xs text-gray-500">
            Smart • Simple • Accessible
          </p>
        </div>
      </Link>

      <nav className="hidden items-center gap-8 md:flex">
        <Link
          href="/"
          className="text-sm font-medium text-gray-900"
        >
          Home
        </Link>

        <Link
          href="/books"
          className="text-sm font-medium text-gray-500 transition hover:text-black"
        >
          Books
        </Link>

        <Link
          href="/login"
          className="text-sm font-medium text-gray-500 transition hover:text-black"
        >
          Login
        </Link>

        <Link
          href="/register"
          className="rounded-lg bg-black px-5 py-2.5 text-sm font-medium text-white transition hover:bg-gray-800"
        >
          Get Started
        </Link>
      </nav>

      <Link
        href="/login"
        className="rounded-lg bg-black px-4 py-2 text-sm font-medium text-white md:hidden"
      >
        Login
      </Link>
    </div>
  </header>

  {/* Hero */}
  <section className="relative overflow-hidden bg-gray-50">
    <div className="mx-auto max-w-7xl px-6 py-20 lg:px-8 lg:py-28">
      <div className="grid items-center gap-14 lg:grid-cols-2">
        <div>
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border bg-white px-4 py-2 text-sm text-gray-600 shadow-sm">
            <span>📖</span>
            <span>Modern Library Management</span>
          </div>

          <h2 className="max-w-3xl text-5xl font-bold tracking-tight text-gray-950 sm:text-6xl">
            Your Library,
            <span className="block text-gray-500">
              Simplified.
            </span>
          </h2>

          <p className="mt-6 max-w-xl text-lg leading-8 text-gray-600">
            Discover books, manage your borrowing,
            track returns, view fines, and stay
            updated with important library
            notifications — all in one place.
          </p>

          <div className="mt-8 flex flex-col gap-4 sm:flex-row">
            <Link
              href="/register"
              className="rounded-xl bg-black px-7 py-4 text-center font-semibold text-white transition hover:bg-gray-800"
            >
              Create Student Account
            </Link>

            <Link
              href="/login"
              className="rounded-xl border border-gray-300 bg-white px-7 py-4 text-center font-semibold transition hover:bg-gray-100"
            >
              Sign In
            </Link>
          </div>

          <p className="mt-5 text-sm text-gray-500">
            Students and librarians can access the
            system securely.
          </p>
        </div>

        {/* Hero Card */}
        <div className="relative">
          <div className="rounded-3xl border bg-white p-6 shadow-xl">
            <div className="rounded-2xl bg-gray-950 p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">
                    Library Dashboard
                  </p>
                  <h3 className="mt-1 text-2xl font-bold">
                    Welcome Back 👋
                  </h3>
                </div>

                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/10 text-2xl">
                  📚
                </div>
              </div>

              <div className="mt-8 grid grid-cols-2 gap-4">
                <div className="rounded-2xl bg-white/10 p-5">
                  <p className="text-3xl font-bold">
                    📖
                  </p>
                  <p className="mt-3 text-sm text-gray-400">
                    Books
                  </p>
                  <p className="mt-1 font-semibold">
                    Browse Collection
                  </p>
                </div>

                <div className="rounded-2xl bg-white/10 p-5">
                  <p className="text-3xl font-bold">
                    🔄
                  </p>
                  <p className="mt-3 text-sm text-gray-400">
                    Borrowing
                  </p>
                  <p className="mt-1 font-semibold">
                    Track Your Books
                  </p>
                </div>

                <div className="rounded-2xl bg-white/10 p-5">
                  <p className="text-3xl font-bold">
                    💰
                  </p>
                  <p className="mt-3 text-sm text-gray-400">
                    Fines
                  </p>
                  <p className="mt-1 font-semibold">
                    Manage Payments
                  </p>
                </div>

                <div className="rounded-2xl bg-white/10 p-5">
                  <p className="text-3xl font-bold">
                    🔔
                  </p>
                  <p className="mt-3 text-sm text-gray-400">
                    Notifications
                  </p>
                  <p className="mt-1 font-semibold">
                    Stay Updated
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="absolute -bottom-5 -left-5 hidden rounded-2xl border bg-white p-4 shadow-lg sm:block">
            <p className="text-xs text-gray-500">
              Easy & Secure
            </p>
            <p className="font-bold">
              Library Access
            </p>
          </div>
        </div>
      </div>
    </div>
  </section>

  {/* Features */}
  <section className="bg-white py-20">
    <div className="mx-auto max-w-7xl px-6 lg:px-8">
      <div className="mx-auto max-w-2xl text-center">
        <p className="text-sm font-semibold uppercase tracking-widest text-gray-500">
          Everything you need
        </p>

        <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
          A better way to manage your library
        </h2>

        <p className="mt-4 text-gray-600">
          Built to make borrowing, returning, and
          managing library resources easier for
          everyone.
        </p>
      </div>

      <div className="mt-14 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <FeatureCard
          icon="🔎"
          title="Find Books"
          description="Search and explore books available in the library collection."
        />

        <FeatureCard
          icon="📚"
          title="Borrow Books"
          description="Borrow available books and keep track of your due dates."
        />

        <FeatureCard
          icon="🔄"
          title="Track Returns"
          description="View your borrowed books and return them when you're done."
        />

        <FeatureCard
          icon="🔔"
          title="Stay Updated"
          description="Receive important notifications about your library activity."
        />
      </div>
    </div>
  </section>

  {/* How It Works */}
  <section className="bg-gray-50 py-20">
    <div className="mx-auto max-w-7xl px-6 lg:px-8">
      <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
        <div>
          <p className="text-sm font-semibold uppercase tracking-widest text-gray-500">
            How it works
          </p>

          <h2 className="mt-3 text-3xl font-bold sm:text-4xl">
            Manage your library experience in a few
            simple steps.
          </h2>

          <p className="mt-5 leading-7 text-gray-600">
            Everything is designed to be simple,
            whether you&apos;re a student borrowing a book
            or a librarian managing the collection.
          </p>
        </div>

        <div className="space-y-5">
          <Step
            number="01"
            title="Create an account"
            description="Register as a student and access your personal library dashboard."
          />

          <Step
            number="02"
            title="Find your book"
            description="Browse the available collection and find the book you need."
          />

          <Step
            number="03"
            title="Borrow and return"
            description="Borrow available books and return them before their due dates."
          />

          <Step
            number="04"
            title="Track everything"
            description="Monitor your borrowing history, fines and notifications."
          />
        </div>
      </div>
    </div>
  </section>

  {/* CTA */}
  <section className="bg-gray-950 py-20 text-white">
    <div className="mx-auto max-w-4xl px-6 text-center">
      <div className="text-5xl">📚</div>

      <h2 className="mt-6 text-3xl font-bold sm:text-4xl">
        Ready to explore the library?
      </h2>

      <p className="mx-auto mt-4 max-w-2xl text-gray-400">
        Create your account and start discovering,
        borrowing, and managing your books today.
      </p>

      <div className="mt-8 flex flex-col justify-center gap-4 sm:flex-row">
        <Link
          href="/register"
          className="rounded-xl bg-white px-7 py-4 font-semibold text-black transition hover:bg-gray-200"
        >
          Get Started
        </Link>

        <Link
          href="/login"
          className="rounded-xl border border-gray-700 px-7 py-4 font-semibold transition hover:bg-gray-900"
        >
          Sign In
        </Link>
      </div>
    </div>
  </section>

  {/* Footer */}
  <footer className="border-t bg-white">
    <div className="mx-auto flex max-w-7xl flex-col gap-4 px-6 py-8 sm:flex-row sm:items-center sm:justify-between lg:px-8">
      <div>
        <p className="font-semibold">
          📚 Library Management System
        </p>
        <p className="mt-1 text-sm text-gray-500">
          Making library management simple.
        </p>
      </div>

      <div className="flex gap-6 text-sm text-gray-500">
        <Link
          href="/books"
          className="hover:text-black"
        >
          Books
        </Link>

        <Link
          href="/login"
          className="hover:text-black"
        >
          Login
        </Link>

        <Link
          href="/register"
          className="hover:text-black"
        >
          Register
        </Link>
      </div>
    </div>

    <div className="border-t py-5 text-center text-sm text-gray-500">
      © {new Date().getFullYear()} Library Management
      System. All rights reserved.
    </div>
  </footer>
</main>


);
}

function FeatureCard({
icon,
title,
description,
}: {
icon: string;
title: string;
description: string;
}) {
return ( <div className="rounded-2xl border bg-white p-6 transition hover:-translate-y-1 hover:shadow-lg"> <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gray-100 text-2xl">
{icon} </div>


  <h3 className="mt-5 text-lg font-bold">
    {title}
  </h3>

  <p className="mt-2 text-sm leading-6 text-gray-600">
    {description}
  </p>
</div>


);
}

function Step({
number,
title,
description,
}: {
number: string;
title: string;
description: string;
}) {
return ( <div className="flex gap-5 rounded-2xl border bg-white p-5 shadow-sm"> <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gray-950 text-sm font-bold text-white">
{number} </div>


  <div>
    <h3 className="font-bold">{title}</h3>

    <p className="mt-1 text-sm leading-6 text-gray-600">
      {description}
    </p>
  </div>
</div>


);
}
