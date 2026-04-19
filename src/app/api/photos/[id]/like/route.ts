import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { randomUUID } from "crypto";

async function getSessionToken() {
  const cookieStore = await cookies();
  let token = cookieStore.get("session_token")?.value;
  if (!token) token = randomUUID();
  return token;
}

export async function POST(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id: photoId } = await params;
  const sessionToken = await getSessionToken();

  const existing = await prisma.like.findUnique({
    where: { photoId_sessionToken: { photoId, sessionToken } },
  });

  let liked: boolean;
  if (existing) {
    await prisma.like.delete({ where: { id: existing.id } });
    liked = false;
  } else {
    await prisma.like.create({ data: { photoId, sessionToken } });
    liked = true;
  }

  const count = await prisma.like.count({ where: { photoId } });

  const response = NextResponse.json({ liked, count });
  response.cookies.set("session_token", sessionToken, {
    httpOnly: true,
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
  });
  return response;
}

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id: photoId } = await params;
  const sessionToken = await getSessionToken();

  const existing = await prisma.like.findUnique({
    where: { photoId_sessionToken: { photoId, sessionToken } },
  });
  const count = await prisma.like.count({ where: { photoId } });

  return NextResponse.json({ liked: !!existing, count });
}
