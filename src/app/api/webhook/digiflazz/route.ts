import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import crypto from "crypto";

export async function POST(req: Request) {
  try {
    const rawBody = await req.json();
    console.log('--- WEBHOOK RECEIVED ---', JSON.stringify(rawBody, null, 2));
    const headers = req.headers;

    // Digiflazz Webhook Payload looks like:
    // {
    //   "data": {
    //     "ref_id": "...",
    //     "status": "Sukses" | "Gagal" | "Pending",
    //     "sn": "...",
    //     ...
    //   }
    // }

    const data = rawBody.data;
    if (!data) return NextResponse.json({ message: "No data" }, { status: 400 });

    const { ref_id, status, sn, price } = data;

    // Find transaction in DB
    const transaction = await prisma.transaction.findUnique({
      where: { refId: ref_id },
    });

    if (!transaction) {
      console.warn(`Webhook: Transaction with RefID ${ref_id} not found.`);
      return NextResponse.json({ message: "Transaction not found" });
    }

    // Only update if status is different
    if (transaction.status === status.toUpperCase()) {
      return NextResponse.json({ message: "Status already updated" });
    }

    // Process Status Update
    await prisma.$transaction(async (tx) => {
      // 1. Update Transaction Status & SN
      const updatedTx = await tx.transaction.update({
        where: { id: transaction.id },
        data: {
          status: status.toUpperCase() === "SUKSES" ? "SUCCESS" : 
                  status.toUpperCase() === "GAGAL" ? "FAILED" : "PENDING",
          sn: sn || transaction.sn,
        },
      });

      // 2. Handle REFUND if FAILED
      if (updatedTx.status === "FAILED" && transaction.status !== "FAILED") {
        const user = await tx.user.findUnique({ where: { id: transaction.userId } });
        if (user) {
          const newBalance = Number(user.balance) + Number(transaction.priceSell);
          
          // Add balance back to user
          await tx.user.update({
            where: { id: user.id },
            data: { balance: { increment: transaction.priceSell } }
          });

          // Create refund mutation
          await tx.balanceMutation.create({
            data: {
              userId: user.id,
              amount: transaction.priceSell,
              type: "CREDIT",
              description: `Refund Transaksi Gagal: ${transaction.productName} (${transaction.sku})`,
              beginningBalance: user.balance,
              endingBalance: newBalance,
            }
          });
        }
      }
    });

    console.log(`Webhook processed for ${ref_id}: ${status}`);
    return NextResponse.json({ message: "Webhook processed" });

  } catch (error) {
    console.error("Webhook Error:", error);
    return NextResponse.json({ message: "Internal Error" }, { status: 500 });
  }
}
