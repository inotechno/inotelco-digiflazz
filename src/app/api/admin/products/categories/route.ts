export const dynamic = 'force-dynamic';

import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== "ADMIN") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const categories = await prisma.product.groupBy({
      by: ['category'],
      _count: {
        category: true
      },
      orderBy: {
        category: 'asc'
      }
    });

    return NextResponse.json(categories.map(c => c.category));
  } catch (error) {
    return NextResponse.json({ message: "Gagal mengambil kategori" }, { status: 500 });
  }
}
