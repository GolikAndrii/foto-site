import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Silent ping — called when client opens a gallery (no auth required)
export async function POST(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await prisma.gallery.update({
    where: { id },
    data: { viewCount: { increment: 1 } },
  }).catch(() => {}); // silent — never breaks the gallery
  return NextResponse.json({ ok: true });
}
