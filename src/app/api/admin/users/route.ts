import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { logActivity } from "@/lib/logger";
import { Role } from "@prisma/client";

// LIST ALL USERS
export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== "ADMIN") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search");
    const role = searchParams.get("role");

    const users = await prisma.user.findMany({
      where: {
        AND: [
          search ? {
            OR: [
              { name: { contains: search, mode: 'insensitive' } },
              { email: { contains: search, mode: 'insensitive' } },
            ]
          } : {},
          role ? { role: role as Role } : {},
        ]
      },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        balance: true,
        createdAt: true,
      }
    });

    return NextResponse.json(users);
  } catch (error) {
    return NextResponse.json({ message: "Internal Error" }, { status: 500 });
  }
}

// UPDATE USER (Balance / Role)
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== "ADMIN") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { userId, balance, role } = await req.json();

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        balance: balance !== undefined ? balance : undefined,
        role: role || undefined
      }
    });

    // LOG ACTIVITY
    await logActivity({
      userId: (session.user as any).id,
      action: "ADMIN_UPDATE_USER",
      details: `Admin memperbarui user ${updatedUser.email} (Balance: ${balance}, Role: ${role})`,
    });

    return NextResponse.json({ message: `User ${updatedUser.name} berhasil diperbarui` });
  } catch (error) {
    return NextResponse.json({ message: "Gagal memperbarui user" }, { status: 500 });
  }
}
