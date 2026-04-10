import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { logActivity } from "@/lib/logger";

// GET ALL CONFIG
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== "ADMIN") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const configs = await prisma.config.findMany();
    
    // Transform to Object for easier use in frontend
    const configObj = configs.reduce((acc: any, curr) => {
      acc[curr.key] = curr.value;
      return acc;
    }, {});

    return NextResponse.json(configObj);
  } catch (error) {
    return NextResponse.json({ message: "Gagal mengambil config" }, { status: 500 });
  }
}

// UPDATE CONFIG
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== "ADMIN") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const data = await req.json(); // Expected { key: value, ... }

    const updates = Object.entries(data).map(([key, value]) => {
      return prisma.config.upsert({
        where: { key },
        update: { value: String(value) },
        create: { key, value: String(value) },
      });
    });

    await prisma.$transaction(updates);

    // LOG ACTIVITY
    await logActivity({
      userId: (session.user as any).id,
      action: "UPDATE_CONFIG",
      details: `Memperbarui konfigurasi: ${Object.keys(data).join(", ")}`,
    });

    return NextResponse.json({ message: "Pengaturan berhasil disimpan" });
  } catch (error) {
    return NextResponse.json({ message: "Gagal menyimpan config" }, { status: 500 });
  }
}
