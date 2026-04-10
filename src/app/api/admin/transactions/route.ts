export const dynamic = 'force-dynamic';
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
    const status = searchParams.get("status");
    const category = searchParams.get("category");

    const transactions = await prisma.transaction.findMany({
      where: {
        AND: [
          status ? { status: status as any } : {},
          category ? { product: { category: category } } : {},
          search ? {
            OR: [
              { id: { contains: search, mode: 'insensitive' } },
              { refId: { contains: search, mode: 'insensitive' } },
              { customerNo: { contains: search, mode: 'insensitive' } },
              { user: { name: { contains: search, mode: 'insensitive' } } },
              { user: { email: { contains: search, mode: 'insensitive' } } },
            ]
          } : {},
        ]
      } as any,
      include: {
        user: {
          select: { name: true, email: true }
        },
        product: {
          select: { category: true, brand: true }
        }
      } as any,
      orderBy: {
        createdAt: "desc",
      },
      take: 200,
    });

    return NextResponse.json(transactions);
  } catch (error) {
    console.error("Fetch Admin Transactions Error:", error);
    return NextResponse.json({ message: "Gagal mengambil data transaksi" }, { status: 500 });
  }
}
