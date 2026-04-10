import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== "ADMIN") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category");
    const brand = searchParams.get("brand");
    const search = searchParams.get("search");

    const products = await prisma.product.findMany({
      where: {
        AND: [
          category ? { category: category } : {},
          brand ? { brand: brand } : {},
          search ? {
            OR: [
              { name: { contains: search, mode: 'insensitive' } },
              { sku: { contains: search, mode: 'insensitive' } },
            ]
          } : {},
        ]
      },
      orderBy: { category: "asc" },
      take: 200, // Limit for performance
    });

    // 1. Ambil Konfigurasi Markup Global
    const configs = await prisma.config.findMany({
      where: { key: { in: ['MARKUP_MEMBER', 'MARKUP_RESELLER', 'MARKUP_MODE'] } }
    });
    const markupMode = configs.find(c => c.key === 'MARKUP_MODE')?.value || "NOMINAL";
    const markupMemberGlobal = Number(configs.find(c => c.key === 'MARKUP_MEMBER')?.value || 1500);
    const markupResellerGlobal = Number(configs.find(c => c.key === 'MARKUP_RESELLER')?.value || 1000);

    // 2. Petakan data produk dengan kalkulasi harga
    const productsWithPrices = products.map((p: any) => {
      const originalPrice = Number(p.price);
      let mMember = p.markup_member !== null ? Number(p.markup_member) : markupMemberGlobal;
      let mReseller = p.markup_reseller !== null ? Number(p.markup_reseller) : markupResellerGlobal;

      const calculatePrice = (base: number, m: number) => {
        if (markupMode === "PERCENTAGE") return base + (base * m / 100);
        return base + m;
      };

      return {
        ...p,
        price: Math.round(originalPrice),
        price_member: Math.round(calculatePrice(originalPrice, mMember)),
        price_reseller: Math.round(calculatePrice(originalPrice, mReseller)),
        markup_details: {
          member: mMember,
          reseller: mReseller,
          mode: markupMode,
          is_manual: p.markup_member !== null || p.markup_reseller !== null
        }
      };
    });

    return NextResponse.json(productsWithPrices);
  } catch (error) {
    return NextResponse.json({ message: "Gagal mengambil data produk" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
    try {
      const session = await getServerSession(authOptions);
      if (!session || (session.user as any).role !== "ADMIN") {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
      }
  
    const body = await req.json();
    const { sku, skus, seller_product_status, price } = body;

    if (skus && Array.isArray(skus)) {
      await prisma.product.updateMany({
        where: { sku: { in: skus } },
        data: {
          seller_product_status: seller_product_status !== undefined ? seller_product_status : undefined,
        }
      });
      return NextResponse.json({ message: "Bulk update success" });
    }

    const updated = await prisma.product.update({
      where: { sku: sku },
      data: {
        seller_product_status: seller_product_status !== undefined ? seller_product_status : undefined,
        price: price !== undefined ? price : undefined,
        markup_member: body.markup_member !== undefined ? body.markup_member : undefined,
        markup_reseller: body.markup_reseller !== undefined ? body.markup_reseller : undefined,
      }
    });

    return NextResponse.json(updated);
    } catch (error) {
      return NextResponse.json({ message: "Gagal memperbarui produk" }, { status: 500 });
    }
}
