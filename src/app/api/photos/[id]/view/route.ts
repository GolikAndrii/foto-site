import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Silent ping — called when client opens a photo in lightbox
export async function POST(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await prisma.photo.update({
    where: { id },
    data: { lightboxViews: { increment: 1 } },
  }).catch(() => {});
  return NextResponse.json({ ok: true });
}
