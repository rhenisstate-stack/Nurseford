import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    active: process.env.SKEW_LINE_ACTIVE_BACKEND ?? "dotnet",
    backends: {
      fastapi: process.env.SKEW_LINE_FASTAPI_BASE_URL?.split(",")[1] ?? null,
      laravel: process.env.SKEW_LINE_LARAVEL_BASE_URL?.split(",")[0] ?? null,
      dotnet: process.env.SKEW_LINE_DOTNET_BASE_URL ?? null,
    },
  });
}
