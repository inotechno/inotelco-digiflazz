export const dynamic = 'force-dynamic';
import { NextResponse } from "next/server";
import { digiflazz } from "@/lib/digiflazz";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== "ADMIN") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { amount, bank, owner_name } = await req.json();

    if (!amount || !bank || !owner_name) {
      return NextResponse.json({ message: "Data tidak lengkap" }, { status: 400 });
    }

    const ticketData = await digiflazz.createDepositTicket(Number(amount), bank, owner_name);
    return NextResponse.json(ticketData);
  } catch (error: any) {
    console.error("Deposit Ticket API Error:", error);
    return NextResponse.json({ message: "Gagal membuat tiket deposit" }, { status: 500 });
  }
}
