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

    const { oldPassword, newPassword } = await req.json();

    if (!oldPassword || !newPassword || newPassword.length < 8) {
      return NextResponse.json({ message: "Password minimal 8 karakter" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email! },
    });

    if (!user) return NextResponse.json({ message: "User tidak ditemukan" }, { status: 404 });

    const isOldPassValid = await bcrypt.compare(oldPassword, user.password);
    if (!isOldPassValid) {
      return NextResponse.json({ message: "Password lama salah" }, { status: 400 });
    }

    const hashedNewPassword = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedNewPassword },
    });

    // LOG ACTIVITY
    await logActivity({
      userId: user.id,
      action: "UPDATE_PASSWORD",
      details: `User ${user.email} berhasil memperbarui password akun`,
    });

    return NextResponse.json({ message: "Password berhasil diperbarui" });
  } catch (error) {
    return NextResponse.json({ message: "Terjadi kesalahan internal" }, { status: 500 });
  }
}
