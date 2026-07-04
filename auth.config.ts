import type { NextAuthConfig } from "next-auth"

export const authConfig = {
  pages: {
    signIn: "/admin/login",
  },
  providers: [],
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user
      const isAdmin = (auth?.user as any)?.role === "Admin"
      const isOnAdmin = nextUrl.pathname.startsWith("/admin")
      const isLoginRoute = nextUrl.pathname === "/admin/login"

      if (isOnAdmin) {
        if (isLoginRoute) {
          if (isLoggedIn && isAdmin) {
            return Response.redirect(new URL("/admin", nextUrl))
          }
          return true
        }
        if (isLoggedIn && isAdmin) {
          return true
        }
        return false // Chuyển hướng về trang đăng nhập
      }
      return true
    },
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as any).role
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.role = token.role as string
      }
      return session
    },
  },
} satisfies NextAuthConfig
