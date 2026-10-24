import { NextResponse } from "next/server";
import { getBackendBaseUrl } from "@/lib/api/api/api";
import { getSiteHeaders } from "@/lib/config/siteHeaders";

export async function GET(request: Request) {
  try {
    // EXTRACT SESSION HEADERS FIRST
    const castoLine = request.headers.get("x-casto-line");
    const castoBadge = request.headers.get("x-casto-badge");

    if (!castoLine || !castoBadge) {
      return NextResponse.json({ logged_in: false });
    }

    const backendBaseUrl = getBackendBaseUrl();
    const backendUrl = `${backendBaseUrl}/api/castoline/auth/system/user`;

    const response = await fetch(backendUrl, {
      method: "GET",
      redirect: "manual",
      headers: {
        ...(await getSiteHeaders()),
        "x-casto-line": castoLine,
        "x-casto-badge": castoBadge,
      },
    });

    if (!response.ok) {
      return NextResponse.json({ logged_in: false });
    }

    const data = await response.json().catch(() => null);
    if (!data) {
      return NextResponse.json({ logged_in: false });
    }

    const isLoggedIn =
      data.logged_in !== undefined
        ? Boolean(data.logged_in)
        : Boolean(data.success || data.id || data.userName || data.user);

    return NextResponse.json({
      ...data,
      logged_in: isLoggedIn,
    });
  } catch (error) {
    console.error("➡️ Session Route Error :", error);
    return NextResponse.json({ logged_in: false });
  }
}
