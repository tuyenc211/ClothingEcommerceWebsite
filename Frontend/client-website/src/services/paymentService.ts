import privateClient from "@/lib/axios";

export interface CreateVNPayPaymentRequest {
  amount: number;
  orderId: string;
}

export interface CreateVNPayPaymentResponse {
  paymentUrl: string;
}

/**
 * Create VNPay payment URL
 * @param amount - Payment amount in VND
 * @param orderId - Order ID to associate with payment
 * @returns Payment URL to redirect user to VNPay gateway
 */
export const createVNPayPayment = async (
  amount: number,
  orderId: string
): Promise<string> => {
  try {
    const response = await privateClient.post<CreateVNPayPaymentResponse>(
      "/payment/create",
      null,
      {
        params: {
          amount,
          orderId,
        },
      }
    );
    return response.data.paymentUrl;
  } catch (error) {
    throw error;
  }
};

/**
 * Payment service for handling VNPay integration
 */
export const paymentService = {
  createVNPayPayment,
};
