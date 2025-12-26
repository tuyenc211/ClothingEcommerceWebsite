"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  Breadcrumb,
  BreadcrumbSeparator,
  BreadcrumbItem,
  BreadcrumbList,
} from "@/components/ui/breadcrumb";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CreditCard, MapPin, Settings } from "lucide-react";
import { toast } from "sonner";
import { useCartQuery } from "@/services/cartService";
import { useCartStore } from "@/stores/cartStore";
import { useProductStore } from "@/stores/productStore";
import useAuthStore from "@/stores/useAuthStore";
import { useAddress } from "@/hooks/useAddress";

import ShippingAddressForm from "@/app/checkout/_components/ShippingAddressForm";
import PaymentMethodSelector from "@/app/checkout/_components/PaymentMethodSelector";
import OrderSummary from "@/app/checkout/_components/OrderSummary";

import { EnrichedCartItem } from "@/types/cart";
import { PaymentMethod } from "@/services/orderService";
import { AxiosError } from "axios";
import { createVNPayPayment } from "@/services/paymentService";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import { useCreateOrder } from "@/services/orderService";
import { Coupon, useAvailableCoupons } from "@/services/couponService";
import { useProductsQuery } from "@/services/productService";
<<<<<<< HEAD
import { useForm, FormProvider, SubmitHandler } from "react-hook-form";

export interface ShippingFormData {
=======

interface ShippingFormData {
>>>>>>> 92c514853ae7da003171660fc573c9d5312c180c
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
  const searchParams = useSearchParams();
  const { authUser, fetchAddresses } = useAuthStore();
  const { data: items = [], isLoading: isLoadingCart } = useCartQuery();
  const { mutate: createOrder, data: order } = useCreateOrder();
  const { getCartSummary, clearCart } = useCartStore();
  const { fetchProducts } = useProductStore();
  const { data: products } = useProductsQuery();

<<<<<<< HEAD
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const baseSummary = getCartSummary();
  const { data: availableCoupons }: { data: Coupon[] | undefined } =
    useAvailableCoupons(authUser?.id, baseSummary.subtotal);
  const summary = useMemo(() => {
    if (appliedCoupon && appliedCoupon.isActive) {
      const subtotal = baseSummary.subtotal;
      let discount = 0;
      discount = (subtotal * appliedCoupon.value) / 100;
      if (discount > subtotal) {
        discount = subtotal;
      }
=======
  // Local state for coupon
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);

  // Calculate summary locally to include coupon discount
  const summary = useMemo(() => {
    const baseSummary = getCartSummary();

    // Recalculate if there's a coupon
    if (appliedCoupon && appliedCoupon.isActive) {
      const subtotal = baseSummary.subtotal;
      let discount = 0;

      const now = new Date();
      const startsAt = appliedCoupon.startsAt
        ? new Date(appliedCoupon.startsAt)
        : null;
      const endsAt = appliedCoupon.endsAt
        ? new Date(appliedCoupon.endsAt)
        : null;

      const isWithinDateRange =
        (!startsAt || now >= startsAt) && (!endsAt || now <= endsAt);
      const meetsMinTotal =
        !appliedCoupon.minOrderTotal || subtotal >= appliedCoupon.minOrderTotal;

      if (isWithinDateRange && meetsMinTotal) {
        // Percentage discount calculation
        discount = (subtotal * appliedCoupon.value) / 100;

        // Cap discount at subtotal
        if (discount > subtotal) {
          discount = subtotal;
        }
      }

>>>>>>> 92c514853ae7da003171660fc573c9d5312c180c
      const subtotalAfterDiscount = subtotal - discount;
      const total = subtotalAfterDiscount + baseSummary.shippingFee;

      return {
        ...baseSummary,
        discount,
        total,
      };
    }

    return baseSummary;
<<<<<<< HEAD
  }, [baseSummary, appliedCoupon]);

=======
  }, [getCartSummary, appliedCoupon]);

  const { data: availableCoupons }: { data: Coupon[] | undefined } =
    useAvailableCoupons(authUser?.id, summary.subtotal);
>>>>>>> 92c514853ae7da003171660fc573c9d5312c180c
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

