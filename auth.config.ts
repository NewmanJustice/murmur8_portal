import type { NextAuthConfig } from "next-auth";
import GitHub from "next-auth/providers/github";

export const authConfig: NextAuthConfig = {
  trustHost: true,
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
  session: { strategy: "jwt" },
  pages: { signIn: "/" },
  callbacks: {
    async signIn({ account }) {
      if (process.env.GITHUB_ORG_CHECK === 'true' && process.env.GITHUB_ORG) {
        const res = await fetch('https://api.github.com/user/orgs', {
          headers: { Authorization: `Bearer ${account?.access_token}` },
        });
        if (!res.ok) return false;
        const orgs: { login: string }[] = await res.json();
        if (!orgs.some((o) => o.login === process.env.GITHUB_ORG)) return false;
      }
      return true;
    },
  },
};
