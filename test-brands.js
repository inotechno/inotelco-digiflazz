const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const brands = await prisma.product.findMany({
    select: { brand: true },
    distinct: ['brand'],
  });
  console.log('Brands:', brands);
}

main().catch(console.error).finally(() => prisma.$disconnect());
