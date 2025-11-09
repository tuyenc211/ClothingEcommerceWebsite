import privateClient from "@/lib/axios";

export interface CreateVNPayPaymentRequest {
  amount: number;
  orderId: string;
}

export interface CreateVNPayPaymentResponse {
  paymentUrl: string;
}

export interface VNPayCallbackResponse {
  status: "success" | "error";
  message: string;
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
    console.error("Error creating VNPay payment:", error);
    throw error;
  }
};

/**
 * Handle VNPay callback from payment gateway
 * @param params - All VNPay callback parameters
 * @returns Response from backend after processing payment
 */
export const handleVNPayCallback = async (params: string): Promise<void> => {
  try {
    await privateClient.get("/payment/vn-pay-callback", {
      params: params,
    });
  } catch (error) {
    console.error("Error handling VNPay callback:", error);
    throw error;
  }
};

/**
 * Payment service for handling VNPay integration
 */
export const paymentService = {
  createVNPayPayment,
  handleVNPayCallback,
};
