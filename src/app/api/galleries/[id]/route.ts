import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { deleteFromR2 } from "@/lib/r2";

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const gallery = await prisma.gallery.findUnique({
    where: { id },
    include: { photos: { orderBy: { sortOrder: "asc" } } },
  });

  if (!gallery) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(gallery);
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await req.json();
  const gallery = await prisma.gallery.update({ where: { id }, data: body });
  return NextResponse.json(gallery);
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const gallery = await prisma.gallery.findUnique({
    where: { id },
    include: { photos: true },
  });

  if (!gallery) return NextResponse.json({ error: "Not found" }, { status: 404 });

  for (const photo of gallery.photos) {
    await deleteFromR2(photo.originalKey).catch(() => {});
    await deleteFromR2(photo.previewKey).catch(() => {});
  }

  await prisma.gallery.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
