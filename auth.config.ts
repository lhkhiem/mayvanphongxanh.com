import type { NextAuthConfig } from "next-auth"

export const authConfig = {
  pages: {
    signIn: "/admin/login",
  },
  providers: [],
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user
      const userRole = (auth?.user as any)?.role
      const isStaffOrAdmin = isLoggedIn && !!userRole
      const isAdmin = userRole === "Admin"
      const isOnAdmin = nextUrl.pathname.startsWith("/admin")
      const isLoginRoute = nextUrl.pathname === "/admin/login"

      if (isOnAdmin) {
        if (isLoginRoute) {
          if (isStaffOrAdmin) {
            return Response.redirect(new URL("/admin", nextUrl))
          }
          return true
        }

        if (!isLoggedIn) {
          return false // Redirect to login
        }

        // Protected system routes - restricted to Admin only
        const isSystemRoute = 
          nextUrl.pathname.startsWith("/admin/staff") ||
          nextUrl.pathname.startsWith("/admin/roles") ||
          nextUrl.pathname.startsWith("/admin/logs") ||
          nextUrl.pathname.startsWith("/admin/settings")

        if (isSystemRoute && !isAdmin) {
          return Response.redirect(new URL("/admin", nextUrl))
        }

        return true
      }
      return true
    },
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as any).role
        token.permissions = (user as any).permissions
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.role = token.role as string
        session.user.permissions = (token.permissions as string[]) || []
      }
      return session
    },
  },
} satisfies NextAuthConfig
