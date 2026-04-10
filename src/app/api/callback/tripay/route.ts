import { NextResponse } from "next/server";
import crypto from "crypto";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const rawBody = await req.text();
    const notification = JSON.parse(rawBody);

    // 1. Ambil Private Key dari Config
    const config = await prisma.config.findUnique({
      where: { key: "TRIPAY_PRIVATE_KEY" }
    });

    if (!config) return NextResponse.json({ message: "Config missing" }, { status: 500 });

    // 2. Validasi Signature
    const signature = crypto
      .createHmac("sha256", config.value)
      .update(rawBody)
      .digest("hex");

    const tripaySignature = req.headers.get("X-Callback-Signature");

    if (signature !== tripaySignature) {
      return NextResponse.json({ message: "Invalid Signature" }, { status: 403 });
    }

    // 3. Proses Status PAID
    if (notification.status === "PAID") {
      const reference = notification.merchant_ref;

      const deposit = await prisma.deposit.findUnique({
        where: { reference },
        include: { user: true }
      });

      if (deposit && deposit.status === "PENDING") {
        await prisma.$transaction(async (tx) => {
          // Update Deposit
          await tx.deposit.update({
            where: { id: deposit.id },
            data: { status: "SUCCESS" }
          });

          // Tambah Saldo
          const updatedUser = await tx.user.update({
            where: { id: deposit.userId },
            data: { balance: { increment: deposit.amount } }
          });

          // Ledger Mutasi
          await tx.balanceMutation.create({
            data: {
              userId: deposit.userId,
              amount: deposit.amount,
              type: "CREDIT",
              beginningBalance: deposit.user.balance,
              endingBalance: updatedUser.balance,
              description: `Otomatis: Deposit QRIS ${notification.payment_name} (Ref: ${reference})`,
            }
          });
        });
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("TriPay Callback Error:", error);
    return NextResponse.json({ message: "Internal Error" }, { status: 500 });
  }
}
