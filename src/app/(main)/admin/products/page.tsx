"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { 
  Package, Search, Filter, RefreshCw, 
  CheckCircle2, XCircle, ArrowLeft, Loader2,
  Edit3, Power, Tag, Save
} from "lucide-react";
import Link from "next/link";
import { formatRupiah } from "@/lib/utils";
import { useState } from "react";
import { toast } from "sonner";

export default function AdminProductsPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [selectedSkus, setSelectedSkus] = useState<string[]>([]);
  
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [manualMarkup, setManualMarkup] = useState({ member: "", reseller: "" });

  const { data: categories } = useQuery({
    queryKey: ["admin-categories"],
    queryFn: async () => {
      const res = await axios.get("/api/admin/products/categories");
      return res.data;
    },
  });

  const { data: products, isLoading } = useQuery({
    queryKey: ["admin-products", search, filterCategory],
    queryFn: async () => {
      const res = await axios.get("/api/admin/products", {
        params: { search, category: filterCategory },
      });
      return res.data;
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await axios.patch("/api/admin/products", data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-products"] });
      toast.success("Produk diperbarui");
      setEditingProduct(null);
    },
    onError: () => toast.error("Gagal memperbarui produk")
  });

  const syncMutation = useMutation({
    mutationFn: async () => {
      const res = await axios.post("/api/admin/sync-products");
      return res.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["admin-products"] });
      toast.success(`Sinkronisasi ${data.count} produk berhasil`);
    },
  });

  const bulkStatusMutation = useMutation({
    mutationFn: async (status: boolean) => {
      const res = await axios.patch("/api/admin/products", { skus: selectedSkus, seller_product_status: status });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-products"] });
      setSelectedSkus([]);
      toast.success("Bulk update berhasil");
    },
  });

  const handleOpenEdit = (product: any) => {
    setEditingProduct(product);
    setManualMarkup({ 
        member: product.markup_member?.toString() || "", 
        reseller: product.markup_reseller?.toString() || "" 
    });
  };

  const handleSaveMarkup = () => {
    updateMutation.mutate({
        sku: editingProduct.sku,
        markup_member: manualMarkup.member === "" ? null : Number(manualMarkup.member),
        markup_reseller: manualMarkup.reseller === "" ? null : Number(manualMarkup.reseller)
    });
  };

  const toggleSelectAll = () => {
    if (selectedSkus.length === products?.length) {
      setSelectedSkus([]);
    } else {
      setSelectedSkus(products?.map((p: any) => p.sku) || []);
    }
  };

  const toggleSelect = (sku: string) => {
    setSelectedSkus(prev => 
      prev.includes(sku) ? prev.filter(s => s !== sku) : [...prev, sku]
    );
  };

  return (
    <div className="space-y-6 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
            <button onClick={() => window.history.back()} className="p-2 bg-white rounded-xl shadow-sm border border-slate-100 text-slate-400">
                <ArrowLeft size={20} />
            </button>
            <div>
                <h1 className="text-2xl font-black text-slate-900">Unit <span className="text-primary">Produk</span></h1>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Pricing & Status Management</p>
            </div>
        </div>
        
        <button 
            onClick={() => syncMutation.mutate()}
            disabled={syncMutation.isPending}
            className="flex items-center justify-center gap-2 bg-slate-900 text-white px-6 py-3 rounded-2xl font-black text-sm shadow-xl shadow-slate-200 hover:scale-105 transition-transform disabled:opacity-50"
        >
            {syncMutation.isPending ? <Loader2 className="animate-spin" size={18} /> : <RefreshCw size={18} />}
            Sync Digiflazz
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="relative group col-span-2">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-primary transition-colors" size={18} />
            <input 
                type="text"
                placeholder="Cari SKU atau Nama Produk..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-white border border-slate-100 rounded-2xl outline-none focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all text-sm font-bold"
            />
        </div>
        <div className="relative">
            <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
            <select 
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-white border border-slate-100 rounded-2xl outline-none focus:border-primary text-sm font-bold appearance-none cursor-pointer"
            >
                <option value="">Semua Kategori</option>
                {categories?.map((cat: string) => (
                    <option key={cat} value={cat}>{cat}</option>
                ))}
            </select>
        </div>
      </div>

      <div className="flex items-center justify-between px-2">
            <div className="flex items-center gap-2">
                <input 
                    type="checkbox" 
                    checked={products?.length > 0 && selectedSkus.length === products?.length}
                    onChange={toggleSelectAll}
                    className="w-4 h-4 rounded border-slate-300 text-primary focus:ring-primary"
                />
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Pilih Semua</span>
            </div>
            <span className="text-[10px] font-bold text-slate-300">{products?.length || 0} Produk</span>
      </div>

      {isLoading ? (
          <div className="py-20 text-center">
              <Loader2 className="animate-spin text-primary mx-auto mb-4" size={32} />
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Menarik Data...</p>
          </div>
      ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {products?.map((product: any) => (
                  <div 
                      key={product.sku} 
                      onClick={() => toggleSelect(product.sku)}
                      className={`relative p-5 rounded-[2rem] border transition-all hover:shadow-xl hover:shadow-slate-100 flex flex-col justify-between bg-white cursor-pointer ${
                          selectedSkus.includes(product.sku) ? "border-primary ring-1 ring-primary" : "border-slate-100"
                      }`}
                  >
                        <div className="flex justify-between items-start mb-4">
                             <div className="flex items-center gap-2">
                                <div className={`w-3 h-3 rounded-full ${product.seller_product_status ? "bg-emerald-500" : "bg-rose-500"}`} />
                                <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">{product.category}</span>
                             </div>
                             <button 
                                onClick={(e) => { e.stopPropagation(); handleOpenEdit(product); }}
                                className="p-2 hover:bg-slate-50 rounded-xl text-slate-400 transition-colors"
                             >
                                <Edit3 size={16} />
                             </button>
                        </div>

                        <div className="mb-6">
                            <h3 className="text-sm font-black text-slate-900 leading-tight mb-1">{product.name}</h3>
                            <p className="text-[10px] text-slate-400 font-mono font-bold tracking-tight">{product.sku}</p>
                        </div>

                        <div className="grid grid-cols-3 gap-2 p-1.5 bg-slate-50/50 rounded-2xl border border-slate-50">
                            <div className="text-center">
                                <p className="text-[8px] font-black text-slate-400 uppercase mb-0.5">Modal</p>
                                <p className="text-[10px] font-bold text-slate-500">{formatRupiah(product.price)}</p>
                            </div>
                            <div className="text-center border-x border-slate-100">
                                <p className="text-[8px] font-black text-primary uppercase mb-0.5">Member</p>
                                <p className="text-[10px] font-black text-primary">{formatRupiah(product.price_member)}</p>
                            </div>
                            <div className="text-center">
                                <p className="text-[8px] font-black text-emerald-600 uppercase mb-0.5">Reseller</p>
                                <p className="text-[10px] font-black text-emerald-700">{formatRupiah(product.price_reseller)}</p>
                            </div>
                        </div>

                        {product.markup_details?.is_manual && (
                            <div className="mt-3 flex items-center gap-1.5 px-2 py-1 bg-primary/10 text-primary rounded-lg self-start">
                                <Tag size={10} strokeWidth={3} />
                                <span className="text-[7px] font-black uppercase tracking-widest">Manual Setup</span>
                            </div>
                        )}
                  </div>
              ))}
          </div>
      )}

      {selectedSkus.length > 0 && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 bg-slate-900 text-white px-6 py-4 rounded-3xl shadow-2xl flex items-center gap-6 z-50">
            <div className="flex flex-col">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Terpilih</span>
                <span className="text-sm font-bold">{selectedSkus.length} Produk</span>
            </div>
            <div className="h-8 w-px bg-slate-800" />
            <div className="flex items-center gap-2">
                <button 
                  onClick={() => bulkStatusMutation.mutate(true)}
                  disabled={bulkStatusMutation.isPending}
                  className="px-4 py-2 bg-emerald-500 text-white rounded-xl text-xs font-black"
                >
                    Aktifkan
                </button>
                <button 
                  onClick={() => bulkStatusMutation.mutate(false)}
                  disabled={bulkStatusMutation.isPending}
                  className="px-4 py-2 bg-rose-500 text-white rounded-xl text-xs font-black"
                >
                    Matikan
                </button>
                <button onClick={() => setSelectedSkus([])} className="p-2 hover:bg-slate-800 rounded-xl">
                    <XCircle size={18} />
                </button>
            </div>
        </div>
      )}

      {editingProduct && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
              <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setEditingProduct(null)} />
              <div className="relative w-full max-w-sm bg-white rounded-[2.5rem] p-8 shadow-2xl">
                  <div className="flex justify-between items-start mb-6">
                      <div>
                          <h3 className="text-xl font-black text-slate-900">Atur <span className="text-primary">Markup</span></h3>
                          <p className="text-xs text-slate-400 font-medium">{editingProduct.name}</p>
                      </div>
                      <button onClick={() => setEditingProduct(null)} className="p-2 text-slate-300 hover:text-slate-600"><XCircle size={24} /></button>
                  </div>

                  <div className="space-y-6 mb-8">
                        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Harga Modal (Ori)</p>
                            <p className="text-lg font-black text-slate-900">{formatRupiah(editingProduct.price)}</p>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Markup Member</label>
                                <input 
                                    type="number"
                                    value={manualMarkup.member}
                                    onChange={(e) => setManualMarkup({...manualMarkup, member: e.target.value})}
                                    placeholder="Auto"
                                    className="w-full px-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:bg-white focus:border-primary outline-none text-sm font-bold"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Markup Reseller</label>
                                <input 
                                    type="number"
                                    value={manualMarkup.reseller}
                                    onChange={(e) => setManualMarkup({...manualMarkup, reseller: e.target.value})}
                                    placeholder="Auto"
                                    className="w-full px-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:bg-white focus:border-primary outline-none text-sm font-bold"
                                />
                            </div>
                        </div>
                        <p className="text-[9px] text-slate-400 italic text-center px-4">
                            * Kosongkan untuk menggunakan aturan global ({editingProduct.markup_details.mode})
                        </p>
                  </div>

                  <button 
                    onClick={handleSaveMarkup}
                    disabled={updateMutation.isPending}
                    className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black shadow-xl flex items-center justify-center gap-2"
                  >
                    {updateMutation.isPending ? <Loader2 className="animate-spin" /> : <Save size={18} />}
                    Simpan Perubahan
                  </button>
              </div>
          </div>
      )}
    </div>
  );
}
