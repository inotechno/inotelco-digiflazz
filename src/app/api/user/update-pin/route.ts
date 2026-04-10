export const dynamic = 'force-dynamic';
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import bcrypt from "bcrypt";
import { logActivity } from "@/lib/logger";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { oldPin, newPin } = await req.json();

    if (!oldPin || !newPin || newPin.length !== 6) {
      return NextResponse.json({ message: "Data PIN tidak valid" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email! },
    });

    if (!user) return NextResponse.json({ message: "User tidak ditemukan" }, { status: 404 });

    const isOldPinValid = await bcrypt.compare(oldPin, user.pin);
    if (!isOldPinValid) {
      return NextResponse.json({ message: "PIN lama salah" }, { status: 400 });
    }

    const hashedNewPin = await bcrypt.hash(newPin, 10);

    await prisma.user.update({
      where: { id: user.id },
      data: { pin: hashedNewPin },
    });

    // LOG ACTIVITY
    await logActivity({
      userId: user.id,
      action: "UPDATE_PIN",
      details: `User ${user.email} berhasil memperbarui PIN transaksi`,
    });

    return NextResponse.json({ message: "PIN berhasil diperbarui" });
  } catch (error) {
    return NextResponse.json({ message: "Terjadi kesalahan internal" }, { status: 500 });
  }
}
