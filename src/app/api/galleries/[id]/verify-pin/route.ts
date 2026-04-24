import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { pin } = await req.json();

  const gallery = await prisma.gallery.findUnique({ where: { id }, select: { pin: true } });
  if (!gallery) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (!gallery.pin) return NextResponse.json({ ok: true });

  if (gallery.pin !== pin) {
    return NextResponse.json({ error: "Wrong PIN" }, { status: 403 });
  }

  const jar = await cookies();
  jar.set(`folio_pin_${id}`, pin, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });

  return NextResponse.json({ ok: true });
}
