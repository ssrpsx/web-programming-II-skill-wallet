import { NextRequest, NextResponse } from "next/server"

export function middleware(request: NextRequest) {
  const token = request.cookies.get("token")
  const isAuth = !!token?.value
  const pathname = request.nextUrl.pathname

  // Redirect unauthenticated users away from protected routes
  if ((pathname.startsWith("/app") || pathname.startsWith("/verify")) && !isAuth) {
    return NextResponse.redirect(new URL("/signin", request.url))
  }

  // Redirect authenticated users away from auth pages
  if ((pathname === "/signin" || pathname === "/signup") && isAuth) {
    return NextResponse.redirect(new URL("/app", request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/app/:path*", "/verify/:path*", "/signin", "/signup"],
}
