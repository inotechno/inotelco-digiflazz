import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { logActivity } from "@/lib/logger";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== "ADMIN") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { depositId } = await req.json();

    const deposit = await prisma.deposit.findUnique({
      where: { id: depositId },
      include: { user: true }
    });

    if (!deposit || deposit.status !== "PENDING") {
      return NextResponse.json({ message: "Tiket tidak ditemukan atau sudah diproses" }, { status: 400 });
    }

    // Eksekusi Penambahan Saldo & Update Status secara Atomik
    const result = await prisma.$transaction(async (tx) => {
      // 1. Update status deposit
      const updatedDeposit = await tx.deposit.update({
        where: { id: depositId },
        data: { status: "SUCCESS" }
      });

      // 2. Tambah saldo user
      const updatedUser = await tx.user.update({
        where: { id: deposit.userId },
        data: { balance: { increment: deposit.amount } }
      });

      // 3. Catat Mutasi
      await tx.balanceMutation.create({
        data: {
          userId: deposit.userId,
          amount: deposit.amount,
          type: "CREDIT",
          beginningBalance: deposit.user.balance,
          endingBalance: updatedUser.balance,
          description: `Deposit via ${deposit.method} (Ref: ${deposit.reference})`,
        }
      });

      return updatedDeposit;
    });

    // LOG ACTIVITY
    await logActivity({
      userId: (session.user as any).id,
      action: "APPROVE_DEPOSIT",
      details: `Menyetujui deposit ${deposit.reference} sebesar Rp ${deposit.amount.toLocaleString()} untuk user ${deposit.user.email}`,
    });

    return NextResponse.json({ message: "Deposit berhasil disetujui, saldo user bertambah" });
  } catch (error) {
    console.error("Deposit Approve Error:", error);
    return NextResponse.json({ message: "Terjadi kesalahan internal" }, { status: 500 });
  }
}
