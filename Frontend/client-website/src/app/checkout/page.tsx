"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Breadcrumb,
  BreadcrumbSeparator,
  BreadcrumbLink,
  BreadcrumbItem,
  BreadcrumbList,
} from "@/components/ui/breadcrumb";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, CreditCard, Settings } from "lucide-react";
import { useCartStore } from "@/stores/cartStore";
import Link from "next/link";
import { useProductStore } from "@/stores/productStore";
import { useCouponStore } from "@/stores/couponStore";
import useAuthStore from "@/stores/useAuthStore";
import { toast } from "sonner";
import { useAddress } from "@/hooks/useAddress";
import ShippingAddressForm from "@/components/checkout/ShippingAddressForm";
import PaymentMethodSelector from "@/components/checkout/PaymentMethodSelector";
import OrderSummary from "@/components/checkout/OrderSummary";
import { EnrichedCartItem } from "@/types/cart";
import { PaymentMethod, useOrderStore } from "@/stores/orderStore";
import { AxiosError } from "axios";
interface ShippingFormData {
  fullName: string;
  phone: string;
  address: string;
  ward: string;
  wardCode: string;
  province: string;
  provinceCode: string;
}
export default function CheckoutPage() {
  const router = useRouter();
  const { authUser } = useAuthStore();
  const {
    items,
    getCartSummary,
    clearCart,
    applyCoupon,
    removeCoupon,
    appliedCoupon,
  } = useCartStore();
  const { getProduct } = useProductStore();
  const { getActiveCoupons, fetchCoupons, coupons } = useCouponStore();

  useEffect(() => {
    fetchCoupons();
  }, [fetchCoupons]);

  const {
    provinces,
    wards,
    isLoadingProvinces,
    isLoadingWards,
    fetchWards,
    clearWards,
  } = useAddress();

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("COD");
  const [selectedAddressId, setSelectedAddressId] = useState<number | null>(
    null
  );
  const [isNewAddress, setIsNewAddress] = useState(false);
  const [showCouponList, setShowCouponList] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState<ShippingFormData>({
    fullName: "",
    phone: "",
    address: "",
    ward: "",
    wardCode: "",
    province: "",
    provinceCode: "",
  });

  // const activeCoupons = getActiveCoupons();
  const summary = getCartSummary();

  const enrichedItems: EnrichedCartItem[] = useMemo(() => {
    return items
      .map((item) => {
        const variant = item.variant;
        if (!variant) return null;

        const product = getProduct(variant.product?.id || variant.product_id);

        return {
          ...item,
          product,
          color: variant.color,
          size: variant.size,
        } as EnrichedCartItem;
      })
      .filter((item): item is EnrichedCartItem => item !== null);
  }, [items, getProduct]);

  useEffect(() => {
    if (authUser) {
      const defaultAddr =
        authUser.addresses?.find((addr) => addr.isDefault) ||
        authUser.addresses?.[0];

      if (defaultAddr) {
        setSelectedAddressId(defaultAddr.id);
        setFormData({
          fullName: authUser.fullName,
          phone: authUser.phone || "",
          address: defaultAddr.line,
          ward: defaultAddr.ward || "",
          wardCode: "",
          province: defaultAddr.province || "",
          provinceCode: "",
        });
      } else {
        setIsNewAddress(true);
        setFormData({
          fullName: authUser.fullName,
          phone: authUser.phone || "",
          address: "",
          ward: "",
          wardCode: "",
          province: "",
          provinceCode: "",
        });
      }
    } else {
      setIsNewAddress(true);
    }
  }, [authUser]);

  useEffect(() => {
    if (items.length === 0) {
      toast.error("Giỏ hàng trống");
      router.push("/cart");
    }
  }, [items, router]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleProvinceChange = (provinceCode: string) => {
    const selectedProvince = provinces.find((p) => p.code === provinceCode);
    setFormData((prev) => ({
      ...prev,
      provinceCode: provinceCode,
      province: selectedProvince?.name || "",
      wardCode: "",
      ward: "",
    }));
    fetchWards(provinceCode);
  };

  const handleWardChange = (wardCode: string) => {
    const selectedWard = wards.find((w) => w.code === wardCode);
    setFormData((prev) => ({
      ...prev,
      wardCode: wardCode,
      ward: selectedWard?.name || "",
    }));
  };

  const handleAddressSelect = (addressId: number) => {
    setSelectedAddressId(addressId);
    setIsNewAddress(false);

    if (authUser) {
      const selectedAddr = authUser.addresses?.find(
        (addr) => addr.id === addressId
      );
      if (selectedAddr) {
        setFormData({
          fullName: authUser.fullName,
          phone: authUser.phone || "",
          address: selectedAddr.line,
          ward: selectedAddr.ward || "",
          wardCode: "",
          province: selectedAddr.province || "",
          provinceCode: "",
        });
      }
    }
  };

  const handleNewAddress = () => {
    setIsNewAddress(true);
    setSelectedAddressId(null);
    setFormData({
      fullName: authUser?.fullName || "",
      phone: authUser?.phone || "",
      address: "",
      ward: "",
      wardCode: "",
      province: "",
      provinceCode: "",
    });
    clearWards();
  };

  const handleApplyCoupon = (couponCode: string) => {
    const coupon = coupons.find((c) => c.code === couponCode);
    if (coupon) {
      const success = applyCoupon(coupon);
      if (success) {
        setShowCouponList(false);
        toast.success(`Đã áp dụng mã giảm giá: ${couponCode}`);
      } else {
        toast.error("Không thể áp dụng mã giảm giá này");
      }
    }
  };

  const handleRemoveCoupon = () => {
    removeCoupon();
    toast.info("Đã hủy mã giảm giá");
  };
  const handleSubmitOrder = async () => {
    if (!authUser?.id) {
      toast.error("Vui lòng đăng nhập để đặt hàng");
      router.push("/user/login");
      return;
    }

    if (!formData.address || !formData.fullName || !formData.phone) {
      toast.error("Vui lòng điền đầy đủ thông tin giao hàng");
      return;
    }

    if (!formData.province || !formData.ward) {
      toast.error("Vui lòng chọn tỉnh/thành phố và xã/phường");
      return;
    }

    setIsSubmitting(true);

    try {
      // Create order request matching backend structure
      const orderRequest = {
        paymentMethod: paymentMethod,
        shippingAddress: {
          fullName: formData.fullName,
          phone: formData.phone,
          address: formData.address,
          ward: formData.ward,
          province: formData.province,
        },
      };

      console.log("Creating order:", orderRequest);

      // Call backend API
      const order = await useOrderStore
        .getState()
        .createOrder(authUser.id, orderRequest);

      console.log("Order created successfully:", order);
      toast.success(`Đặt hàng thành công! Mã đơn hàng: ${order.code}`);

      // Clear cart after successful order
      await clearCart();

      // Redirect to order detail or orders list
      router.push(`/user/orders`);
    } catch (error) {
      const axiosError = error as AxiosError<{ message: string }>;
      const errorMessage =
        axiosError?.response?.data?.message || "Lỗi khi tải danh sách danh mục";
    } finally {
      setIsSubmitting(false);
    }
  };

  if (items.length === 0) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto p-4 max-w-7xl">
        {/* Breadcrumb */}
        <div className="mb-6">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/">Trang chủ</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink href="/cart">Giỏ hàng</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink href="/checkout">Thanh toán</BreadcrumbLink>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>

        {/* Header */}
        <div className="flex items-center gap-2 mb-6">
          <CreditCard className="w-6 h-6" />
          <h1 className="text-xl md:text-2xl font-semibold">Thanh toán</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Shipping Address */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-primary" />
                    <CardTitle>Thông tin giao hàng</CardTitle>
                  </div>
                  {authUser && (
                    <Link href="/user/address">
                      <Button variant="outline" size="sm">
                        <Settings className="w-4 h-4 mr-2" />
                        Quản lý địa chỉ
                      </Button>
                    </Link>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <ShippingAddressForm
                  authUser={authUser}
                  formData={formData}
                  selectedAddressId={selectedAddressId}
                  isNewAddress={isNewAddress}
                  provinces={provinces}
                  wards={wards}
                  isLoadingProvinces={isLoadingProvinces}
                  isLoadingWards={isLoadingWards}
                  onInputChange={handleInputChange}
                  onProvinceChange={handleProvinceChange}
                  onWardChange={handleWardChange}
                  onAddressSelect={handleAddressSelect}
                  onNewAddress={handleNewAddress}
                />
              </CardContent>
            </Card>

            {/* Payment Method */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-primary" />
                  <CardTitle>Phương thức thanh toán</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <PaymentMethodSelector
                  paymentMethod={paymentMethod}
                  onPaymentMethodChange={setPaymentMethod}
                />
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Order Summary */}
          <div className="lg:col-span-1">
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle>Đơn hàng ({items.length} sản phẩm)</CardTitle>
              </CardHeader>
              <CardContent>
                <OrderSummary
                  items={enrichedItems}
                  summary={summary}
                  appliedCoupon={appliedCoupon}
                  activeCoupons={coupons}
                  showCouponList={showCouponList}
                  isSubmitting={isSubmitting}
                  onToggleCouponList={() => setShowCouponList(!showCouponList)}
                  onApplyCoupon={handleApplyCoupon}
                  onRemoveCoupon={handleRemoveCoupon}
                  onSubmitOrder={handleSubmitOrder}
                  onBackToCart={() => router.push("/cart")}
                />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
