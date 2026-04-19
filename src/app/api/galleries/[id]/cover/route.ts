import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const { photoId } = await req.json();

  const gallery = await prisma.gallery.update({
    where: { id },
    data: { coverPhotoId: photoId },
  });

  return NextResponse.json(gallery);
}
