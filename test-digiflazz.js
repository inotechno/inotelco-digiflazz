require('dotenv').config();
const axios = require('axios');
const crypto = require('crypto');

const DIGIFLAZZ_URL = 'https://api.digiflazz.com/v1';
const username = process.env.DIGIFLAZZ_USERNAME;
const key = process.env.DIGIFLAZZ_API_KEY;

if (!username || !key) {
    console.error('Kredensial Digiflazz tidak ditemukan di .env');
    process.exit(1);
}

async function checkProducts() {
    try {
        console.log('Menghubungi Digiflazz untuk produk Prabayar...');
        const resPrepaid = await axios.post(`${DIGIFLAZZ_URL}/price-list`, {
            cmd: 'prepaid', username, sign: crypto.createHash('md5').update(username+key+'pricelist').digest('hex')
        });
        console.log('Prabayar Count:', resPrepaid.data.data?.length || 0);

        console.log('Menghubungi Digiflazz untuk produk Pascabayar...');
        const resPasca = await axios.post(`${DIGIFLAZZ_URL}/price-list`, {
            cmd: 'pasca', username, sign: crypto.createHash('md5').update(username+key+'pricelist').digest('hex')
        });
        console.log('Pascabayar Count:', resPasca.data.data?.length || 0);
        if(resPasca.data.data?.length > 0) {
            console.log('Contoh Produk Pasca:', JSON.stringify(resPasca.data.data[0], null, 2));
        } else {
            console.log('DEBUG RES PASCA:', JSON.stringify(resPasca.data, null, 2));
        }
    } catch (error) {
        console.error('Error:', error.response ? error.response.data : error.message);
    }
}

checkProducts();
