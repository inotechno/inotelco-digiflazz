const axios = require('axios');
const crypto = require('crypto');
const https = require('https');

const DIGIFLAZZ_URL = 'https://api.digiflazz.com/v1';
const username = "vahodeoJeyBg";
const key = "dev-9be4f220-33c3-11f1-a3d6-b3b7423fa069";
const customerNo = "539111185143";

async function testSign() {
    const refId = "TEST-INQ-" + Date.now();
    const sku = "PLNPASCA";
    const signs = [
        { name: 'pln-prepaid', url: `${DIGIFLAZZ_URL}/inquiry-pln`, body: { customer_no: customerNo, username, sign: crypto.createHash('md5').update(username + key + 'pln').digest('hex') } },
        { name: 'pasca-depo', url: `${DIGIFLAZZ_URL}/transaction`, body: { commands: 'inq-pasca', buyer_sku_code: sku, customer_no: customerNo, username, ref_id: refId, sign: crypto.createHash('md5').update(username + key + 'depo').digest('hex') } },
        { name: 'pasca-refid', url: `${DIGIFLAZZ_URL}/transaction`, body: { commands: 'inq-pasca', buyer_sku_code: sku, customer_no: customerNo, username, ref_id: refId, sign: crypto.createHash('md5').update(username + key + refId).digest('hex') } }
    ];

    for (const s of signs) {
        try {
            console.log(`Testing: ${s.name}`);
            const res = await axios.post(s.url, s.body, {
                httpsAgent: new https.Agent({ rejectUnauthorized: false })
            });
            console.log(`RESULT ${s.name}:`, JSON.stringify(res.data, null, 2));
        } catch (e) {
            console.log(`ERROR ${s.name}:`, e.response?.data?.data?.message || e.response?.data?.message || e.message);
        }
    }
}

testSign();
