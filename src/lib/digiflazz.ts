import axios from 'axios';
import crypto from 'crypto';
import redis from './redis';
import prisma from './prisma';
import https from 'https';

const DIGIFLAZZ_URL = 'https://api.digiflazz.com/v1';

// Bypass SSL verification in development to avoid "self-signed certificate" errors
const digiflazzClient = axios.create({
  httpsAgent: new https.Agent({
    rejectUnauthorized: process.env.NODE_ENV === 'production'
  }),
  timeout: 60000,
});

/**
 * Mendapatkan Kredensial dari ENV atau Database
 */
const getCredentials = async () => {
  const envUser = process.env.DIGIFLAZZ_USERNAME?.replace(/['"]/g, '').trim();
  const envKey = process.env.DIGIFLAZZ_API_KEY?.replace(/['"]/g, '').trim();

  if (envUser && envKey) return { username: envUser, key: envKey };

  // Jika env tidak ada, cari di database model Config
  const configs = await prisma.config.findMany({
    where: {
      key: { in: ['DIGIFLAZZ_USERNAME', 'DIGIFLAZZ_API_KEY'] }
    }
  });

  const username = configs.find((c: any) => c.key === 'DIGIFLAZZ_USERNAME')?.value?.replace(/['"]/g, '').trim();
  const key = configs.find((c: any) => c.key === 'DIGIFLAZZ_API_KEY')?.value?.replace(/['"]/g, '').trim();

  return { username, key };
};

const generateSign = (username: string, key: string, cmd: string) => {
  const cleanUser = username.replace(/['"]/g, '').trim();
  const cleanKey = key.replace(/['"]/g, '').trim();
  const cleanCmd = cmd.trim();

  console.log(cleanUser + cleanKey + cleanCmd)
  
  return crypto
    .createHash('md5')
    .update(cleanUser + cleanKey + cleanCmd)
    .digest('hex');
};

export const digiflazz = {
  /**
   * Cek Saldo Digiflazz
   */
  async getBalance() {
    const { username, key } = await getCredentials();
    if (!username || !key) return { error: 'Kredensial Digiflazz tidak ditemukan. Mohon atur di Admin Panel.' };

    const sign = generateSign(username, key, 'depo');
    try {
      const response = await digiflazzClient.post(`${DIGIFLAZZ_URL}/cek-saldo`, {
        cmd: 'deposit',
        username: username,
        sign: sign,
      });
      return response.data;
    } catch (error: any) {
      console.error('Digiflazz Balance Error:', error.response?.data || error.message);
      return { error: 'Gagal menghubungi server Digiflazz.' };
    }
  },

  /**
   * Ambil Daftar Harga / Produk
   */
  async getPriceList(type: 'prepaid' | 'pasca' = 'prepaid') {
    const { username, key } = await getCredentials();
    if (!username || !key) return { error: 'Kredensial Digiflazz tidak ditemukan.' };

    const cacheKey = `digiflazz:pricelist:${type}`;
    
    // Check Cache (Jika Redis Aktif)
    if (redis) {
      try {
        const cachedData = await redis.get(cacheKey);
        if (cachedData) return JSON.parse(cachedData);
      } catch (err) {
        console.warn('Redis read failed, skipping cache...');
      }
    }

    const sign = generateSign(username, key, 'pricelist');
    try {
      console.log(`Fetching Digiflazz PriceList (${type})...`, { username });
      const response = await digiflazzClient.post(`${DIGIFLAZZ_URL}/price-list`, {
        cmd: type,
        username: username,
        sign: sign,
      });

      if (response.data.data) {
        const data = response.data.data;
        if (redis) {
          // Cache data for 1 hour
          try {
            await redis.set(cacheKey, JSON.stringify(data), 'EX', 3600);
          } catch (err) {
            console.warn('Redis write failed, skipping cache update...');
          }
        }
        return data;
      } else {
        console.error('Digiflazz API response missing data:', response.data);
        return { error: response.data.message || 'Data produk tidak ditemukan di respon Digiflazz.' };
      }
    } catch (error: any) {
      console.error('Digiflazz PriceList Error:', error.response?.data || error.message);
      return { error: error.response?.data?.message || 'Gagal menghubungi server Digiflazz.' };
    }
  },

  /**
   * Eksekusi Transaksi
   */
  async createTransaction(ref_id: string, sku: string, customer_no: string) {
    const { username, key } = await getCredentials();
    if (!username || !key) throw new Error('Kredensial Digiflazz tidak ditemukan.');

    const sign = crypto
      .createHash('md5')
      .update(username + key + ref_id)
      .digest('hex');

    try {
      const response = await digiflazzClient.post(`${DIGIFLAZZ_URL}/transaction`, {
        username: username,
        buyer_sku_code: sku,
        customer_no: customer_no,
        ref_id: ref_id,
        testing: process.env.NODE_ENV !== 'production', // Otomatis testing jika development
        sign: sign,
      });
      return response.data;
    } catch (error: any) {
      console.error('Digiflazz Transaction Error:', error.response?.data || error.message);
      throw error;
    }
  },

  /**
   * Request Tiket Deposit
   */
  async createDepositTicket(amount: number, bank: string, owner_name: string) {
    const { username, key } = await getCredentials();
    if (!username || !key) throw new Error('Kredensial Digiflazz tidak ditemukan.');

    const sign = crypto.createHash('md5').update(username + key + 'deposit').digest('hex');

    try {
      const response = await digiflazzClient.post(`${DIGIFLAZZ_URL}/deposit`, {
        username,
        amount,
        Bank: bank,
        owner_name: owner_name,
        sign
      });
      return response.data;
    } catch (error: any) {
      console.error('Digiflazz Deposit Error:', error.response?.data || error.message);
      throw error;
    }
  },

  /**
   * Inquiry PLN (Cek Nama Pelanggan)
   */
  async inquiryPLN(customer_no: string) {
    const { username, key } = await getCredentials();
    if (!username || !key) throw new Error('Kredensial Digiflazz tidak ditemukan.');

    const cleanUser = username.replace(/['"]/g, '').trim();
    const cleanKey = key.replace(/['"]/g, '').trim();
    const cleanNo = customer_no.trim();

    const sign = crypto.createHash('md5').update(cleanUser + cleanKey + cleanNo).digest('hex');

    try {
      const response = await digiflazzClient.post(`${DIGIFLAZZ_URL}/inquiry-pln`, {
        customer_no: cleanNo,
        username: cleanUser,
        sign
      });
      return response.data;
    } catch (error: any) {
      console.error('Digiflazz PLN Inquiry Error:', error.response?.data || error.message);
      return error.response?.data || { message: error.message };
    }
  },

  /**
   * Inquiry Pascabayar (Check Bill)
   */
  async inquiryPostpaid(sku: string, customer_no: string, ref_id: string) {
    const { username, key } = await getCredentials();
    if (!username || !key) throw new Error('Kredensial Digiflazz tidak ditemukan.');

    const cleanUser = username.replace(/['"]/g, '').trim();
    const cleanKey = key.replace(/['"]/g, '').trim();
    const cleanNo = customer_no.trim();
    const cleanRef = ref_id.trim();

    const sign = crypto.createHash('md5').update(cleanUser + cleanKey + cleanRef).digest('hex');

    try {
      const response = await digiflazzClient.post(`${DIGIFLAZZ_URL}/transaction`, {
        commands: "inq-pasca",
        username: cleanUser,
        buyer_sku_code: sku,
        customer_no: cleanNo,
        ref_id: cleanRef,
        sign
      });
      return response.data;
    } catch (error: any) {
      console.error('Digiflazz Postpaid Inquiry Error:', error.response?.data || error.message);
      return error.response?.data || { message: error.message };
    }
  },

  /**
   * Cek Status Transaksi (Prepaid/Postpaid)
   * Dilakukan dengan melakukan request transaksi ulang dengan ref_id yang sama
   */
  async checkTransaction(ref_id: string, sku: string, customer_no: string) {
    const { username, key } = await getCredentials();
    if (!username || !key) throw new Error('Kredensial Digiflazz tidak ditemukan.');

    const sign = crypto.createHash('md5').update(username + key + ref_id).digest('hex');

    try {
      // Cek status = topup ulang dengan ref_id yang sama (sesuai docs Digiflazz)
      // Field "testing" valid dan diperlukan untuk dev mode (sesuai test case docs)
      const response = await digiflazzClient.post(`${DIGIFLAZZ_URL}/transaction`, {
        username: username,
        buyer_sku_code: sku,
        customer_no: customer_no,
        ref_id: ref_id,
        testing: process.env.NODE_ENV !== 'production',
        sign: sign,
      });
      // Response dibungkus { data: { status, rc, sn, ... } } — ambil inner data
      return response.data?.data ?? response.data;
    } catch (error: any) {
      console.error('Digiflazz Status Check Error:', error.response?.data || error.message);
      throw error;
    }
  }
};
