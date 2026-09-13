import { NextResponse, type NextRequest } from "next/server";
import { isValidSessionToken, ADMIN_COOKIE_NAME } from "@/lib/adminAuth";

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Login page/endpoint must stay reachable while logged out.
  if (pathname === "/admin/login" || pathname === "/api/admin/login") {
    return NextResponse.next();
  }

  const token = req.cookies.get(ADMIN_COOKIE_NAME)?.value;
  if (await isValidSessionToken(token)) {
    return NextResponse.next();
  }

  if (pathname.startsWith("/api/admin")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const loginUrl = new URL("/admin/login", req.url);
  loginUrl.searchParams.set("next", pathname);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};
