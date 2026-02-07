import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { authSecret } from "@/lib/auth-secret";
import { canAccessPath, resolveRoleHome } from "@/lib/role-route";

export async function middleware(request) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/api/auth")) {
    return NextResponse.next();
  }

  const token = await getToken({ req: request, secret: authSecret });

  if (!token) {
    if (pathname === "/" || pathname === "/signup" || pathname === "/api/signup") {
      return NextResponse.next();
    }
    const url = new URL("/", request.url);
    url.searchParams.set("from", pathname);
    return NextResponse.redirect(url);
  }

  const role = typeof token.role === "string" ? token.role : "";
  const userType = typeof token.userType === "string" ? token.userType : "";

  if (pathname === "/") {
    const homePath = resolveRoleHome(userType, role);
    if (homePath === "/") {
      return NextResponse.next();
    }
    return NextResponse.redirect(new URL(homePath, request.url));
  }

  if (pathname.startsWith("/api/")) {
    return NextResponse.next();
  }

  if (!canAccessPath(userType, role, pathname)) {
    return NextResponse.redirect(new URL(resolveRoleHome(userType, role), request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
