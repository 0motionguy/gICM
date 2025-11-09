import { NextResponse } from 'next/server';
import { getItemBySlug } from '@/lib/registry';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const item = getItemBySlug(slug);

  if (!item) {
    return NextResponse.json(
      { error: 'Item not found' },
      { status: 404 }
    );
  }

  try {
    const files: { path: string; content: string }[] = [];

    // Get the base URL from the request
    const baseUrl = new URL(request.url).origin;

    for (const filePath of (item.files || [])) {
      try {
        // Fetch from public URL (public/claude/... is served at /claude/...)
        const publicUrl = `${baseUrl}/${filePath.replace('.claude/', 'claude/')}`;
        const response = await fetch(publicUrl);

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }

        const content = await response.text();

        // Extract relative path after .claude/
        const relativePath = filePath.split('.claude/')[1] || filePath;

        files.push({
          path: relativePath,
          content
        });
      } catch (error) {
        console.warn(`Could not fetch file: ${filePath}`, error);
        // Continue with other files
      }
    }

    if (files.length === 0) {
      return NextResponse.json(
        { error: 'No files found for this item' },
        { status: 404 }
      );
    }

    return NextResponse.json(files);
  } catch (error) {
    console.error('Error reading files:', error);
    return NextResponse.json(
      { error: 'Failed to read files' },
      { status: 500 }
    );
  }
}

export const runtime = 'edge';
