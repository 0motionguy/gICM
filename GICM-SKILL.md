# gICM Coding Conventions

## File Naming

- Components: PascalCase.tsx
- Utils: camelCase.ts
- API routes: kebab-case.ts
- Database: snake_case

## Component Template

```typescript
// Server Component (default)
export default function ComponentName({ data }: Props) {
  return <div>{data.title}</div>
}
```

## API Route Template

```typescript
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const data = await fetchData();
    return NextResponse.json({ data, success: true });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed", success: false },
      { status: 500 }
    );
  }
}
```