  useEffect(() => {
    const loadAddresses = async () => {
      if (authUser?.id) {
        console.log("🔍 Fetching addresses for user:", authUser.id);
        setIsLoadingAddresses(true);
        try {
          await fetchAddresses();
        } catch (error) {
          console.error("Error fetching addresses:", error);
        } finally {
          setIsLoadingAddresses(false);
        }
      }
    };

    loadAddresses();
  }, [authUser?.id, fetchAddresses]);

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("COD");
  const [selectedAddressId, setSelectedAddressId] = useState<number | null>(
    null
  );
  const [isNewAddress, setIsNewAddress] = useState(false);
  const [showCouponList, setShowCouponList] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingAddresses, setIsLoadingAddresses] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
<<<<<<< HEAD
  const isCheckingOutRef = useRef(false);

  const methods = useForm<ShippingFormData>({
    defaultValues: {
      fullName: "",
      phone: "",
      address: "",
      ward: "",
      wardCode: "",
      province: "",
      provinceCode: "",
    },
  });
  const { handleSubmit, reset, setValue } = methods;
=======

  // Ref để track xem có đang thanh toán không (dùng trong cleanup)
  const isCheckingOutRef = useRef(false);
  const [formData, setFormData] = useState<ShippingFormData>({
    fullName: "",
    phone: "",
    address: "",
    ward: "",
    wardCode: "",
    province: "",
    provinceCode: "",
  });

>>>>>>> 92c514853ae7da003171660fc573c9d5312c180c
  const enrichedItems: EnrichedCartItem[] = useMemo(() => {
    return items
      .map((item) => {
        const variant = item.variant;
        if (!variant) return null;

        const product = products?.find(
          (product) => product.id === variant.product?.id || variant.product_id
        );

        return {
          ...item,
          product,
          color: variant.color,
          size: variant.size,
        } as EnrichedCartItem;
      })
      .filter((item): item is EnrichedCartItem => item !== null);
  }, [items]);

