import { prisma } from "@/lib/db"
import { auth } from "@/auth"

export type LogActionType = 
  | "CREATE"
  | "UPDATE"
  | "DELETE"
  | "LOGIN"
  | "LOGOUT"
  | "LOGIN_FAILED"
  | "STATUS_CHANGE"
  | "EXPORT"
  | "IMPORT"
  | "CONFIG_CHANGE"

export type LogEntityType =
  | "PRODUCT"
  | "CATEGORY"
  | "BRAND"
  | "ORDER"
  | "USER"
  | "ROLE"
  | "POST"
  | "POST_CATEGORY"
  | "SETTING"
  | "INVENTORY"
  | "RENTAL"
  | "WARRANTY"
  | "SERVICE"
  | "MEDIA"
  | "SLIDER"
  | "BANNER"
  | "FAQ"
  | "PARTNER"
  | "PROJECT"
  | "TESTIMONIAL"
  | "CUSTOMER"
  | "AUTH"

export interface LogAuditParams {
  action: LogActionType | string
  entity: LogEntityType | string
  entityId?: string | number | null
  details: string
  metadata?: Record<string, any> | any
  userId?: string
  userName?: string
  userEmail?: string
  userRole?: string
  ipAddress?: string
  userAgent?: string
}

/**
 * Log user/admin activity safely into the database.
 * If user details are not provided, it will automatically attempt to read from NextAuth session.
 */
export async function logAuditAction(params: LogAuditParams) {
  try {
    let userId = params.userId
    let userName = params.userName
    let userEmail = params.userEmail
    let userRole = params.userRole

    // If user info is missing, try retrieving from current session
    if (!userId && !userEmail) {
      try {
        const session = await auth()
        if (session?.user) {
          userId = session.user.id || undefined
          userName = session.user.name || undefined
          userEmail = session.user.email || undefined
          userRole = (session.user as any).role || undefined
        }
      } catch (err) {
        // Session retrieval failure should not block log creation
      }
    }

    const entityIdStr = params.entityId != null ? String(params.entityId) : null

    await prisma.auditLog.create({
      data: {
        userId: userId || null,
        userName: userName || null,
        userEmail: userEmail || null,
        userRole: userRole || "Guest",
        action: params.action,
        entity: params.entity,
        entityId: entityIdStr,
        details: params.details,
        metadata: params.metadata ? JSON.parse(JSON.stringify(params.metadata)) : null,
        ipAddress: params.ipAddress || null,
        userAgent: params.userAgent || null,
      },
    })
  } catch (error) {
    console.error("[AuditLogger] Failed to write log:", error)
  }
}
