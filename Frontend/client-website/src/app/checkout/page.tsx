"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Breadcrumb,
  BreadcrumbSeparator,
  BreadcrumbLink,
  BreadcrumbItem,
  BreadcrumbList,
} from "@/components/ui/breadcrumb";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CreditCard, MapPin, Settings } from "lucide-react";
import { toast } from "sonner";

import { useCartStore } from "@/stores/cartStore";
import { useProductStore } from "@/stores/productStore";
import { useCouponStore } from "@/stores/couponStore";
import useAuthStore from "@/stores/useAuthStore";
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
  note?: string;
}

export default function CheckoutPage() {
  const router = useRouter();

  // Auth & addresses
  const {
    authUser,
    fetchAddresses, // <-- dùng để tải địa chỉ khi vào checkout
  } = useAuthStore();

  // Cart & products
  const {
    items,
    getCartSummary,
    clearCart,
    applyCoupon,
    removeCoupon,
    appliedCoupon,
  } = useCartStore();
  const { getProduct, fetchProducts } = useProductStore();

  // Coupons
  const { fetchCoupons, coupons } = useCouponStore();
  useEffect(() => {
    fetchCoupons();
  }, [fetchCoupons]);

  // Provinces/Wards
  const {
    provinces,
    wards,
    isLoadingProvinces,
    isLoadingWards,
    fetchProvinces,
    fetchWards,
    clearWards,
  } = useAddress();

  useEffect(() => {
    fetchProvinces();
  }, [fetchProvinces]);

  // Local UI state
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

  // === 1) Fetch addresses khi vào /checkout (nếu thiếu) ===
  useEffect(() => {
    if (!authUser?.id) return;
    const needFetch = !authUser.addresses || authUser.addresses.length === 0;
    if (needFetch) {
      fetchAddresses().catch((e) =>
        console.error("Failed to fetch addresses on checkout:", e)
      );
    }
  }, [authUser?.id, fetchAddresses, authUser?.addresses]);

  // === 2) Re-hydrate form khi danh sách địa chỉ cập nhật ===
  useEffect(() => {
    if (!authUser) {
      setIsNewAddress(true);
      return;
    }

    const defaultAddr =
      authUser.addresses?.find((a) => a.isDefault) || authUser.addresses?.[0];

    if (defaultAddr) {
      setSelectedAddressId(defaultAddr.id);
      setIsNewAddress(false);
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
      setSelectedAddressId(null);
      setFormData({
        fullName: authUser.fullName,
        phone: authUser.phone || "",
        address: "",
        ward: "",
        wardCode: "",
        province: "",
        provinceCode: "",
      });
      clearWards();
    }
  }, [authUser, authUser?.addresses, clearWards]);

  // Redirect nếu giỏ hàng trống
  useEffect(() => {
    if (items.length === 0) {
      toast.error("Giỏ hàng trống");
      router.push("/cart");
    }
  }, [items, router]);

  // Enrich cart items để render tóm tắt đơn hàng
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
      .filter((i): i is EnrichedCartItem => i !== null);
  }, [items, getProduct]);

  const summary = getCartSummary();

  // --- Handlers ---
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
      provinceCode,
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
      wardCode,
      ward: selectedWard?.name || "",
    }));
  };

  const handleAddressSelect = (addressId: number) => {
    setSelectedAddressId(addressId);
    setIsNewAddress(false);

    if (!authUser) return;
    const addr = authUser.addresses?.find((a) => a.id === addressId);
    if (addr) {
      setFormData({
        fullName: authUser.fullName,
        phone: authUser.phone || "",
        address: addr.line,
        ward: addr.ward || "",
        wardCode: "",
        province: addr.province || "",
        provinceCode: "",
      });
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

  const handleApplyCoupon = (code: string) => {
    const coupon = coupons.find((c) => c.code === code);
    if (!coupon) return;
    const ok = applyCoupon(coupon);
    if (ok) {
      setShowCouponList(false);
      toast.success(`Đã áp dụng mã: ${code}`);
    } else {
      toast.error("Không thể áp dụng mã này");
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
      const orderRequest = {
        paymentMethod,
        shippingAddress: {
          fullName: formData.fullName,
          phone: formData.phone,
          address: formData.address,
          ward: formData.ward,
          province: formData.province,
        },
      };

      const order = await useOrderStore
        .getState()
        .createOrder(authUser.id, orderRequest);
      toast.success(`Đặt hàng thành công! Mã đơn: ${order.code}`);

      await clearCart();
      await fetchProducts();
      // router.push(`/orders/${order.id}`) // nếu muốn điều hướng
    } catch (err) {
      const axiosError = err as AxiosError<{ message: string }>;
      const msg = axiosError?.response?.data?.message || "Lỗi khi tạo đơn hàng";
      toast.error(msg);
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (items.length === 0) return null;

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
          {/* Left: Shipping + Payment */}
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

            {/* Payment */}
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

          {/* Right: Order Summary */}
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
                  onToggleCouponList={() => setShowCouponList((v) => !v)}
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
