import bcrypt from "bcryptjs";
import type { RequestHandler } from "express";
import { eq } from "drizzle-orm";
import { db } from "./db";
import { users, adminAuditLogs, appSettings } from "@shared/schema";
import type { User } from "@shared/schema";

// Environment variables for superuser setup
const SUPERUSER_EMAIL = process.env.SUPERUSER_EMAIL || "admin@microjpeg.com";
const SUPERUSER_PASSWORD = process.env.SUPERUSER_PASSWORD || "SuperAdmin123!";
const ADMIN_UI_ENABLED = process.env.ADMIN_UI_ENABLED === "true";
const ADMIN_SEED_TOKEN = process.env.ADMIN_SEED_TOKEN || "dev-seed-token-2025";

// Seed superuser on startup if it doesn't exist
export async function seedSuperuser(): Promise<void> {
  try {
    // Check if superuser already exists
    const [existingSuperuser] = await db
      .select()
      .from(users)
      .where(eq(users.isSuperuser, true))
      .limit(1);

    if (existingSuperuser) {
      console.log("✅ Superuser already exists");
      return;
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(SUPERUSER_PASSWORD, 12);

    // Create superuser
    const [newSuperuser] = await db
      .insert(users)
      .values({
        email: SUPERUSER_EMAIL,
        password: hashedPassword,
        firstName: "Super",
        lastName: "Admin",
        isSuperuser: true,
        isEmailVerified: "true",
        subscriptionTier: "enterprise",
        subscriptionStatus: "active",
        adminNotes: "System superuser - created automatically",
      })
      .returning();

    console.log("✅ Superuser created successfully");
    console.log(`📧 Email: ${SUPERUSER_EMAIL}`);
    console.log(`🔑 Password: ${SUPERUSER_PASSWORD}`);
    console.log("⚠️  Change default credentials in production!");

    // Log audit entry
    await logAdminAction(
      newSuperuser.id,
      "SUPERUSER_CREATED",
      undefined,
      undefined,
      { method: "auto-seed", environment: process.env.NODE_ENV },
      "127.0.0.1",
      "System"
    );
  } catch (error) {
    console.error("❌ Failed to seed superuser:", error);
  }
}

// Middleware to ensure user is a superuser
export const ensureSuperuser: RequestHandler = async (req, res, next) => {
  try {
    const session = req.session as any;
    
    if (!session.userId) {
      return res.status(401).json({ 
        error: "Authentication required",
        message: "Please sign in to access admin functions"
      });
    }

    // Get user from database
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, session.userId));

    if (!user || !user.isSuperuser) {
      return res.status(403).json({ 
        error: "Insufficient privileges",
        message: "Superuser access required"
      });
    }

    // Add user to request for downstream middleware
    req.user = user;
    next();
  } catch (error) {
    console.error("Superuser authentication error:", error);
    res.status(500).json({ 
      error: "Authentication error",
      message: "Failed to verify superuser status"
    });
  }
};

// Admin audit logging function
export async function logAdminAction(
  adminUserId: string,
  action: string,
  targetUserId?: string,
  targetSessionId?: string,
  details: Record<string, any> = {},
  ipAddress?: string,
  userAgent?: string
): Promise<void> {
  try {
    await db.insert(adminAuditLogs).values({
      adminUserId,
      action,
      targetUserId,
      targetSessionId,
      details,
      ipAddress,
      userAgent,
    });
  } catch (error) {
    console.error("Failed to log admin action:", error);
  }
}

// Get app settings (with caching)
let cachedAppSettings: any = null;
let settingsCacheTime = 0;
const CACHE_DURATION = 30000; // 30 seconds

export async function getAppSettings(): Promise<{
  countersEnforcement: { hourly: boolean; daily: boolean; monthly: boolean };
  adminUiEnabled: boolean;
  superuserBypassEnabled: boolean;
}> {
  const now = Date.now();
  
  // Return cached settings if still valid
  if (cachedAppSettings && (now - settingsCacheTime) < CACHE_DURATION) {
    return cachedAppSettings;
  }

  try {
    const [settings] = await db.select().from(appSettings).limit(1);
    
    const result = {
      countersEnforcement: settings?.countersEnforcement as { hourly: boolean; daily: boolean; monthly: boolean } || { hourly: true, daily: true, monthly: true },
      adminUiEnabled: settings?.adminUiEnabled || ADMIN_UI_ENABLED,
      superuserBypassEnabled: settings?.superuserBypassEnabled || false,
    };

    // Cache the result
    cachedAppSettings = result;
    settingsCacheTime = now;
    
    return result;
  } catch (error) {
    console.error("Failed to get app settings:", error);
    return {
      countersEnforcement: { hourly: true, daily: true, monthly: true },
      adminUiEnabled: ADMIN_UI_ENABLED,
      superuserBypassEnabled: false,
    };
  }
}

// Update app settings and clear cache
export async function updateAppSettings(
  updates: {
    countersEnforcement?: { hourly?: boolean; daily?: boolean; monthly?: boolean };
    adminUiEnabled?: boolean;
    superuserBypassEnabled?: boolean;
  },
  updatedBy: string
): Promise<void> {
  try {
    // Get current settings
    const currentSettings = await getAppSettings();
    
    // Merge updates
    const newEnforcement = {
      ...currentSettings.countersEnforcement,
      ...updates.countersEnforcement,
    };

    // Update database
    await db
      .update(appSettings)
      .set({
        countersEnforcement: newEnforcement,
        adminUiEnabled: updates.adminUiEnabled ?? currentSettings.adminUiEnabled,
        superuserBypassEnabled: updates.superuserBypassEnabled ?? currentSettings.superuserBypassEnabled,
        updatedAt: new Date(),
        updatedBy,
      });

    // Clear cache
    cachedAppSettings = null;
    
    console.log("✅ App settings updated:", updates);
  } catch (error) {
    console.error("Failed to update app settings:", error);
    throw error;
  }
}

// Check if user has superuser bypass enabled (async version with user verification)
export async function hasSuperuserBypass(req: any): Promise<boolean> {
  try {
    const session = req.session as any;
    
    // Check if bypass is enabled in session
    if (!session?.superBypassEnabled) {
      return false;
    }
    
    // Check if session has userId
    if (!session.userId) {
      return false;
    }
    
    // Verify user is actually a superuser
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, session.userId));
    
    if (!user || !user.isSuperuser) {
      console.warn(`🚨 Session ${session.userId} has bypass enabled but user is not superuser`);
      return false;
    }
    
    // Check if bypass is globally enabled in app settings
    const appSettings = await getAppSettings();
    if (!appSettings.superuserBypassEnabled) {
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error checking superuser bypass:', error);
    return false;
  }
}

// Synchronous version for backwards compatibility (checks session only)
export function hasSuperuserBypassSync(req: any): boolean {
  const session = req.session as any;
  return session?.superBypassEnabled === true;
}

// Enable/disable superuser bypass for current session
export function setSuperuserBypass(req: any, enabled: boolean, reason?: string): void {
  const session = req.session as any;
  session.superBypassEnabled = enabled;
  if (enabled && reason) {
    session.superBypassReason = reason;
  } else {
    delete session.superBypassReason;
  }
}

export { SUPERUSER_EMAIL, SUPERUSER_PASSWORD, ADMIN_UI_ENABLED, ADMIN_SEED_TOKEN };