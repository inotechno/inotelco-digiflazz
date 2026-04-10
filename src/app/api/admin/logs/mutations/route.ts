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
    const type = searchParams.get("type");

    const logs = await prisma.balanceMutation.findMany({
      where: {
        AND: [
          type ? { type: type as any } : {},
          search ? {
            user: {
              OR: [
                { name: { contains: search, mode: 'insensitive' } },
                { email: { contains: search, mode: 'insensitive' } },
              ]
            }
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
    console.error("Fetch Mutation Logs Error:", error);
    return NextResponse.json({ message: "Gagal mengambil audit log" }, { status: 500 });
  }
}
