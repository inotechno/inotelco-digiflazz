import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const mutations = await prisma.balanceMutation.findMany({
      where: {
        userId: (session.user as any).id,
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 50,
    });

    return NextResponse.json(mutations);
  } catch (error) {
    console.error("Fetch User Mutations Error:", error);
    return NextResponse.json({ message: "Gagal mengambil data mutasi" }, { status: 500 });
  }
}
