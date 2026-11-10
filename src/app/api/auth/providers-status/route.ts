import { NextResponse } from "next/server";

export async function GET() {
  const clientId = process.env.GOOGLE_CLIENT_ID?.trim() || "";
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET?.trim() || "";

  const isConfigured =
    clientId.length > 0 &&
    clientSecret.length > 0 &&
    clientId !== "demo-google-client-id" &&
    !clientId.includes("your-google-client-id");

  return NextResponse.json({
    googleConfigured: isConfigured,
  });
}

