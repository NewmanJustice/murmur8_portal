export { auth as middleware } from "./auth";

export const config = {
  matcher: [
    /*
     * Match all request paths EXCEPT:
     * - / (the login/landing page — publicly accessible)
     * - /api/auth/(.*) (NextAuth internal routes)
     * - /_next/static (Next.js static assets)
     * - /_next/image (Next.js image optimisation)
     * - /favicon.ico
     */
    "/((?!api/auth|_next/static|_next/image|favicon.ico).*)",
  ],
};
