import { NextResponse } from "next/server";

const RESERVED_SEGMENTS = new Set(["new", "requester", "reception"]);

export function middleware(request) {
  const { pathname, searchParams } = request.nextUrl;

  if (!pathname.startsWith("/requests/")) {
    return NextResponse.next();
  }

  const segments = pathname.split("/").filter(Boolean);

  if (segments.length < 2) {
    return NextResponse.next();
  }

  if (RESERVED_SEGMENTS.has(segments[1])) {
    return NextResponse.next();
  }

  const id = segments[1];
  const roleParam = searchParams.get("role") === "reception" ? "reception" : "requester";
  let targetPath = `/requests/${roleParam}/${id}`;

  if (segments[2] === "adjust") {
    targetPath = `${targetPath}/adjust`;
  }

  const url = request.nextUrl.clone();
  url.pathname = targetPath;
  url.searchParams.delete("role");

  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/requests/:path*"],
};
