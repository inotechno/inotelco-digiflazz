export const dynamic = 'force-dynamic';

import { NextResponse } from "next/server";
import { digiflazz } from "@/lib/digiflazz";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== "ADMIN") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const balanceData = await digiflazz.getBalance();
    return NextResponse.json(balanceData);
  } catch (error: any) {
    console.error("Balance API Error:", error);
    return NextResponse.json({ message: "Gagal mengambil saldo" }, { status: 500 });
  }
}
