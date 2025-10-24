import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    nodeEnv: process.env.NODE_ENV,
    betterAuthUrl: process.env.BETTER_AUTH_URL,
    nextPublicBaseUrl: process.env.NEXT_PUBLIC_BASE_URL,
    mongoDbName:
      process.env.MONGODB_URI?.match(/\.net\/([^?]+)/)?.[1] || "not found",
  });
}
