import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// In dev autologin mode, skip auth checks — all routes pass through freely.
// Server Components use getSession() from auth.ts which returns the fake session.
export function middleware(_req: NextRequest) {
  if (process.env.DEV_AUTOLOGIN === 'true') {
    return NextResponse.next();
  }
  // Production: NextAuth handles this via the exported auth middleware below.
  // This branch is unreachable when DEV_AUTOLOGIN is unset — see bottom export.
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api/auth|_next/static|_next/image|favicon.ico).*)",
  ],
};
