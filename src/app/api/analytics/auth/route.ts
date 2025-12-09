import { NextResponse } from "next/server";
import { cookies, headers } from "next/headers";
import { z } from "zod";
import crypto from "crypto";

// Rate limiting storage (in production, use Redis)
const rateLimitStore = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_WINDOW = 15 * 60 * 1000; // 15 minutes
const MAX_ATTEMPTS = 5;

// SECURITY: No default password - must be set via environment variable
const ANALYTICS_PASSWORD = process.env.ANALYTICS_PASSWORD;

const AuthSchema = z.object({
  password: z.string().min(1, "Password is required"),
});

function getClientIP(headerStore: Headers): string {
  return (
    headerStore.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    headerStore.get("x-real-ip") ||
    "unknown"
  );
}

function checkRateLimit(ip: string): {
  allowed: boolean;
  remainingAttempts: number;
} {
  const now = Date.now();
  const record = rateLimitStore.get(ip);

  if (!record || now > record.resetAt) {
    rateLimitStore.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW });
    return { allowed: true, remainingAttempts: MAX_ATTEMPTS - 1 };
  }

  if (record.count >= MAX_ATTEMPTS) {
    return { allowed: false, remainingAttempts: 0 };
  }

  record.count++;
  return { allowed: true, remainingAttempts: MAX_ATTEMPTS - record.count };
}

function timingSafeCompare(a: string, b: string): boolean {
  if (a.length !== b.length) {
    // Compare with dummy to prevent timing attacks
    crypto.timingSafeEqual(Buffer.from(a), Buffer.from(a));
    return false;
  }
  return crypto.timingSafeEqual(Buffer.from(a), Buffer.from(b));
}

export async function POST(req: Request) {
  try {
    // Check if password is configured
    if (!ANALYTICS_PASSWORD) {
      console.error("ANALYTICS_PASSWORD environment variable not set");
      return NextResponse.json(
        { error: "Analytics authentication not configured" },
        { status: 503 },
      );
    }

    // Rate limiting
    const headerStore = await headers();
    const clientIP = getClientIP(headerStore);
    const rateLimit = checkRateLimit(clientIP);

    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: "Too many authentication attempts. Try again later." },
        { status: 429 },
      );
    }

    // Validate input
    const body = await req.json();
    const parseResult = AuthSchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    const { password } = parseResult.data;

    // Timing-safe password comparison
    if (!timingSafeCompare(password, ANALYTICS_PASSWORD)) {
      return NextResponse.json(
        {
          error: "Invalid password",
          remainingAttempts: rateLimit.remainingAttempts,
        },
        { status: 401 },
      );
    }

    // Generate secure session token
    const sessionToken = crypto.randomBytes(32).toString("hex");

    const response = NextResponse.json({ success: true });

    (await cookies()).set("analytics-auth", sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 60 * 60 * 24, // 24 hours
      path: "/",
    });

    // Store valid session token (in production, use Redis/DB)
    (await cookies()).set("analytics-session-valid", "true", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 60 * 60 * 24,
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Analytics auth error:", error);
    return NextResponse.json(
      { error: "Authentication failed" },
      { status: 500 },
    );
  }
}

export async function GET() {
  const cookieStore = await cookies();
  const authCookie = cookieStore.get("analytics-auth");
  const validCookie = cookieStore.get("analytics-session-valid");

  // Check both cookies exist and session is marked as valid
  const isAuthenticated = Boolean(
    authCookie?.value && validCookie?.value === "true",
  );

  return NextResponse.json({
    authenticated: isAuthenticated,
  });
}
