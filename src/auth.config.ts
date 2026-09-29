import type { NextAuthConfig } from 'next-auth'

// Edge-safe config: no database access, so it can run inside proxy.ts.
export const authConfig = {
  trustHost: true,
  session: { strategy: 'jwt', maxAge: 60 * 60 * 24 * 14 },
  pages: { signIn: '/login' },
  providers: [],
  callbacks: {
    authorized({ auth, request }) {
      const isAppRoute = request.nextUrl.pathname.startsWith('/app')
      if (isAppRoute) return !!auth?.user
      return true
    },
    jwt({ token, user }) {
      if (user?.id) token.sub = user.id
      return token
    },
    session({ session, token }) {
      if (token.sub) session.user.id = token.sub
      return session
    },
  },
} satisfies NextAuthConfig
