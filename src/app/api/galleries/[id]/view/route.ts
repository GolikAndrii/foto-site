import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function getDeviceType(ua: string): "desktop" | "tablet" | "mobile" {
  // Tablet: iPad, or Android without "Mobile" keyword
  if (/iPad/i.test(ua) || (/Android/i.test(ua) && !/Mobile/i.test(ua))) return "tablet";
  // Mobile: phones
  if (/Mobile|Android|iPhone|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua)) return "mobile";
  return "desktop";
}

// Silent ping — called when client opens a gallery (no auth required)
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const ua = req.headers.get("user-agent") ?? "";
  const device = getDeviceType(ua);

  const deviceField =
    device === "desktop" ? "desktopViews" :
    device === "tablet"  ? "tabletViews"  :
                           "mobileViews";

  await prisma.gallery.update({
    where: { id },
    data: {
      viewCount:      { increment: 1 },
      [deviceField]:  { increment: 1 },
    },
  }).catch(() => {}); // silent — never breaks the gallery

  return NextResponse.json({ ok: true });
}
