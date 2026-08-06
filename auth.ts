import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import { prisma } from "@/lib/db"
import bcrypt from "bcryptjs"
import { authConfig } from "./auth.config"
import { logAuditAction } from "@/lib/audit-logger"

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string },
          include: { role: true }
        })

        if (!user || !user.password) {
          await logAuditAction({
            action: "LOGIN_FAILED",
            entity: "AUTH",
            details: `Thử đăng nhập thất bại với email: ${credentials.email} (Tài khoản không tồn tại)`,
            userEmail: credentials.email as string,
          })
          return null
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password as string,
          user.password
        )

        if (!isPasswordValid) {
          await logAuditAction({
            action: "LOGIN_FAILED",
            entity: "AUTH",
            details: `Thử đăng nhập thất bại với email: ${credentials.email} (Mật khẩu không đúng)`,
            userId: user.id,
            userName: user.name || undefined,
            userEmail: user.email || undefined,
            userRole: user.role?.name || "User",
          })
          return null
        }

        const userRole = user.role?.name || "User"

        await logAuditAction({
          action: "LOGIN",
          entity: "AUTH",
          entityId: user.id,
          details: `Đăng nhập thành công vào hệ thống (${userRole})`,
          userId: user.id,
          userName: user.name || undefined,
          userEmail: user.email || undefined,
          userRole: userRole,
        })

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: userRole,
        }
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
})

