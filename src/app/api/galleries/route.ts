import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const galleries = await prisma.gallery.findMany({
    orderBy: { createdAt: "desc" },
    include: { photos: { select: { id: true, previewKey: true }, orderBy: { sortOrder: "asc" }, take: 1 } },
  });

  return NextResponse.json(galleries);
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { name } = await req.json();
  if (!name?.trim()) return NextResponse.json({ error: "Name required" }, { status: 400 });

  const gallery = await prisma.gallery.create({ data: { name: name.trim() } });
  return NextResponse.json(gallery);
}
