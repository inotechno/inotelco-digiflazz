import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ category: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    const { category } = await params;
    
    const categoryUpper = category.toUpperCase();
    // Standard names based on DB casing to ensure notIn works correctly (Prisma is case-sensitive)
    const standardCategories = ['Pulsa', 'Data', 'PLN', 'E-Money', 'Games', 'PDAM', 'Voucher', 'BPJS', 'Internet', 'TV', 'PBB', 'Pascabayar'];

    let products = [];

    if (category.toLowerCase() === 'more') {
      products = await prisma.product.findMany({
        where: {
          AND: [
             { category: { notIn: standardCategories } },
             { brand: { notIn: standardCategories } },
          ],
          seller_product_status: true,
        },
        orderBy: [
          { category: 'asc' },
          { price: 'asc' }
        ]
      });
    } else {
      products = await prisma.product.findMany({
        where: {
          OR: [
            { category: { contains: categoryUpper, mode: 'insensitive' } },
            { brand: { contains: categoryUpper, mode: 'insensitive' } },
          ],
          seller_product_status: true,
        },
        orderBy: [
          { brand: 'asc' },
          { price: 'asc' }
        ]
      });
    }
    
    const userRole = (session?.user as any)?.role || "MEMBER";

    // 1. Ambil Konfigurasi Database (Markup & Mode)
    const configs = await prisma.config.findMany({
      where: {
        key: { in: ['MARKUP_MEMBER', 'MARKUP_RESELLER', 'MARKUP_MODE'] }
      }
    });

    const markupMode = configs.find(c => c.key === 'MARKUP_MODE')?.value || "NOMINAL";
    const markupMemberGlobal = Number(configs.find(c => c.key === 'MARKUP_MEMBER')?.value || 1500);
    const markupResellerGlobal = Number(configs.find(c => c.key === 'MARKUP_RESELLER')?.value || 1000);

    const productsWithMarkup = products.map((p) => {
      const originalPrice = Number(p.price);
      
      // Pilih Markup (Manual per Produk vs Global)
      let mMember = p.markup_member !== null ? Number(p.markup_member) : markupMemberGlobal;
      let mReseller = p.markup_reseller !== null ? Number(p.markup_reseller) : markupResellerGlobal;

      // Hitung Harga Akhir
      const calculatePrice = (base: number, m: number) => {
        if (markupMode === "PERCENTAGE") {
            return base + (base * m / 100);
        }
        return base + m;
      };

      const finalMemberPrice = Math.round(calculatePrice(originalPrice, mMember));
      const finalResellerPrice = Math.round(calculatePrice(originalPrice, mReseller));

      // Default Price untuk User (berdasarkan role)
      let displayPrice = finalMemberPrice;
      if (userRole === "RESELLER") displayPrice = finalResellerPrice;
      if (userRole === "ADMIN") displayPrice = Math.round(originalPrice);

      return {
        ...p,
        price: displayPrice,
        price_details: userRole === "ADMIN" ? {
            original: Math.round(originalPrice),
            member: finalMemberPrice,
            reseller: finalResellerPrice,
            markup_member: mMember,
            markup_reseller: mReseller,
            mode: markupMode
        } : null
      };
    });

    return NextResponse.json(productsWithMarkup);
  } catch (error) {
    return NextResponse.json({ message: "Gagal mengambil produk" }, { status: 500 });
  }
}
