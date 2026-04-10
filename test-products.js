const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const count = await prisma.product.count();
  const activeCount = await prisma.product.count({
    where: {
      buyer_product_status: true,
      seller_product_status: true,
    }
  });
  const sample = await prisma.product.findFirst();
  console.log('Total:', count);
  console.log('Active:', activeCount);
  console.log('Sample:', JSON.stringify(sample, null, 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());
