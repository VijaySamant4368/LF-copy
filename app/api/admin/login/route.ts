import { NextRequest, NextResponse } from "next/server";
import { checkPassword, createSessionToken, ADMIN_COOKIE_NAME, ADMIN_COOKIE_MAX_AGE_SECONDS } from "@/lib/adminAuth";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const password = body?.password;
  if (!checkPassword(password)) {
    return NextResponse.json({ error: "Incorrect password" }, { status: 401 });
  }

  const token = await createSessionToken();
  const res = NextResponse.json({ ok: true });
  res.cookies.set(ADMIN_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: ADMIN_COOKIE_MAX_AGE_SECONDS,
    path: "/",
  });
  return res;
}
