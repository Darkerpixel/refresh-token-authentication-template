import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createAccessToken } from "@/lib/auth";

export async function proxy(request: NextRequest) {
  const accessToken = request.cookies.get("access_token")?.value;
  const sessionToken = request.cookies.get("session_token")?.value;

  if (accessToken || !sessionToken) {
    return NextResponse.next();
  }

  const newAccessToken = await createAccessToken(sessionToken);

  if (!newAccessToken) {
    return NextResponse.next();
  }

  const response = NextResponse.next();
  response.cookies.set("access_token", newAccessToken, {
    httpOnly: true,
    path: "/",
    expires: new Date(Date.now() + 1000 * 60 * 15),
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
  });

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
