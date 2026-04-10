const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
  const prepaidCount = await prisma.product.count({ where: { type: 'prepaid' } });
  const postpaidCount = await prisma.product.count({ where: { type: 'postpaid' } });
  console.log('--- DATABASE PRODUCT STATS ---');
  console.log('Prepaid:', prepaidCount);
  console.log('Postpaid:', postpaidCount);
  
  if (postpaidCount > 0) {
    const sample = await prisma.product.findFirst({ where: { type: 'postpaid' } });
    console.log('Sample Postpaid:', sample);
  }
}

check();
