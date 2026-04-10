export const dynamic = 'force-dynamic';
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function PUT(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { name } = await req.json();

    if (!name || name.length < 3) {
      return NextResponse.json({ message: "Nama harus minimal 3 karakter" }, { status: 400 });
    }

    const updatedUser = await prisma.user.update({
      where: { email: session.user.email! },
      data: { name }
    });

    return NextResponse.json({ 
        message: "Profil berhasil diperbarui",
        user: { name: updatedUser.name, email: updatedUser.email }
    });

  } catch (error: any) {
    console.error("Update Profile Error:", error);
    return NextResponse.json({ message: "Terjadi kesalahan internal" }, { status: 500 });
  }
}
