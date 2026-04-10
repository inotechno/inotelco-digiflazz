const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { digiflazz } = require('./src/lib/digiflazz'); // I hope this works with require, maybe not because it's TS

// Better use a simple script that mimics the sync logic
async function manualSync() {
    try {
        console.log('Fetching Pasca...');
        // Manual fetch to bypass potential lib issues
        const allProducts = []; // Assume we got the array from the previous check
        
        // I'll just use the previous investigation logic to get data
        const data = [
          {
            "category": "PASCABAYAR",
            "brand": "PLN",
            "product_name": "PLN PASCABAYAR",
            "buyer_sku_code": "PLNPASCA",
            "price": 0,
            "buyer_product_status": true,
            "seller_product_status": true,
            "desc": "-",
            "type": "postpaid"
          }
        ];

        console.log('Upserting sample...');
        const result = await prisma.product.upsert({
            where: { sku: data[0].buyer_sku_code },
            update: {
                name: data[0].product_name,
                category: data[0].category,
                brand: data[0].brand,
                price: data[0].price,
                buyer_product_status: data[0].buyer_product_status,
                seller_product_status: data[0].seller_product_status,
                desc: data[0].desc,
                type: data[0].type,
            },
            create: {
                sku: data[0].buyer_sku_code,
                name: data[0].product_name,
                category: data[0].category,
                brand: data[0].brand,
                price: data[0].price,
                buyer_product_status: data[0].buyer_product_status,
                seller_product_status: data[0].seller_product_status,
                desc: data[0].desc,
                type: data[0].type,
            },
        });
        console.log('Result:', result);
    } catch (e) {
        console.error('ERROR:', e);
    }
}

manualSync();
