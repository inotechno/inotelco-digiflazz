const crypto = require('crypto');
const axios = require('axios');
const https = require('https');
const fs = require('fs');

const envContent = fs.readFileSync('.env', 'utf-8');
const username = envContent.match(/DIGIFLAZZ_USERNAME=(.*)/)?.[1]?.trim();
const key = envContent.match(/DIGIFLAZZ_API_KEY=(.*)/)?.[1]?.trim();

const customerNo = '539111185143';

const test = async (name, url, body) => {
    try {
        const res = await axios.post(url, body, {
            httpsAgent: new https.Agent({ rejectUnauthorized: false }),
            timeout: 5000
        });
        const data = res.data.data || res.data;
        console.log(`[${name}] RC: ${data.rc} - ${data.message}`);
    } catch (e) {
        console.log(`[${name}] ERROR: ${e.response?.data?.data?.message || e.response?.data?.message || e.message}`);
    }
};

(async () => {
    console.log('--- PROBING ---');
    const refId = 'REF' + Date.now();
    
    // Prepaid
    await test('Pre-pln', 'https://api.digiflazz.com/v1/inquiry-pln', { username, customer_no: customerNo, sign: crypto.createHash('md5').update(username + key + 'pln').digest('hex') });
    
    // Postpaid
    await test('Pasca-depo', 'https://api.digiflazz.com/v1/transaction', { commands: 'inq-pasca', username, buyer_sku_code: 'PLNPASCA', customer_no: customerNo, ref_id: refId, sign: crypto.createHash('md5').update(username + key + 'depo').digest('hex') });
    await test('Pasca-refid', 'https://api.digiflazz.com/v1/transaction', { commands: 'inq-pasca', username, buyer_sku_code: 'PLNPASCA', customer_no: customerNo, ref_id: refId, sign: crypto.createHash('md5').update(username + key + refId).digest('hex') });
    await test('Pasca-pln', 'https://api.digiflazz.com/v1/transaction', { commands: 'inq-pasca', username, buyer_sku_code: 'PLNPASCA', customer_no: customerNo, ref_id: refId, sign: crypto.createHash('md5').update(username + key + 'pln').digest('hex') });
    await test('Pasca-inquiry', 'https://api.digiflazz.com/v1/transaction', { commands: 'inq-pasca', username, buyer_sku_code: 'PLNPASCA', customer_no: customerNo, ref_id: refId, sign: crypto.createHash('md5').update(username + key + 'inquiry').digest('hex') });
})();
