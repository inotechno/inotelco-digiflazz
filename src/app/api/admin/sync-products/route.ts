import { NextResponse } from "next/server";
import { digiflazz } from "@/lib/digiflazz";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { logActivity } from "@/lib/logger";

export async function POST() {
  try {
    const session = await getServerSession(authOptions);
    
    // Proteksi: Hanya Admin yang bisa sync produk
    if (!session || (session.user as any).role !== "ADMIN") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // Fetch both prepaid and postpaid
    const [prepaidProducts, pascaProducts] = await Promise.all([
      digiflazz.getPriceList('prepaid'),
      digiflazz.getPriceList('pasca')
    ]);

    // LOG SINKRONISASI UNTUK DEBUG
    console.log('--- SYNC DEBUG ---');
    console.log('Prepaid is Array?', Array.isArray(prepaidProducts), 'Length:', prepaidProducts?.length);
    console.log('Pasca is Array?', Array.isArray(pascaProducts), 'Length:', pascaProducts?.length);
    if (!Array.isArray(pascaProducts)) {
        console.log('Pasca Object:', JSON.stringify(pascaProducts, null, 2));
    }

    await logActivity({
      userId: (session.user as any).id,
      action: "DEBUG_SYNC",
      details: `Prepaid: ${Array.isArray(prepaidProducts) ? prepaidProducts.length : 'NOT_ARRAY'}, Pasca: ${Array.isArray(pascaProducts) ? pascaProducts.length : 'NOT_ARRAY'}. PascaData: ${JSON.stringify(pascaProducts).substring(0, 200)}`,
    });

    if ((!prepaidProducts || prepaidProducts.error) && (!pascaProducts || pascaProducts.error)) {
      return NextResponse.json({ message: "Gagal mengambil data dari Digiflazz" }, { status: 500 });
    }

    const allProducts = [
      ...(Array.isArray(prepaidProducts) ? prepaidProducts.map((p: any) => ({ ...p, type: 'prepaid' })) : []),
      ...(Array.isArray(pascaProducts) ? pascaProducts.map((p: any) => ({ ...p, type: 'postpaid' })) : [])
    ];

    // Bulk Update/Create Products in batches
    const BATCH_SIZE = 100;
    let syncedCount = 0;

    for (let i = 0; i < allProducts.length; i += BATCH_SIZE) {
      const batch = allProducts.slice(i, i + BATCH_SIZE);
      await prisma.$transaction(
        batch.map((p: any) => {
          const sku = p.buyer_sku_code || p.sku;
          const price = p.price ?? 0;
          
          if (!sku) return null;

          return prisma.product.upsert({
            where: { sku: sku },
            update: {
              name: p.product_name || p.name,
              category: p.category,
              brand: p.brand,
              price: price,
              buyer_product_status: p.buyer_product_status ?? true,
              seller_product_status: p.seller_product_status ?? true,
              desc: p.desc || "",
              type: p.type,
            },
            create: {
              sku: sku,
              name: p.product_name || p.name,
              category: p.category,
              brand: p.brand,
              price: price,
              buyer_product_status: p.buyer_product_status ?? true,
              seller_product_status: p.seller_product_status ?? true,
              desc: p.desc || "",
              type: p.type,
            },
          });
        }).filter(Boolean) as any
      );
      syncedCount += batch.length;
    }

    // LOG ACTIVITY
    await logActivity({
      userId: (session.user as any).id,
      action: "SYNC_PRODUCTS",
      details: `Berhasil sinkronisasi ${syncedCount} produk (Prabayar & Pascabayar) dari Digiflazz`,
    });

    return NextResponse.json({ 
      message: "Sinkronisasi Berhasil", 
      count: syncedCount,
      prepaidCount: Array.isArray(prepaidProducts) ? prepaidProducts.length : 0,
      pascaCount: Array.isArray(pascaProducts) ? pascaProducts.length : 0,
      pascaError: pascaProducts.error || null
    });
  } catch (error: any) {
    console.error("Sync Error:", error);
    return NextResponse.json({ message: "Terjadi kesalahan sistem saat sinkronisasi" }, { status: 500 });
  }
}
