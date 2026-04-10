import prisma from "./prisma";

export async function logActivity({
  userId,
  action,
  details,
  ipAddress
}: {
  userId?: string;
  action: string;
  details: string;
  ipAddress?: string;
}) {
  try {
    await prisma.systemLog.create({
      data: {
        userId,
        action,
        details,
        ipAddress: ipAddress || null,
      },
    });
  } catch (error) {
    console.error("Logger Error:", error);
  }
}
