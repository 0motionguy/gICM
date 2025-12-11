import { NextResponse } from "next/server";
import { writeFileSync, readFileSync, mkdirSync, existsSync } from "fs";
import { join } from "path";
import { z } from "zod";

// Helper function to send confirmation email
async function sendConfirmationEmail(email: string, position: number) {
  const resendApiKey = process.env.RESEND_API_KEY;
  const fromEmail = process.env.RESEND_FROM_EMAIL || "noreply@gicm.io";

  // Skip if Resend is not configured
  if (!resendApiKey) {
    return { success: false, reason: "not_configured" };
  }

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${resendApiKey}`,
      },
      body: JSON.stringify({
        from: fromEmail,
        to: email,
        subject: "Welcome to gICM Waitlist! 🚀",
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="UTF-8">
            <title>gICM Waitlist Confirmation</title>
          </head>
          <body style="margin: 0; padding: 0; background-color: #0A0A0A; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
            <div style="max-width: 600px; margin: 40px auto; background-color: #18181B; border-radius: 12px; overflow: hidden; border: 1px solid #27272A;">
              <!-- Header -->
              <div style="background: linear-gradient(135deg, #D1FD0A 0%, #8EF0B4 100%); padding: 40px 20px; text-align: center;">
                <h1 style="margin: 0; font-size: 32px; font-weight: 700; color: #0A0A0A;">gICM://SEND</h1>
                <p style="margin: 8px 0 0; font-size: 14px; color: #18181B; opacity: 0.8;">The AI Marketplace for Web3 Builders</p>
              </div>

              <!-- Content -->
              <div style="padding: 40px 32px;">
                <h2 style="margin: 0 0 16px; font-size: 24px; font-weight: 600; color: #FFFFFF;">You're on the list! ✨</h2>

                <p style="margin: 0 0 24px; font-size: 16px; line-height: 1.6; color: #A1A1AA;">
                  Thank you for joining the gICM waitlist. You're <strong style="color: #D1FD0A;">position #${position}</strong> in line for early access to our marketplace featuring:
                </p>

                <div style="background-color: #0A0A0A; border-radius: 8px; padding: 24px; margin: 24px 0;">
                  <ul style="margin: 0; padding: 0; list-style: none;">
                    <li style="margin: 0 0 12px; font-size: 15px; color: #E4E4E7; padding-left: 28px; position: relative;">
                      <span style="position: absolute; left: 0; color: #D1FD0A;">✓</span>
                      <strong>108 specialized AI agents</strong> - From Solana to full-stack development
                    </li>
                    <li style="margin: 0 0 12px; font-size: 15px; color: #E4E4E7; padding-left: 28px; position: relative;">
                      <span style="position: absolute; left: 0; color: #D1FD0A;">✓</span>
                      <strong>120 progressive skills</strong> - 88-92% token savings
                    </li>
                    <li style="margin: 0 0 12px; font-size: 15px; color: #E4E4E7; padding-left: 28px; position: relative;">
                      <span style="position: absolute; left: 0; color: #D1FD0A;">✓</span>
                      <strong>93 commands</strong> - One-command installs
                    </li>
                    <li style="margin: 0; font-size: 15px; color: #E4E4E7; padding-left: 28px; position: relative;">
                      <span style="position: absolute; left: 0; color: #D1FD0A;">✓</span>
                      <strong>95 MCP integrations</strong> - Complete Web3 tooling
                    </li>
                  </ul>
                </div>

                <p style="margin: 24px 0 0; font-size: 14px; line-height: 1.6; color: #71717A;">
                  We'll notify you as soon as we launch. In the meantime, follow us for updates and exclusive previews.
                </p>
              </div>

              <!-- Footer -->
              <div style="padding: 24px 32px; background-color: #0A0A0A; border-top: 1px solid #27272A;">
                <p style="margin: 0; font-size: 12px; color: #52525B; text-align: center;">
                  Built with ❤️ by <a href="https://icm-motion.com" style="color: #D1FD0A; text-decoration: none;">ICM Motion</a>
                </p>
              </div>
            </div>
          </body>
          </html>
        `,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error("Resend API error:", error);
      return { success: false, reason: "api_error", details: error };
    }

    const data = await response.json();
    return { success: true, emailId: data.id };
  } catch (error) {
    console.error("Error sending confirmation email:", error);
    return { success: false, reason: "exception", error };
  }
}

const WaitlistSchema = z.object({
  email: z.string().email("Invalid email address"),
});

interface WaitlistEntry {
  email: string;
  timestamp: string;
  referralCode?: string;
}

const WAITLIST_FILE = join(process.cwd(), ".waitlist", "emails.json");

// Ensure waitlist directory exists
function ensureWaitlistDir() {
  const dir = join(process.cwd(), ".waitlist");
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }
}

// Read waitlist from file
function readWaitlist(): WaitlistEntry[] {
  ensureWaitlistDir();

  if (!existsSync(WAITLIST_FILE)) {
    return [];
  }

  try {
    const data = readFileSync(WAITLIST_FILE, "utf-8");
    return JSON.parse(data);
  } catch (error) {
    console.error("Error reading waitlist:", error);
    return [];
  }
}

// Write waitlist to file
function writeWaitlist(entries: WaitlistEntry[]) {
  ensureWaitlistDir();

  try {
    writeFileSync(WAITLIST_FILE, JSON.stringify(entries, null, 2), "utf-8");
  } catch (error) {
    console.error("Error writing waitlist:", error);
    throw new Error("Failed to save waitlist entry");
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // Validate request body
    const validated = WaitlistSchema.safeParse(body);
    if (!validated.success) {
      return NextResponse.json(
        { error: "Invalid email address", details: validated.error.issues },
        { status: 400 }
      );
    }

    const { email } = validated.data;
    const normalizedEmail = email.toLowerCase().trim();

    // Read existing waitlist
    const waitlist = readWaitlist();

    // Check if email already exists
    if (waitlist.some((entry) => entry.email === normalizedEmail)) {
      return NextResponse.json(
        {
          error: "Email already on waitlist",
          message: "You're already registered!",
        },
        { status: 409 }
      );
    }

    // Add new entry
    const newEntry: WaitlistEntry = {
      email: normalizedEmail,
      timestamp: new Date().toISOString(),
    };

    waitlist.push(newEntry);

    // Save to file
    writeWaitlist(waitlist);

    // Send confirmation email (gracefully handles missing API key)
    await sendConfirmationEmail(normalizedEmail, waitlist.length);

    return NextResponse.json(
      {
        success: true,
        message: "Successfully joined waitlist!",
        position: waitlist.length,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Waitlist error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const waitlist = readWaitlist();
    const count = waitlist.length;

    return NextResponse.json({
      total: count,
      count: count,
      message:
        count === 0
          ? "Be the first to join the waitlist!"
          : `${count} ${count === 1 ? "person" : "people"} on the waitlist`,
    });
  } catch (error) {
    console.error("Error reading waitlist:", error);
    return NextResponse.json(
      { error: "Failed to retrieve waitlist count" },
      { status: 500 }
    );
  }
}
