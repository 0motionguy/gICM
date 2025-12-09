import { NextResponse } from "next/server";
import { getItemBySlug } from "@/lib/registry";
import { z } from "zod";

const SlugSchema = z
  .string()
  .min(1)
  .max(100)
  .regex(/^[a-z0-9-]+$/, "Invalid slug format");

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;

  // Validate slug
  const parseResult = SlugSchema.safeParse(slug);
  if (!parseResult.success) {
    return NextResponse.json({ error: "Invalid slug format" }, { status: 400 });
  }

  const item = getItemBySlug(parseResult.data);

  if (!item) {
    return NextResponse.json({ error: "Item not found" }, { status: 404 });
  }

  return NextResponse.json(item);
}

export const runtime = "nodejs";
