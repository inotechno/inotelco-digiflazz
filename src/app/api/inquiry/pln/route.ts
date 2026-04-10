import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { digiflazz } from "@/lib/digiflazz";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    let { customerNo } = await req.json();
    customerNo = customerNo?.toString().trim();

    if (!customerNo) {
      return NextResponse.json({ message: "Nomor pelanggan wajib diisi" }, { status: 400 });
    }

    // 1. Try Prepaid Inquiry first
    let result = await digiflazz.inquiryPLN(customerNo);
    console.log('Prepaid Inquiry PLN Result:', result);
    
    // 2. If Prepaid fails, try Postpaid Inquiry
    if (!result.data || result.data.rc !== '00') {
        // Force 'pln' as SKU for inquiry as requested by user
        const useSku = "pln"; 
        console.log('Attempting Postpaid Inquiry with forced SKU:', useSku);
        const refId = `INQ-PASCA-${Date.now()}`;
        const pascaResult = await digiflazz.inquiryPostpaid(useSku, customerNo, refId);
        console.log('Postpaid Inquiry Result:', pascaResult);
        
        if (pascaResult.data && pascaResult.data.rc === '00') {
            result = pascaResult;
        }
    }

    if (result.data && result.data.rc === '00') {
        return NextResponse.json({
            name: result.data.name || result.data.nama || result.data.customer_name || "Pelanggan PLN",
            customerNo: result.data.customer_no,
            raw: result.data
        });
    }

    // Friendly error for users
    let errorMsg = result.data?.message || result.message || "Gagal cek ID Pelanggan";
    
    // Convert technical Digiflazz errors to user-friendly ones
    if (errorMsg.includes("Signature") || errorMsg.includes("Test case")) {
        errorMsg = "ID Pelanggan tidak ditemukan atau tidak tersedia untuk saat ini.";
    }

    return NextResponse.json({ message: errorMsg }, { status: 400 });
  } catch (error: any) {
    console.error("PLN Inquiry API Error Details:", error.response?.data || error.message);
    return NextResponse.json({ message: error.response?.data?.data?.message || "Gagal menghubungkan ke server provider" }, { status: 500 });
  }
}
