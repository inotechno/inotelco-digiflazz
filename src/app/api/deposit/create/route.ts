import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import crypto from "crypto";
import { tripay } from "@/lib/tripay";
import { logActivity } from "@/lib/logger";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { amount, method } = await req.json();

    if (!amount || amount < 10000) {
      return NextResponse.json({ message: "Minimal deposit Rp 10.000" }, { status: 400 });
    }

    // 1. Generate Kode Unik (1-999)
    const uniqueCode = Math.floor(Math.random() * 998) + 1;
    const finalAmount = Math.floor(amount / 1000) * 1000 + uniqueCode;

    // 2. Buat Reference ID unik
    const reference = `DEP-${Date.now()}-${crypto.randomBytes(2).toString('hex').toUpperCase()}`;

    let tripayData = null;

    // 4. Jika QRIS, Request ke TriPay
    if (method === "QRIS") {
      try {
        const res = await tripay.createTransaction({
          method: "QRIS",
          amount: amount,
          merchant_ref: reference,
          customer_name: session.user.name || "Customer",
          customer_email: session.user.email || "customer@mail.com",
        });
        tripayData = res.data;
      } catch (err) {
        console.error("TriPay Request Fail, fallback to unique code");
      }
    }

    // 5. Simpan Tiket Deposit
    const deposit = await prisma.deposit.create({
      data: {
        userId: (session.user as any).id,
        amount: tripayData ? tripayData.amount : finalAmount,
        method: method || "BANK_TRANSFER",
        status: "PENDING",
        reference: reference,
      },
    });

    // LOG ACTIVITY
    await logActivity({
      userId: (session.user as any).id,
      action: "CREATE_DEPOSIT",
      details: `Membuat tiket deposit sebesar Rp ${deposit.amount.toLocaleString()} via ${deposit.method}. Ref: ${reference}`,
    });

    return NextResponse.json({ 
      message: "Tiket deposit berhasil dibuat",
      deposit,
      tripay: tripayData
    });
  } catch (error: any) {
    console.error("Deposit Create Error:", error);
    return NextResponse.json({ message: "Terjadi kesalahan internal" }, { status: 500 });
  }
}
