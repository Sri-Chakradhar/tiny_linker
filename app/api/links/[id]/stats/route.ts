export const runtime = "nodejs";

import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = await prisma.url.findFirst({
    where: {
      id: params.id,
      userId: session.user.id,
    },
  });

  if (!url) {
    return NextResponse.json(
      { error: "Link not found or access denied" },
      { status: 404 }
    );
  }

  const clicks = await prisma.click.groupBy({
    by: ["createdAt"],
    where: { urlId: params.id },
    _count: { _all: true },
  });

  const data = clicks.map((c: { createdAt: { toISOString: () => string; }; _count: { _all: any; }; }) => ({
    date: c.createdAt.toISOString().split("T")[0],
    count: c._count._all,
  }));

  return NextResponse.json(data, { status: 200 });
}
