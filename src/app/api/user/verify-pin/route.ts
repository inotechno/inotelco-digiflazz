export const dynamic = 'force-dynamic';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import bcrypt from "bcrypt";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ message: "Not authenticated" }, { status: 401 });
    }

    const { pin } = await req.json();
    if (!pin || pin.length !== 6) {
      return NextResponse.json({ message: "PIN harus 6 digit" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email! },
      select: { pin: true },
    });

    if (!user || !user.pin) {
      return NextResponse.json({ message: "PIN belum diatur" }, { status: 400 });
    }

    const isPinValid = await bcrypt.compare(pin, user.pin);

    if (!isPinValid) {
      return NextResponse.json({ message: "PIN salah" }, { status: 400 });
    }

    return NextResponse.json({ message: "PIN valid", success: true });
  } catch (error) {
    console.error("PIN Verify Error:", error);
    return NextResponse.json({ message: "Terjadi kesalahan sistem" }, { status: 500 });
  }
}
