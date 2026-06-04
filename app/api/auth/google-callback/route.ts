import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get("token")

  if (!token) {
    return NextResponse.redirect(new URL("/signin?error=oauth_failed", request.url))
  }

  const response = NextResponse.redirect(new URL("/app", request.url))
  response.cookies.set("token", token, {
    httpOnly: true,
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  })
  return response
}
