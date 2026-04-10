import Redis from 'ioredis';

const redisClientSingleton = () => {
  if (!process.env.REDIS_URL) {
    console.warn('REDIS_URL tidak ditemukan. Caching akan dilewati (No Cache mode).');
    return null;
  }
  
  try {
    const redis = new Redis(process.env.REDIS_URL, {
      maxRetriesPerRequest: 1,
      lazyConnect: true // Jangan crash saat inisialisasi jika server tidak aktif
    });

    redis.on('error', (err) => {
      console.warn('Redis Connection Error:', err.message);
    });

    return redis;
  } catch (err) {
    console.error('Gagal inisialisasi Redis:', err);
    return null;
  }
};

declare global {
  var redis: ReturnType<typeof redisClientSingleton> | undefined;
}

const redis = globalThis.redis ?? redisClientSingleton();

export default redis;

if (process.env.NODE_ENV !== 'production') globalThis.redis = redis;
