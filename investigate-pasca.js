const axios = require('axios');
const crypto = require('crypto');

const DIGIFLAZZ_URL = 'https://api.digiflazz.com/v1';
const username = "vahodeoJeyBg";
const key = "dev-9be4f220-33c3-11f1-a3d6-b3b7423fa069";

const https = require('https');

async function investigate() {
    const sign = crypto.createHash('md5').update(username + key + 'pricelist').digest('hex');
    try {
        console.log('Fetching Pasca...');
        const res = await axios.post(`${DIGIFLAZZ_URL}/price-list`, {
            cmd: 'pasca',
            username: username,
            sign: sign
        }, {
            httpsAgent: new https.Agent({ rejectUnauthorized: false })
        });
        console.log('PASCA RESPONSE KEYS:', Object.keys(res.data));
        console.log('PASCA DATA IS ARRAY?', Array.isArray(res.data.data));
        if (res.data.data) {
            console.log('PASCA DATA LENGTH:', res.data.data.length);
            if (res.data.data.length > 0) {
                console.log('PASCA SAMPLE:', JSON.stringify(res.data.data[0], null, 2));
            }
        } else {
            console.log('FULL RESPONSE:', JSON.stringify(res.data, null, 2));
        }
    } catch (e) {
        console.error('ERROR:', e.response?.data || e.message);
    }
}

investigate();
