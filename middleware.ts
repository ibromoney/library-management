
import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },

        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => {
            request.cookies.set(name, value);
          });

          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });

          cookiesToSet.forEach(
            ({ name, value, options }) => {
              response.cookies.set(
                name,
                value,
                options
              );
            }
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;

  // Protected student routes
  if (pathname.startsWith("/student")) {
    if (!user) {
      return NextResponse.redirect(
        new URL("/login", request.url)
      );
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profile?.role !== "student") {
      return NextResponse.redirect(
        new URL("/librarian/dashboard", request.url)
      );
    }
  }

  // Protected librarian routes
  if (pathname.startsWith("/librarian")) {
    if (!user) {
      return NextResponse.redirect(
        new URL("/login", request.url)
      );
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profile?.role !== "librarian") {
      return NextResponse.redirect(
        new URL("/student/dashboard", request.url)
      );
    }
  }

  return response;
}

export const config = {
  matcher: [
    "/student/:path*",
    "/librarian/:path*",
  ],
};
