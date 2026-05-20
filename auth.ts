import NextAuth from "next-auth";
import GitHub from "next-auth/providers/github";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";

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
          avatarUrl: null as string | null,
        },
        expires: new Date(Date.now() + 86_400_000 * 30).toISOString(),
      }
    : null;

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),

  providers: [
    GitHub({
      clientId: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
      authorization: {
        params: {
          scope: process.env.GITHUB_ORG_CHECK === 'true'
            ? 'read:user user:email read:org'
            : 'read:user user:email',
        },
      },
    }),
  ],

  session: {
    strategy: "database",
  },

  pages: {
    signIn: "/",
  },

  callbacks: {
    async signIn({ user, profile, account }) {
      if (!profile?.id) return true;

      if (process.env.GITHUB_ORG_CHECK === 'true' && process.env.GITHUB_ORG) {
        const res = await fetch('https://api.github.com/user/orgs', {
          headers: { Authorization: `Bearer ${account?.access_token}` },
        });
        if (!res.ok) return false;
        const orgs: { login: string }[] = await res.json();
        const isMember = orgs.some((o) => o.login === process.env.GITHUB_ORG);
        if (!isMember) return false;
      }

      const githubId = String(profile.id);

      const existing = await prisma.user.findUnique({
        where: { githubId },
        select: { id: true },
      });

      if (!existing) {
        const isAdmin =
          process.env.ADMIN_GITHUB_ID !== undefined &&
          process.env.ADMIN_GITHUB_ID !== ""
            ? githubId === process.env.ADMIN_GITHUB_ID
            : false;

        await prisma.user.create({
          data: {
            githubId,
            name: user.name ?? null,
            email: user.email ?? null,
            avatarUrl: (profile as { avatar_url?: string }).avatar_url ?? null,
            isAdmin,
          },
        });
      }

      return true;
    },

    async session({ session, user }) {
      if (session.user && user) {
        const dbUser = await prisma.user.findUnique({
          where: { id: user.id },
          select: { id: true, isAdmin: true, avatarUrl: true },
        });
        if (dbUser) {
          (session.user as typeof session.user & { id: string; isAdmin: boolean; avatarUrl: string | null }).id = dbUser.id;
          (session.user as typeof session.user & { id: string; isAdmin: boolean; avatarUrl: string | null }).isAdmin = dbUser.isAdmin;
          (session.user as typeof session.user & { id: string; isAdmin: boolean; avatarUrl: string | null }).avatarUrl = dbUser.avatarUrl;
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
