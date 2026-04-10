import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== "ADMIN") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search");
    const action = searchParams.get("action");

    const logs = await prisma.systemLog.findMany({
      where: {
        AND: [
          action ? { action: action } : {},
          search ? {
            OR: [
              { details: { contains: search, mode: 'insensitive' } },
              { user: { name: { contains: search, mode: 'insensitive' } } },
              { user: { email: { contains: search, mode: 'insensitive' } } },
            ]
          } : {},
        ]
      },
      include: {
        user: {
          select: { name: true, email: true }
        }
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 300,
    });

    return NextResponse.json(logs);
  } catch (error) {
    console.error("Fetch System Logs Error:", error);
    return NextResponse.json({ message: "Gagal mengambil system log" }, { status: 500 });
  }
}
