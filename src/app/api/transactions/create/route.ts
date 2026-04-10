import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { digiflazz } from "@/lib/digiflazz";
import { logActivity } from "@/lib/logger";
import crypto from "crypto";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ message: "Sesi habis, silakan login kembali" }, { status: 401 });
    }

    const { sku, customerNo } = await req.json();

    if (!sku || !customerNo) {
      return NextResponse.json({ message: "Data pesanan tidak lengkap" }, { status: 400 });
    }

    // 1. Ambil data produk & user terbaru dari DB
    const [product, user] = await Promise.all([
      prisma.product.findUnique({ where: { sku } }),
      prisma.user.findUnique({ where: { email: session.user.email! } })
    ]);

    if (!product || !user) {
      return NextResponse.json({ message: "Produk atau User tidak ditemukan" }, { status: 404 });
    }

    // 1. Ambil Konfigurasi Markup Global
    const configs = await prisma.config.findMany({
      where: { key: { in: ['MARKUP_MEMBER', 'MARKUP_RESELLER', 'MARKUP_MODE'] } }
    });
    const markupMode = configs.find(c => c.key === 'MARKUP_MODE')?.value || "NOMINAL";
    const markupMemberGlobal = Number(configs.find(c => c.key === 'MARKUP_MEMBER')?.value || 1500);
    const markupResellerGlobal = Number(configs.find(c => c.key === 'MARKUP_RESELLER')?.value || 1000);

    // 2. Tentukan Harga Jual (Pilih Manual vs Global)
    const priceCost = Number(product.price);
    let mMember = product.markup_member !== null ? Number(product.markup_member) : markupMemberGlobal;
    let mReseller = product.markup_reseller !== null ? Number(product.markup_reseller) : markupResellerGlobal;

    const calculateSell = (base: number, m: number) => {
        if (markupMode === "PERCENTAGE") return base + (base * m / 100);
        return base + m;
    };

    const priceSell = Math.round(user.role === "RESELLER" ? calculateSell(priceCost, mReseller) : calculateSell(priceCost, mMember));
    const profit = priceSell - priceCost;

    // 3. Cek Saldo berdasarkan Harga Jual
    if (user.balance.lessThan(priceSell)) {
      return NextResponse.json({ message: "Saldo tidak mencukupi untuk harga layanan ini" }, { status: 400 });
    }

    // 4. Buat RefID unik (Format: TR-timestamp-random)
    const refId = `TR-${Date.now()}-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;

    // 5. Mulai Atomic Transaction
    const execution = await prisma.$transaction(async (tx) => {
      // a. Kurangi saldo user (Gunakan Harga Jual)
      const updatedUser = await tx.user.update({
        where: { id: user.id },
        data: { balance: { decrement: priceSell } }
      });

      // b. Catat Mutasi Saldo (Ledger)
      await tx.balanceMutation.create({
        data: {
          userId: user.id,
          amount: priceSell,
          type: "DEBIT",
          description: `Pembelian ${product.name} ke ${customerNo}`,
          beginningBalance: user.balance,
          endingBalance: updatedUser.balance,
        }
      });

      // c. Buat Data Transaksi dengan Laba
      const transaction = await tx.transaction.create({
        data: {
          refId: refId,
          userId: user.id,
          sku: product.sku,
          productName: product.name,
          customerNo: customerNo,
          priceCost: priceCost,
          priceSell: priceSell,
          profit: profit,
          status: "PENDING",
        }
      });

      return transaction;
    });

    // 5. Eksekusi ke Digiflazz (Async/Direct)
    try {
      console.log('--- DIGIFLAZZ HIT ---', { refId, sku, customerNo });
      const dfResponse = await digiflazz.createTransaction(refId, sku, customerNo);
      console.log('--- DIGIFLAZZ RESPONSE ---', dfResponse);
      
      const dfData = dfResponse.data;
      const finalStatus = dfData?.status === 'Sukses' ? 'SUCCESS' : 
                         dfData?.status === 'Gagal' ? 'FAILED' : 'PENDING';

      // Update SN jika ada di response awal
      if (dfData?.sn) {
        await prisma.transaction.update({
          where: { refId: refId },
          data: { 
            sn: dfData.sn,
            status: finalStatus
          }
        });
      }

      // LOG ACTIVITY
      await logActivity({
        userId: user.id,
        action: "TRANSACTION",
        details: `Melakukan transaksi ${product.name} (${sku}) ke ${customerNo}. RefID: ${refId}. Status: ${finalStatus}`,
      });

      return NextResponse.json({ 
        message: "Transaksi berhasil diproses",
        refId: refId,
        status: finalStatus,
        sn: dfData?.sn || null
      });

    } catch (dfErr: any) {
      const errorMsg = dfErr.response?.data?.data?.message || dfErr.response?.data?.message || dfErr.message;
      console.error("Digiflazz API Hit Error:", errorMsg);
      
      // Jika terjadi kesalahan dari API (seperti IP tidak terdaftar, saldo tidak cukup di provider, dll)
      // Kita kembalikan error asli agar user/admin tau penyebabnya.
      return NextResponse.json({ 
        message: `Gagal ke Provider: ${errorMsg}`,
        refId: refId,
        status: "FAILED",
        error: errorMsg
      }, { status: 400 });
    }

  } catch (error: any) {
    console.error("Transaction Creation Error:", error);
    return NextResponse.json({ message: "Terjadi kesalahan internal" }, { status: 500 });
  }
}
