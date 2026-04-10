export const dynamic = 'force-dynamic';

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { role, id } = session.user as any;

    let transactions;

    if (role === "ADMIN") {
      // Admin melihat semua transaksi
      transactions = await prisma.transaction.findMany({
        include: {
          product: true,
          user: {
            select: { name: true, email: true }
          }
        },
        orderBy: {
          createdAt: "desc",
        },
        take: 100,
      });
    } else {
      // User biasa hanya melihat miliknya sendiri
      transactions = await prisma.transaction.findMany({
        where: {
          userId: id,
        },
        include: {
          product: true,
        },
        orderBy: {
          createdAt: "desc",
        },
        take: 50,
      });
    }

    return NextResponse.json(transactions);
  } catch (error) {
    console.error("Fetch History Error:", error);
    return NextResponse.json({ message: "Gagal mengambil riwayat" }, { status: 500 });
  }
}
