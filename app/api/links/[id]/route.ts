export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const session = await getServerSession(authOptions);

  if (!session || !session.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const url = await prisma.url.findFirst({
      where: {
        id: id,
        userId: session.user.id,
      },
    });

    if (!url) {
      return NextResponse.json(
        { error: "Link not found or access denied" },
        { status: 404 }
      );
    }

    await prisma.url.delete({
      where: {
        id: id,
      },
    });

    return NextResponse.json({ success: true }, { status: 200 });

  } catch (error) {
    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    );
  }
}
