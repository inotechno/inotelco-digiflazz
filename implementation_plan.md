# Implementation Plan: InoTelco (PPOB Premium)

InoTelco adalah platform PPOB modern dengan dukungan PWA, performa tinggi dengan Redis, dan desain Clean & Minimalist.

## 1. Fitur Utama (Full Features)

### A. Fitur User & Tiering (Member vs Reseller)
- **User Tiering System**: Member & Reseller dengan strategi harga berbeda.
- **Sistem Upgrade Level**: Upgrade ke Reseller otomatis atau via Admin.
- **PWA Push Notifications**: Real-time alerts untuk transaksi dan deposit.
- **Modern Responsive UI**: Desain **Clean & Minimalist** (Neutral colors, professional typography).
- **Secure Transaction**: Konfirmasi dengan PIN 6-digit.

### B. Keamanan Saldo & Ledger System
- **Double-Entry Bookkeeping**: Mutasi saldo (Debit/Kredit) mendetail.
- **Atomic Transactions (ACID)**: Integritas saldo terjamin saat sistem gagal.
- **Redis Rate Limiting**: Proteksi spam transaksi & brute-force PIN.

### C. Fitur Admin (Control Panel)
- **Dashboard Bisnis**: Monitoring profit & transaksi real-time.
- **Management Produk**: Markup harga otomatis per tier.

## 2. Arsitektur Teknologi
- **Next.js 15 (App Router)** & **Tailwind CSS**.
- **PostgreSQL + Prisma ORM**.
- **Upstash/Redis** (Caching & Rate Limiting).
- **TanStack Query** (Background Sync).
- **Next-PWA** (Installation & Offline support).

## 3. Protokol Keamanan
- **Signature Verification**: MD5/HMAC untuk Webhook Partner.
- **IP Whitelisting**: Hanya menerima callback dari IP resmi.
- **Environment Encryption**: Rahasia API aman di ENV.

---
> [!NOTE]
> Proyek sedang dalam tahap eksekusi.
