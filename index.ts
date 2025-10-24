// biome-ignore assist/source/organizeImports: <biome-ignore lint: false positive>
import { type NextRequest, NextResponse } from "next/server";

// This file used to implement a catch-all redirect for unauthenticated users
// but it conflicted with the real middleware at `middleware/index.ts` and
// intercepted auth verification routes (causing 307 redirects).
//
// Keep a no-op middleware here to avoid accidental route interception. The
// real auth middleware lives in `middleware/index.ts`.

export async function middleware(_request: NextRequest) {
  return NextResponse.next();
}

// Intentionally use a matcher that doesn't match normal app routes so this
// middleware is effectively inert.
export const config = {
  matcher: ["/__noop__"],
};
