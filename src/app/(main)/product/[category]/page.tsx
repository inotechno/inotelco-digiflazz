"use client";

import { useRouter } from "next/navigation";
import { use, useState, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { ArrowLeft, Loader2, Smartphone, Search, X, User } from "lucide-react";
import Link from "next/link";
import ProductCard from "@/components/dashboard/ProductCard";
import PinModal from "@/components/ui/PinModal";
import { toast } from "sonner";
import { formatRupiah } from "@/lib/utils";
import { getProviderByPrefix, getProviderLogo } from "@/lib/provider-detect";

export default function CategoryPage({ params }: { params: Promise<{ category: string }> }) {
  const { category } = use(params);
  const router = useRouter();
  const [customerNo, setCustomerNo] = useState("");
  const [selectedSku, setSelectedSku] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPin, setShowPin] = useState(false);
  const [activeBrand, setActiveBrand] = useState<string | null>(null);
  const [productSearch, setProductSearch] = useState("");
  const [inquiryName, setInquiryName] = useState<string | null>(null);
  const [inquiryLoading, setInquiryLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [hasMoved, setHasMoved] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  const provider = customerNo.length >= 4 ? getProviderByPrefix(customerNo.substring(0, 4)) : null;
  const providerLogo = provider ? getProviderLogo(provider) : null;

  const { data: products, isLoading } = useQuery({
    queryKey: ["products", category],
    queryFn: async () => {
      const res = await axios.get(`/api/products/${category}`);
      return res.data;
    },
  });

  const handleBuy = () => {
    if (!customerNo || customerNo.length < 10) {
      toast.error("Nomor tujuan tidak valid");
      return;
    }
    if (!selectedSku) {
      toast.error("Pilih produk terlebih dahulu");
      return;
    }
    setShowPin(true);
  };

  const onPinSuccess = async () => {
    setLoading(true);
    try {
      const res = await axios.post("/api/transactions/create", {
        sku: selectedSku,
        customerNo: customerNo,
      });

      toast.success(res.data.message);
      router.push("/history");
      router.refresh();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Gagal memproses transaksi");
    } finally {
      setLoading(false);
    }
  };

  const handleInquiry = async () => {
    if (!customerNo || customerNo.length < 10) return toast.error("Masukkan nomor tujuan");
    
    setInquiryLoading(true);
    setInquiryName(null);
    try {
      const res = await axios.post("/api/inquiry/pln", { customerNo });
      setInquiryName(res.data.name);
      toast.success("ID Pelanggan Ditemukan");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Gagal cek ID Pelanggan");
    } finally {
      setInquiryLoading(false);
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!scrollRef.current) return;
    setIsDragging(true);
    setHasMoved(false);
    setStartX(e.pageX - scrollRef.current.offsetLeft);
    setScrollLeft(scrollRef.current.scrollLeft);
  };

  const handleMouseLeave = () => setIsDragging(false);
  const handleMouseUp = () => {
    // Small delay to allow click event to capture the non-dragged state if needed
    setTimeout(() => setIsDragging(false), 50);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !scrollRef.current) return;
    
    const x = e.pageX - scrollRef.current.offsetLeft;
    const distance = Math.abs(x - startX);
    
    if (distance > 5) {
      setHasMoved(true);
      e.preventDefault();
      const walk = (x - startX) * 2;
      scrollRef.current.scrollLeft = scrollLeft - walk;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 -mx-6 -mt-6">
      {/* Header Section */}
      <div className="bg-white/95 backdrop-blur-xl px-6 pt-12 pb-6 sticky top-0 z-50 shadow-[0_10px_30px_-15px_rgba(0,0,0,0.05)]">
        <div className="flex items-center gap-4 mb-6">
          <Link href="/" className="p-2.5 bg-slate-50 rounded-2xl text-slate-500 hover:bg-slate-100 transition-colors">
            <ArrowLeft size={20} strokeWidth={2.5} />
          </Link>
          <h1 className="text-xl font-black text-slate-900 capitalize tracking-tight">
            Top Up <span className="text-primary">{category.replace("-", " ")}</span>
          </h1>
        </div>

        {/* Improved Input Section */}
        <div className="relative group">
          <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none text-slate-300 group-focus-within:text-primary transition-colors">
            {providerLogo ? (
                <img src={providerLogo} alt={provider || ""} className="w-8 h-8 object-contain rounded-lg" />
            ) : (
                <Smartphone size={18} strokeWidth={2.5} />
            )}
          </div>
          <input
            type="tel"
            placeholder="Masukkan Nomor Tujuan"
            value={customerNo}
            onChange={(e) => setCustomerNo(e.target.value)}
            className={`w-full ${providerLogo ? "pl-16" : "pl-13"} pr-12 py-5 bg-slate-50 border border-slate-100 rounded-[1.25rem] focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all text-lg font-black tracking-widest placeholder:text-slate-300 placeholder:font-normal placeholder:tracking-normal`}
          />
          {customerNo && (
            <div className="absolute inset-y-0 right-0 pr-4 flex items-center gap-2">
                <button 
                    onClick={() => {
                        setCustomerNo("");
                        setSelectedSku(null);
                        setInquiryName(null);
                    }}
                    className="p-1 px-2 text-slate-300 hover:text-slate-500"
                >
                    <X size={18} strokeWidth={3} />
                </button>
            </div>
          )}
        </div>

        {/* Inquiry Name Display */}
        {(inquiryName || (category.toLowerCase().includes('pln') && customerNo.length >= 10)) && (
            <div className={`mt-3 p-3 rounded-2xl flex items-center justify-between transition-all ${inquiryName ? "bg-emerald-50 border border-emerald-100" : "bg-slate-50 border border-slate-100"}`}>
                <div className="flex items-center gap-3">
                   <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${inquiryName ? "bg-emerald-500 text-white" : "bg-slate-200 text-slate-400"}`}>
                      <User size={14} />
                   </div>
                   <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Nama Pelanggan</p>
                      <p className={`text-xs font-black ${inquiryName ? "text-emerald-700" : "text-slate-400"}`}>
                         {inquiryLoading ? "Mengecek ID..." : (inquiryName || "Belum dicek")}
                      </p>
                   </div>
                </div>
                {category.toLowerCase().includes('pln') && !inquiryName && (
                    <button 
                        onClick={handleInquiry}
                        disabled={inquiryLoading}
                        className="px-4 py-1.5 bg-primary text-white text-[10px] font-black rounded-xl shadow-lg shadow-primary/20 active:scale-95 disabled:opacity-50"
                    >
                        CEK ID
                    </button>
                )}
            </div>
        )}
      </div>

      <div className="px-4 py-6">
        {/* Brand Tabs */}
        {!isLoading && products?.length > 0 && (
            <div className="mb-6">
                <div className="flex items-center justify-between mb-3 px-1">
                    <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Pilih Provider</h3>
                    {activeBrand && (
                        <button 
                            onClick={() => setActiveBrand(null)}
                            className="text-[10px] font-bold text-primary hover:underline"
                        >
                            Reset
                        </button>
                    )}
                </div>
                <div 
                    ref={scrollRef}
                    onMouseDown={handleMouseDown}
                    onMouseLeave={handleMouseLeave}
                    onMouseUp={handleMouseUp}
                    onMouseMove={handleMouseMove}
                    className="flex items-center gap-2 overflow-x-auto no-scrollbar -mx-4 px-4 pb-2 cursor-grab active:cursor-grabbing select-none"
                >
                    {Array.from(new Set(products.map((p: any) => p.brand))).map((brand: any) => (
                        <button
                            key={brand}
                            onClick={() => !hasMoved && setActiveBrand(brand === activeBrand ? null : brand)}
                            className={`px-5 py-2.5 rounded-2xl text-xs font-black whitespace-nowrap transition-all border shrink-0 ${hasMoved ? "pointer-events-none" : ""} ${
                                activeBrand === brand 
                                ? "bg-primary border-primary text-white shadow-lg shadow-primary/20" 
                                : "bg-white border-slate-100 text-slate-500"
                            }`}
                        >
                            {brand}
                        </button>
                    ))}
                </div>
            </div>
        )}

        {/* Local Search */}
        {!isLoading && (
            <div className="relative mb-6">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={14} />
                <input 
                    type="text"
                    placeholder="Cari nominal atau nama produk..."
                    value={productSearch}
                    onChange={(e) => setProductSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-white border border-slate-100 rounded-2xl text-xs font-bold outline-none focus:border-primary transition-all shadow-sm"
                />
            </div>
        )}

        {/* Helper Text */}
        {!isLoading && products?.length > 0 && (
            <div className="flex items-center justify-between mb-4 px-1">
                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Pilihan Produk</h3>
                <span className="text-[10px] font-bold text-slate-300">
                    {products.filter((p: any) => {
                        const matchesBrand = activeBrand ? p.brand === activeBrand : (provider && provider !== "UNKNOWN" ? (p.brand.toUpperCase() === provider || p.brand.toUpperCase().includes(provider)) : true);
                        const matchesSearch = p.name.toLowerCase().includes(productSearch.toLowerCase());
                        return matchesBrand && matchesSearch;
                    }).length} Tersedia
                </span>
            </div>
        )}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 text-slate-400">
          <Loader2 className="animate-spin mb-2" size={32} />
          <p className="text-sm font-medium">Mencari harga terbaik...</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 pb-32">
          {products
            ?.filter((p: any) => {
                const matchesBrand = activeBrand ? p.brand === activeBrand : (provider && provider !== "UNKNOWN" ? (p.brand.toUpperCase() === provider || p.brand.toUpperCase().includes(provider)) : true);
                const matchesSearch = p.name.toLowerCase().includes(productSearch.toLowerCase());
                return matchesBrand && matchesSearch;
            })
            .map((product: any) => (
            <ProductCard
              key={product.sku}
              sku={product.sku}
              name={product.name}
              price={product.price}
              isSelected={selectedSku === product.sku}
              isAvailable={product.buyer_product_status}
              onClick={() => setSelectedSku(product.sku)}
            />
          ))}
        </div>
      )}

      {/* Floating Checkout Card */}
      {selectedSku && (
        <div className="fixed bottom-20 left-4 right-4 z-[60] max-w-lg mx-auto bg-white/95 backdrop-blur-2xl border border-slate-100 p-5 rounded-[2.5rem] flex items-center justify-between gap-6 animate-in fade-in slide-in-from-bottom-10 duration-500 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.15)] ring-1 ring-black/[0.03]">
          <div className="flex-1 min-w-0 pl-2">
             <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Total Pembayaran</p>
             <p className="text-2xl font-black text-slate-900 truncate tracking-tight">
                {formatRupiah(products?.find((p: any) => p.sku === selectedSku)?.price || 0)}
             </p>
          </div>
          <button
            onClick={handleBuy}
            className="px-8 py-4 bg-slate-900 text-white rounded-[1.75rem] font-black shadow-xl shadow-slate-900/20 active:scale-95 transition-all flex items-center justify-center gap-2 group"
          >
            <span>Lanjutkan</span>
            <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center group-hover:translate-x-1 transition-transform">
               <ArrowLeft size={14} className="rotate-180" />
            </div>
          </button>
        </div>
      )}

      </div>

      <PinModal 
        isOpen={showPin} 
        onClose={() => setShowPin(false)} 
        onSuccess={onPinSuccess} 
      />
    </div>
  );
}