  useEffect(() => {
    if (authUser) {
      const defaultAddr =
        authUser.addresses?.find((addr) => addr.isDefault) ||
        authUser.addresses?.[0];

      if (defaultAddr) {
        setSelectedAddressId(defaultAddr.id);
        setIsNewAddress(false);
<<<<<<< HEAD
        reset({
=======
        setFormData({
>>>>>>> 92c514853ae7da003171660fc573c9d5312c180c
          fullName: authUser.fullName,
          phone: authUser.phone || "",
          address: defaultAddr.line,
          ward: defaultAddr.ward || "",
          wardCode: "",
          province: defaultAddr.province || "",
          provinceCode: "",
        });
      } else {
        if (!isLoadingAddresses) {
          setIsNewAddress(true);
        }
<<<<<<< HEAD
        reset({
=======
        setFormData({
>>>>>>> 92c514853ae7da003171660fc573c9d5312c180c
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
<<<<<<< HEAD
  }, [authUser, authUser?.addresses, isLoadingAddresses, reset]);

=======
  }, [authUser, authUser?.addresses, isLoadingAddresses]);
>>>>>>> 92c514853ae7da003171660fc573c9d5312c180c
  useEffect(() => {
    isCheckingOutRef.current = isSubmitting || isProcessingPayment;
  }, [isSubmitting, isProcessingPayment]);

  // Handle VNPay payment callback
  useEffect(() => {
    const paymentStatus = searchParams?.get("status");

    if (paymentStatus === "success") {
      setIsProcessingPayment(true);
      toast.success(
        "Thanh toán VNPay thành công! Đơn hàng của bạn đã được xác nhận."
      );
      // Redirect to orders page after 2 seconds
      setTimeout(() => {
        router.push("/user/orders");
      }, 2000);
    } else if (paymentStatus === "fail") {
      toast.error(
        "Thanh toán VNPay thất bại. Vui lòng thử lại hoặc chọn phương thức khác."
      );
      // Remove status from URL to allow user to retry
      const newUrl = window.location.pathname;
      window.history.replaceState({}, "", newUrl);
    }
  }, [searchParams, router]);

<<<<<<< HEAD
  const handleProvinceChange = (provinceCode: string) => {
    const selectedProvince = provinces.find((p) => p.code === provinceCode);
    setValue("provinceCode", provinceCode);
    setValue("province", selectedProvince?.name || "", {
      shouldValidate: true,
    });
    setValue("wardCode", "");
    setValue("ward", "", { shouldValidate: true });
=======
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
>>>>>>> 92c514853ae7da003171660fc573c9d5312c180c
    fetchWards(provinceCode);
  };

  const handleWardChange = (wardCode: string) => {
    const selectedWard = wards.find((w) => w.code === wardCode);
<<<<<<< HEAD
    setValue("wardCode", wardCode);
    setValue("ward", selectedWard?.name || "", { shouldValidate: true });
=======
    setFormData((prev) => ({
      ...prev,
      wardCode: wardCode,
      ward: selectedWard?.name || "",
    }));
>>>>>>> 92c514853ae7da003171660fc573c9d5312c180c
  };

  const handleAddressSelect = (addressId: number) => {
    setSelectedAddressId(addressId);
    setIsNewAddress(false);

    if (authUser) {
      const selectedAddr = authUser.addresses?.find(
        (addr) => addr.id === addressId
      );
      if (selectedAddr) {
<<<<<<< HEAD
        reset({
=======
        setFormData({
>>>>>>> 92c514853ae7da003171660fc573c9d5312c180c
          fullName: authUser.fullName,
          phone: authUser.phone || "",
          address: selectedAddr.line,
          ward: selectedAddr.ward || "",
          wardCode: "",
          province: selectedAddr.province || "",
          provinceCode: "",
        });
<<<<<<< HEAD
        clearWards();
=======
>>>>>>> 92c514853ae7da003171660fc573c9d5312c180c
      }
    }
  };

  const handleNewAddress = () => {
    setIsNewAddress(true);
    setSelectedAddressId(null);
<<<<<<< HEAD
    reset({
=======
    setFormData({
>>>>>>> 92c514853ae7da003171660fc573c9d5312c180c
      fullName: authUser?.fullName || "",
      phone: authUser?.phone || "",
      address: "",
      ward: "",
      wardCode: "",
      province: "",
      provinceCode: "",
    });
<<<<<<< HEAD
=======
    clearWards();
>>>>>>> 92c514853ae7da003171660fc573c9d5312c180c
  };

  const handleApplyCoupon = (couponCode: string) => {
    const coupon = availableCoupons?.find((c) => c.code === couponCode);

    if (!coupon) {
      toast.error("Mã giảm giá không tồn tại");
      return;
    }

    setAppliedCoupon(coupon);
    setShowCouponList(false);
    toast.success(`Đã áp dụng mã giảm giá: ${couponCode}`);
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
  };
<<<<<<< HEAD

  const onSubmitOrder: SubmitHandler<ShippingFormData> = async (formData) => {
=======
  const validatePhone = (phone: string): boolean => {
    // Phone VN: 10 số, bắt đầu bằng 0
    const phoneRegex = /^(0[3|5|7|8|9])+([0-9]{8})$/;
    return phoneRegex.test(phone);
  };
  const handleSubmitOrder = async () => {
>>>>>>> 92c514853ae7da003171660fc573c9d5312c180c
    if (!authUser?.id) {
      toast.error("Vui lòng đăng nhập để đặt hàng");
      router.push("/user/login");
      return;
    }
<<<<<<< HEAD
    setIsSubmitting(true);

    try {
=======

    if (!formData.address || !formData.fullName || !formData.phone) {
      toast.error("Vui lòng điền đầy đủ thông tin giao hàng");
      return;
    }
    if (!validatePhone(formData.phone)) {
      toast.error("Số điện thoại không hợp lệ");
      return;
    }
    if (!formData.province || !formData.ward) {
      toast.error("Vui lòng chọn tỉnh/thành phố và xã/phường");
      return;
    }

    setIsSubmitting(true);

    try {
      // Create order request matching backend structure
>>>>>>> 92c514853ae7da003171660fc573c9d5312c180c
      const orderRequest = {
        paymentMethod: paymentMethod,
        shippingAddress: {
          fullName: formData.fullName,
          phone: formData.phone,
          address: formData.address,
          ward: formData.ward,
          province: formData.province,
        },
        couponCode: appliedCoupon?.code,
      };
      // @ts-ignore
      createOrder(authUser.id, orderRequest);

      // Handle payment method
      if (paymentMethod === "WALLET") {
        // VNPay payment - redirect to payment gateway
        try {
          toast.info("Đang chuyển đến trang thanh toán VNPay...");

          const paymentUrl = await createVNPayPayment(
            // @ts-ignore
            order.grandTotal,
            // @ts-ignore
            order.id.toString()
          );
          await clearCart();
          setAppliedCoupon(null);
          await fetchProducts();

          // Redirect to VNPay payment gateway
          window.location.href = paymentUrl;
        } catch (paymentError) {
          toast.error("Không thể tạo thanh toán VNPay. Vui lòng thử lại.");
        }
      } else {
        // @ts-ignore
        toast.success(`Đặt hàng thành công! Mã đơn hàng: ${order.code}`);
        // @ts-ignore
        router.push(`/user/orders/${order.id}`);
        clearCart();
        setAppliedCoupon(null);
        fetchProducts();
      }
    } catch (error) {
      const axiosError = error as AxiosError<{ message: string }>;
      const errorMessage =
        axiosError?.response?.data?.message ||
        "Lỗi khi đặt hàng. Vui lòng thử lại.";
      console.error("Order creation error:", errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Show processing payment screen when returning from VNPay
  if (isProcessingPayment) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-green-200 border-t-green-600 rounded-full animate-spin mx-auto mb-4"></div>
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">
            Thanh toán thành công!
          </h2>
          <p className="text-gray-600">
            Đang chuyển đến trang đơn hàng của bạn...
          </p>
        </div>
      </div>
    );
  }
  if (isLoadingCart) {
    return <LoadingSpinner />;
  }
  if (items.length === 0 && !searchParams?.get("status")) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white">
        <div className="flex flex-col items-center space-y-4">
          <div className="relative">
            {/* Empty Cart Icon */}
            <div className="w-16 h-16 text-gray-300">
              <MapPin className="w-16 h-16" />
            </div>
          </div>
          <p className="text-gray-600 text-lg font-medium">Giỏ hàng trống</p>
          <Button asChild onClick={() => router.push("/")}>
            <Link href="/">Tiếp tục mua sắm</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto p-4 max-w-7xl">
        {/* Breadcrumb */}
        <div className="mb-6">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <Link href="/">Trang chủ</Link>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <Link href="/cart">Giỏ hàng</Link>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <Link href="/checkout">Thanh toán</Link>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>

        {/* Header */}
        <div className="flex items-center gap-2 mb-6">
          <CreditCard className="w-6 h-6" />
          <h1 className="text-xl md:text-2xl font-semibold">Thanh toán</h1>
        </div>

<<<<<<< HEAD
        <FormProvider {...methods}>
          <form onSubmit={handleSubmit(onSubmitOrder)}>
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
                    {isLoadingAddresses ? (
                      <div className="flex items-center justify-center py-8">
                        <div className="flex flex-col items-center space-y-3">
                          <div className="w-8 h-8 border-4 border-gray-200 border-t-gray-800 rounded-full animate-spin"></div>
                          <p className="text-sm text-gray-600">
                            Đang tải địa chỉ...
                          </p>
                        </div>
                      </div>
                    ) : (
                      <ShippingAddressForm
                        authUser={authUser}
                        selectedAddressId={selectedAddressId}
                        isNewAddress={isNewAddress}
                        provinces={provinces}
                        wards={wards}
                        isLoadingProvinces={isLoadingProvinces}
                        isLoadingWards={isLoadingWards}
                        onProvinceChange={handleProvinceChange}
                        onWardChange={handleWardChange}
                        onAddressSelect={handleAddressSelect}
                        onNewAddress={handleNewAddress}
                      />
                    )}
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
                      availableCoupons={availableCoupons || []}
                      showCouponList={showCouponList}
                      isSubmitting={isSubmitting}
                      paymentMethod={paymentMethod}
                      onToggleCouponList={() =>
                        setShowCouponList(!showCouponList)
                      }
                      onApplyCoupon={handleApplyCoupon}
                      onRemoveCoupon={handleRemoveCoupon}
                      onSubmitOrder={handleSubmit(onSubmitOrder)}
                      onBackToCart={() => router.push("/cart")}
                    />
                  </CardContent>
                </Card>
              </div>
            </div>
          </form>
        </FormProvider>
=======
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
                {isLoadingAddresses ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="flex flex-col items-center space-y-3">
                      <div className="w-8 h-8 border-4 border-gray-200 border-t-gray-800 rounded-full animate-spin"></div>
                      <p className="text-sm text-gray-600">
                        Đang tải địa chỉ...
                      </p>
                    </div>
                  </div>
                ) : (
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
                )}
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
                  availableCoupons={availableCoupons || []}
                  showCouponList={showCouponList}
                  isSubmitting={isSubmitting}
                  paymentMethod={paymentMethod}
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
>>>>>>> 92c514853ae7da003171660fc573c9d5312c180c
      </div>
    </div>
  );
}
