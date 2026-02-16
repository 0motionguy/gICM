// Deliberately flawed API route for testing compound workflow
// Following gICM conventions: kebab-case route, HTTP method function

import { NextResponse } from "next/server";

// Mock db for demonstration
declare const db: { execute: (query: string) => Promise<unknown> };

export async function GET(request: Request) {
  const userId = new URL(request.url).searchParams.get("userId");

  // SECURITY FLAW 1: SQL injection vulnerability - user input directly concatenated
  const query = `SELECT * FROM users WHERE id = ${userId}`;

  // SECURITY FLAW 2: No authentication check - anyone can access user data
  // SECURITY FLAW 3: No input validation - userId could be null/malicious

  try {
    const result = await db.execute(query);

    // SECURITY FLAW 4: Exposing raw database results without sanitization
    return NextResponse.json({ data: result });
  } catch (error) {
    // SECURITY FLAW 5: Leaking error details to client
    return NextResponse.json(
      { error: `Database error: ${error}` },
      { status: 500 }
    );
  }
}
