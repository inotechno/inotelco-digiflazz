export const dynamic = 'force-dynamic';

import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import dayjs from "dayjs";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== "ADMIN") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const today = dayjs().startOf('day').toDate();

    const [
      transactionsToday,
      transactionsAllTime,
      categoryStats,
      totalUsers,
      totalBalance,
      pendingDeposits
    ] = await Promise.all([
      prisma.transaction.aggregate({
        where: { createdAt: { gte: today }, status: "SUCCESS" },
        _sum: { priceSell: true, profit: true, priceCost: true },
        _count: true
      }),
      prisma.transaction.aggregate({
        where: { status: "SUCCESS" },
        _sum: { priceSell: true, profit: true, priceCost: true },
        _count: true
      }),
      prisma.transaction.groupBy({
        by: ['productName'],
        where: { status: "SUCCESS" },
        _sum: { profit: true },
        _count: true,
        orderBy: { _sum: { profit: 'desc' } },
        take: 5
      }),
      prisma.user.count(),
      prisma.user.aggregate({ _sum: { balance: true } }),
      prisma.deposit.count({ where: { status: "PENDING" } })
    ]);

    // Ambil IP Server Vercel secara realtime
    let serverIp = "Tidak diketahui";
    try {
      const ipRes = await fetch("https://api.ipify.org?format=json");
      const ipData = await ipRes.json();
      serverIp = ipData.ip;
    } catch (e) {
      console.error("Gagal mendapatkan IP server:", e);
    }

    return NextResponse.json({
      today: {
        sales: Number(transactionsToday._sum.priceSell || 0),
        profit: Number(transactionsToday._sum.profit || 0),
        modal: Number(transactionsToday._sum.priceCost || 0),
        count: transactionsToday._count,
      },
      allTime: {
        sales: Number(transactionsAllTime._sum.priceSell || 0),
        profit: Number(transactionsAllTime._sum.profit || 0),
        modal: Number(transactionsAllTime._sum.priceCost || 0),
        count: transactionsAllTime._count,
      },
      topProducts: categoryStats.map(c => ({
        name: c.productName,
        profit: Number(c._sum.profit || 0),
        count: c._count
      })),
      totalUsers,
      totalUserBalance: Number(totalBalance._sum.balance || 0),
      pendingDepositsCount: pendingDeposits,
      serverIp // Ditambahkan
    });
  } catch (error) {
    console.error("Stats API Error:", error);
    return NextResponse.json({ message: "Gagal mengambil statistik" }, { status: 500 });
  }
}
