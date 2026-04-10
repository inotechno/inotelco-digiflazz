import axios from "axios";
import crypto from "crypto";
import prisma from "./prisma";

class TripayService {
  private async getConfigs() {
    const configs = await prisma.config.findMany({
      where: { key: { in: ["TRIPAY_API_KEY", "TRIPAY_PRIVATE_KEY", "TRIPAY_MERCHANT_CODE", "TRIPAY_MODE"] } }
    });
    
    return configs.reduce((acc: any, curr) => {
      acc[curr.key] = curr.value;
      return acc;
    }, {});
  }

  async createTransaction(payload: {
    method: string;
    amount: number;
    merchant_ref: string;
    customer_name: string;
    customer_email: string;
  }) {
    const config = await this.getConfigs();
    const { TRIPAY_API_KEY, TRIPAY_PRIVATE_KEY, TRIPAY_MERCHANT_CODE, TRIPAY_MODE } = config;

    if (!TRIPAY_API_KEY) throw new Error("TriPay API Key belum diatur di Admin Panel");

    const baseUrl = TRIPAY_MODE === "production" 
      ? "https://tripay.co.id/api/transaction/create" 
      : "https://tripay.co.id/api-sandbox/transaction/create";

    const signature = crypto
      .createHmac("sha256", TRIPAY_PRIVATE_KEY)
      .update(TRIPAY_MERCHANT_CODE + payload.merchant_ref + payload.amount)
      .digest("hex");

    try {
      const response = await axios.post(
        baseUrl,
        {
          method: payload.method,
          merchant_ref: payload.merchant_ref,
          amount: payload.amount,
          customer_name: payload.customer_name,
          customer_email: payload.customer_email,
          order_items: [
            {
              name: "Deposit Saldo InoTelco",
              price: payload.amount,
              quantity: 1,
            },
          ],
          signature: signature,
        },
        {
          headers: { Authorization: `Bearer ${TRIPAY_API_KEY}` },
        }
      );

      return response.data;
    } catch (error: any) {
      console.error("TriPay Create Error:", error.response?.data || error.message);
      throw error;
    }
  }
}

export const tripay = new TripayService();
