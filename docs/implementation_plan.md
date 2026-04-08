# Implementation Plan: InoTelco (PPOB Premium)

InoTelco adalah platform buyer Digiflazz yang memungkinkan Anda menjual produk digital dengan sistem otomatis.

## 1. Fitur Utama (Full Features)

### A. Fitur User & Tiering (Member vs Reseller)

- **User Tiering System**: Pembagian level pengguna untuk strategi harga yang berbeda.
  - **Member**: Pengguna standar, harga produk dengan markup normal. Cocok untuk penggunaan pribadi.
  - **Reseller**: Pengguna khusus bisnis, mendapatkan **harga lebih murah (VIP Price)**. Memiliki dashboard laporan yang lebih detail untuk memantau keuntungan penjualan mereka sendiri.
  - **HEO/Partner (Optional)**: Level tertinggi dengan harga termurah, biasanya untuk distributor besar.
- **Sistem Upgrade Level**: Pengguna dapat melakukan upgrade dari Member ke Reseller secara otomatis dengan membayar biaya upgrade atau melalui admin.
- **Modern Dashboard**: Ringkasan saldo, poin, dan histori transaksi berdasarkan level user.
- **Produk Digital Lengkap**:
  - **Prepaid**: Pulsa, Paket Data, Token PLN, Saldo E-Wallet, Voucher Game.
  - **Postpaid**: Tagihan PLN, BPJS, PDAM, Telkom, HP Pasca.
- **Sistem Checkout Cepat**: Deteksi otomatis provider berdasarkan prefix nomor HP.
- **Secure Transaction**: Konfirmasi transaksi menggunakan PIN keamanan.
- **Deposit Otomatis 24 Jam**: Integrasi Payment Gateway (Tripay/Midtrans) dengan saldo yang masuk instan.
- **Riwayat & Cetak Struk**: Fitur cetak struk yang dapat dikustomisasi harga jualnya oleh Reseller.

### B. Keamanan Saldo & Ledger System

- **Double-Entry Bookkeeping**: Setiap perubahan saldo wajib dicatat dalam tabel Mutasi (Debit/Kredit).
- **Atomic Transactions (ACID)**: Menjamin integritas data saldo saat terjadi kegagalan sistem.
- **Redis Rate Limiting**: Menggunakan Redis untuk membatasi percobaan spam transaksi atau brute-force PIN.
- **Secure PIN Authentication**: Verifikasi PIN 6-digit untuk setiap eksekusi transaksi digital.

### C. Fitur Admin (Control Panel)

- **Ringkasan Bisnis**: Grafik penjualan, keuntungan hari ini, dan total saldo di Digiflazz.
- **Manajemen Produk**: Sinkronisasi harga dari Digiflazz dengan fitur markup profit otomatis.
- **Manajemen User**: Tambah saldo manual, suspend user, atau ubah level (Member/Reseller).
- **Konfigurasi Sistem**: Pengaturan API Key Digiflazz, Payment Gateway, dan Maintenance Mode.
- **Monitoring Webhook**: Log pesan masuk dari Digiflazz untuk memantau status transaksi secara real-time.

## 2. Arsitektur Teknologi

- **Framework**: Next.js 15 (App Router) - Fullstack Framework.
- **PWA Push Notifications**: Mendukung notifikasi real-time ke HP user untuk info transaksi sukses, deposit masuk, atau promo.
- **Modern Responsive UI**: Desain mobile-first dengan tema **Clean & Minimalist**, menggunakan palet warna netral dan tipografi profesional.
- **Redis Caching**: Implementasi Redis (Upstash/ioredis) untuk caching daftar harga Digiflazz dan data statis lainnya agar load-time aplikasi super cepat (< 1 detik).
- **Smart Data Fetching**: Menggunakan TanStack Query untuk sinkronisasi status transaksi di background secara otomatis tanpa perlu refresh halaman.
- **Database**: PostgreSQL dengan Prisma ORM - Skema database terpusat yang dioptimalkan dengan index untuk performa query yang cepat.
- **Integrasi Utama**:
  - **Digiflazz API**: Procurement produk digital.
  - **Tripay / Midtrans**: Automasi deposit saldo.
- **Styling**: Tailwind CSS dengan **Clean & Minimalist Design System**.
  - Palet warna terbatas (Monochrome/Neutral dengan satu aksen warna brand).
  - Fokus pada tipografi yang kuat, whitespace yang luas, dan ikon garis tipis (minimalist).
  - Menghindari gradien warna yang ramai untuk menjaga kesan profesional dan ringan.

## 3. Protokol Keamanan (Security)

- **Signature Verification**: Validasi HMAC/Digital Signature pada setiap Webhook yang masuk dari Digiflazz & Payment Gateway.
- **IP Whitelisting**: Hanya mengizinkan akses ke endpoint callback dari alamat IP resmi partner.
- **Rate Limiting & Fraud Detection**: Proteksi terhadap serangan brute force PIN dan deteksi aktivitas transaksi yang mencurigakan.
- **Environment Encryption**: Penyimpanan API Key dan Secret Key menggunakan variabel lingkungan (ENV) yang aman.

## 4. Tahapan Pengerjaan

### Tahap 1: Setup & Database (Minggu 1)

- Inisialisasi Next.js & UI Components.
- Perancangan Skema Database (User, Product, Transaction, Deposit).

### Tahap 2: Integrasi Digiflazz (Minggu 1-2)

- Wrapper fungsi API Digiflazz.
- Sistem sinkronisasi produk & harga.
- Handle Webhook status transaksi.

### Tahap 3: Deposit & Keuangan (Minggu 2)

- Integrasi Payment Gateway.
- Logic penambahan/pengurangan saldo yang akurat.

### Tahap 4: Admin Panel & UI Polish (Minggu 3)

- Dashboard Admin untuk monitoring.
- Animasi UI dan optimasi mobile view.
