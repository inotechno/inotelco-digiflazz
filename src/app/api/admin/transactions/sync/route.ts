import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { digiflazz } from "@/lib/digiflazz";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { role } = session.user as any;
    if (role !== "ADMIN") {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    // 1. Ambil transaksi yang masih PENDING
    const pendingTransactions = await prisma.transaction.findMany({
      where: {
        status: "PENDING",
        createdAt: {
            gte: new Date(Date.now() - 24 * 60 * 60 * 1000) // 24 jam terakhir saja
        }
      }
    });

    if (pendingTransactions.length === 0) {
      return NextResponse.json({ message: "Tidak ada transaksi pending untuk disinkronkan" });
    }

    let updatedCount = 0;

    // 2. Cek status ke Digiflazz satu per satu
    for (const tx of pendingTransactions) {
      try {
        const dfResponse = await digiflazz.checkTransaction(tx.refId, tx.sku, tx.customerNo);
        const dfData = dfResponse.data;

        if (dfData && dfData.rc) {
          const finalStatus = dfData.status === 'Sukses' ? 'SUCCESS' : 
                             dfData.status === 'Gagal' ? 'FAILED' : 'PENDING';
          
          if (finalStatus !== 'PENDING') {
            await prisma.$transaction(async (prismaTx) => {
                // Update status & SN
                await prismaTx.transaction.update({
                    where: { id: tx.id },
                    data: {
                        status: finalStatus,
                        sn: dfData.sn || tx.sn
                    }
                });

                // Jika GAGAL, lakukan REFUND otomatis
                if (finalStatus === 'FAILED') {
                    const user = await prismaTx.user.findUnique({ where: { id: tx.userId } });
                    if (user) {
                        await prismaTx.user.update({
                            where: { id: user.id },
                            data: { balance: { increment: tx.priceSell } }
                        });

                        await prismaTx.balanceMutation.create({
                            data: {
                                userId: user.id,
                                amount: tx.priceSell,
                                type: "CREDIT",
                                description: `Refund Otomatis (Sync): ${tx.productName}`,
                                beginningBalance: user.balance,
                                endingBalance: Number(user.balance) + Number(tx.priceSell)
                            }
                        });
                    }
                }
            });
            updatedCount++;
          }
        }
      } catch (err) {
        console.error(`Sync error for ${tx.refId}:`, err);
      }
    }

    return NextResponse.json({ 
      message: `Sinkronisasi selesai. ${updatedCount} transaksi diperbarui.`,
      updatedCount 
    });

  } catch (error: any) {
    console.error("Sync Transactions Error:", error);
    return NextResponse.json({ message: "Terjadi kesalahan internal" }, { status: 500 });
  }
}
