import { NextRequest, NextResponse } from "next/server";

const protectedPaths = ["/reader", "/dashboard"];

export function proxy(request: NextRequest) {
  const isProtectedPath = protectedPaths.some((path) =>
    request.nextUrl.pathname.startsWith(path),
  );

  if (!isProtectedPath) {
    return NextResponse.next();
  }

  const accessToken = request.cookies.get("accessToken")?.value;
  console.log('Access Token:', accessToken);

  if (!accessToken) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", request.nextUrl.pathname);

    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/reader/:path*", "/dashboard/:path*"],
};