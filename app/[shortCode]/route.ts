import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcrypt";

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ shortCode: string }> }
) {
  const { shortCode } = await context.params;

  const url = await prisma.url.findUnique({
    where: { shortCode },
  });

  if (!url) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  if (url.expiresAt && new Date() > url.expiresAt) {
    return new Response("This link has expired", { status: 410 });
  }

  if (url.password) {
    return new Response(
      `
      <html>
        <body style="font-family:sans-serif;padding:40px;">
          <h3>This link is password protected</h3>
          <form method="POST">
            <input type="password" name="password" required />
            <button type="submit">Access</button>
          </form>
        </body>
      </html>
      `,
      { headers: { "Content-Type": "text/html" } }
    );
  }

  const ip = req.headers.get("x-forwarded-for")?.split(",")[0] || "unknown";
  const userAgent = req.headers.get("user-agent") || "";
  const referrer = req.headers.get("referer") || "";

  await prisma.$transaction([
    prisma.click.create({
      data: {
        urlId: url.id,
        ip,
        userAgent,
        referrer,
      },
    }),
    prisma.url.update({
      where: { id: url.id },
      data: {
        clickCount: { increment: 1 },
        lastClicked: new Date(),
      },
    }),
  ]);

  return NextResponse.redirect(url.originalUrl);
}

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ shortCode: string }> }
) {
  const { shortCode } = await context.params;

  const url = await prisma.url.findUnique({
    where: { shortCode },
  });

  if (!url || !url.password) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  const formData = await req.formData();
  const inputPassword = formData.get("password")?.toString() || "";
  const match = await bcrypt.compare(inputPassword, url.password);

  if (!match) {
    return new Response("Incorrect password", { status: 401 });
  }

  return NextResponse.redirect(url.originalUrl);
}
