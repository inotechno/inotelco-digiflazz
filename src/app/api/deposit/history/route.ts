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

    const deposits = await prisma.deposit.findMany({
      where: {
        userId: (session.user as any).id,
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 10, // Menampilkan 10 riwayat deposit terakhir
    });

    return NextResponse.json(deposits);
  } catch (error) {
    console.error("Fetch Deposit History Error:", error);
    return NextResponse.json({ message: "Gagal mengambil riwayat deposit" }, { status: 500 });
  }
}
