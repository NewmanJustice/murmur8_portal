import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import { authConfig } from "./auth.config";

// Dev autologin — bypasses GitHub OAuth when DEV_AUTOLOGIN=true.
// Uses the seed user so all dashboard pages render real data immediately.
// Never set this in production.
export const DEV_SESSION =
  process.env.DEV_AUTOLOGIN === 'true'
    ? {
        user: {
          id: 'cmpedsftq0000em57ejkpeeqg',
          name: 'Steve Newman',
          email: 'steve@example.com',
          image: null,
          isAdmin: true,
        },
        expires: new Date(Date.now() + 86_400_000 * 30).toISOString(),
      }
    : null;

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  adapter: PrismaAdapter(prisma),

  callbacks: {
    async signIn(params) {
      // Org membership check (delegated to authConfig — edge-safe)
      const allowed = await authConfig.callbacks!.signIn!(params);
      if (!allowed) return false;

      // Backfill githubId, image, isAdmin after the adapter creates the user
      const { profile } = params;
      if (profile?.id) {
        const githubId = String(profile.id);
        const image = (profile as { avatar_url?: string }).avatar_url ?? null;
        const isAdmin =
          process.env.ADMIN_GITHUB_ID !== undefined && process.env.ADMIN_GITHUB_ID !== ""
            ? githubId === process.env.ADMIN_GITHUB_ID
            : false;

        // The adapter has already upserted the User by this point — just patch our extra fields
        await prisma.user.updateMany({
          where: { email: (profile.email as string | null) ?? undefined, githubId: null },
          data: { githubId, image, isAdmin },
        });
      }

      return true;
    },

    async session({ session, user }) {
      if (session.user && user) {
        const dbUser = await prisma.user.findUnique({
          where: { id: user.id },
          select: { id: true, isAdmin: true, image: true },
        });
        if (dbUser) {
          (session.user as typeof session.user & { id: string; isAdmin: boolean; image: string | null }).id = dbUser.id;
          (session.user as typeof session.user & { id: string; isAdmin: boolean; image: string | null }).isAdmin = dbUser.isAdmin;
          (session.user as typeof session.user & { id: string; isAdmin: boolean; image: string | null }).image = dbUser.image;
        }
      }
      return session;
    },
  },
});

// getSession — use this in Server Components and Route Handlers instead of auth().
// In dev autologin mode returns the fake session directly without touching NextAuth.
export async function getSession() {
  if (DEV_SESSION) return DEV_SESSION;
  return auth();
}
