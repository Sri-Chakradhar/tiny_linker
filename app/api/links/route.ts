export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateShortCode } from "@/lib/shortCode";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import bcrypt from "bcrypt";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { originalUrl, customCode, expiresAt, password } = await req.json();

    if (!originalUrl) {
      return NextResponse.json({ error: "URL is required" }, { status: 400 });
    }

    // ✅ Auto-fix and validate URL
    let fixedUrl = originalUrl.trim();

    if (!/^https?:\/\//i.test(fixedUrl)) {
      fixedUrl = "https://" + fixedUrl;
    }

    try {
      new URL(fixedUrl);
    } catch {
      return NextResponse.json({ error: "Invalid URL format" }, { status: 400 });
    }

    let shortCode = customCode?.trim();

    // ✅ Custom code validation
    if (shortCode) {
      const valid = /^[a-zA-Z0-9-]+$/.test(shortCode);
      if (!valid) {
        return NextResponse.json(
          { error: "Short code can only contain letters, numbers and hyphens" },
          { status: 400 }
        );
      }

      const exists = await prisma.url.findUnique({
        where: { shortCode },
      });

      if (exists) {
        return NextResponse.json(
          { error: "This short code is already taken" },
          { status: 409 }
        );
      }
    } else {
      // ✅ Auto-generate shortcode
      while (true) {
        const candidate = generateShortCode();
        const exists = await prisma.url.findUnique({
          where: { shortCode: candidate },
        });
        if (!exists) {
          shortCode = candidate;
          break;
        }
      }
    }

    // ✅ Optional password protection
    let hashedPassword = null;
    if (password) {
      hashedPassword = await bcrypt.hash(password, 10);
    }

    const url = await prisma.url.create({
      data: {
        originalUrl: fixedUrl,
        shortCode: shortCode!,
        userId: session.user.id,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
        password: hashedPassword,
      },
    });

    return NextResponse.json(url, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const urls = await prisma.url.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(urls);
}
