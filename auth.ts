import NextAuth from "next-auth";
import GitHub from "next-auth/providers/github";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),

  providers: [
    GitHub({
      clientId: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
    }),
  ],

  session: {
    strategy: "database",
  },

  pages: {
    signIn: "/",
  },

  callbacks: {
    async signIn({ user, profile }) {
      if (!profile?.id) return true;

      const githubId = String(profile.id);

      // Check if a User record already exists for this GitHub account
      const existing = await prisma.user.findUnique({
        where: { githubId },
        select: { id: true },
      });

      if (!existing) {
        // First sign-in — create the User record with isAdmin evaluation
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
      // Existing user — no-op: isAdmin is never changed after creation

      return true;
    },

    async session({ session, user }) {
      // Expose the User's id and isAdmin to server components via auth()
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
