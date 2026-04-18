import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function proxy(request: NextRequest) {
  let response = NextResponse.next({
    request,
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
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Odświeżamy sesję — WAŻNE: getUser() nie getSession()
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const isPanel = request.nextUrl.pathname.startsWith("/panel");
  const isAdmin = request.nextUrl.pathname.startsWith("/admin");
  const isLogin = request.nextUrl.pathname === "/login";

  // Niezalogowany → panel/admin → redirect do logowania
  if (!user && (isPanel || isAdmin)) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Zalogowany → strona logowania → redirect do panelu
  if (user && isLogin) {
    return NextResponse.redirect(new URL("/panel", request.url));
  }

  return response;
}

export const config = {
  matcher: ["/panel/:path*", "/admin/:path*", "/login"],
};
