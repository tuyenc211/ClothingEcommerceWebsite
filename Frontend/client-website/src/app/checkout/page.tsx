"use client";

import { useState, useMemo, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  Breadcrumb,
  BreadcrumbSeparator,
  BreadcrumbLink,
  BreadcrumbItem,
  BreadcrumbList,
} from "@/components/ui/breadcrumb";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import {
  MapPin,
  CreditCard,
  Ticket,
  ChevronRight,
  Check,
  Settings,
} from "lucide-react";
import { useCartStore, CartItem } from "@/stores/cartStore";
import Link from "next/link";
import { useProductStore } from "@/stores/productStore";
import { useColorStore } from "@/stores/colorStore";
import { useSizeStore } from "@/stores/sizeStore";
import { useCouponStore } from "@/stores/couponStore";
import useAuthStore from "@/stores/useAuthStore";
import { formatPrice } from "@/lib/utils";
import { toast } from "sonner";
import { useAddress } from "@/hooks/useAddress";

interface ShippingFormData {
  fullName: string;
  phone: string;
  email: string;
  address: string;
  ward: string;
  wardCode: string;
  province: string;
  provinceCode: string;
  note?: string;
}

interface EnrichedCartItem extends CartItem {
  product?: {
    id: number;
    name: string;
    sku?: string;
    base_price: number;
    images?: { id: number; imageUrl: string }[];
  };
  color?: {
    id: number;
    name: string;
    code: string;
  };
  size?: {
    id: number;
    code: string;
    name: string;
  };
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
  const { colors } = useColorStore();
  const { sizes } = useSizeStore();
  const { getActiveCoupons, fetchCoupons } = useCouponStore();

  useEffect(() => {
    fetchCoupons();
  }, [fetchCoupons]);
  // Address hook
  const {
    provinces,
    wards,
    isLoadingProvinces,
    isLoadingWards,
    fetchWards,
    clearWards,
  } = useAddress();

  // States
  const [paymentMethod, setPaymentMethod] = useState<"COD" | "WALLET">("COD");
  const [selectedAddressId, setSelectedAddressId] = useState<number | null>(
    null
  );
  const [isNewAddress, setIsNewAddress] = useState(false);
  const [showCouponList, setShowCouponList] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form data
  const [formData, setFormData] = useState<ShippingFormData>({
    fullName: "",
    phone: "",
    email: "",
    address: "",
    ward: "",
    wardCode: "",
    province: "",
    provinceCode: "",
  });

  const activeCoupons = getActiveCoupons();
  const summary = getCartSummary();

  // Enrich cart items with product, color, size data
  const enrichedItems = useMemo(() => {
    return items
      .map((item) => {
        const variant = item.variant;
        if (!variant) return null;

        const product = getProduct(variant.product_id);
        const color = colors.find((c) => c.id === variant.color.id);
        const size = sizes.find((s) => s.id === variant.size.id);

        return {
          ...item,
          product,
          color,
          size,
        } as EnrichedCartItem;
      })
      .filter((item): item is EnrichedCartItem => item !== null);
  }, [items, getProduct, colors, sizes]);

  // Load default address on mount (only run once)
  useEffect(() => {
    if (authUser) {
      // Find default address or use first one
      const defaultAddr =
        authUser.addresses?.find((addr) => addr.isDefault) ||
        authUser.addresses?.[0];

      if (defaultAddr) {
        setSelectedAddressId(defaultAddr.id);
        setFormData({
          fullName: authUser.fullName,
          phone: authUser.phone || "",
          email: authUser.email || "",
          address: defaultAddr.line,
          ward: defaultAddr.ward || "",
          wardCode: "",
          province: defaultAddr.province || "",
          provinceCode: "",
          note: "",
        });
      } else {
        setIsNewAddress(true);
        setFormData({
          fullName: authUser.fullName,
          phone: authUser.phone || "",
          email: authUser.email || "",
          address: "",
          ward: "",
          wardCode: "",
          province: "",
          provinceCode: "",
          note: "",
        });
      }
    } else {
      setIsNewAddress(true);
    }
  }, []);

  // Redirect if cart is empty
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
      province: selectedProvince?.name || "", // API mới dùng "name" thay vì "full_name"
      wardCode: "",
      ward: "",
    }));

    // Fetch wards for selected province
    fetchWards(provinceCode);
  };

  const handleWardChange = (wardCode: string) => {
    const selectedWard = wards.find((w) => w.code === wardCode);
    setFormData((prev) => ({
      ...prev,
      wardCode: wardCode,
      ward: selectedWard?.name || "", // API mới dùng "name" thay vì "full_name"
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
          email: authUser.email || "",
          address: selectedAddr.line,
          ward: selectedAddr.ward || "",
          wardCode: "",
          province: selectedAddr.province || "",
          provinceCode: "",
          note: formData.note || "",
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
      email: authUser?.email || "",
      address: "",
      ward: "",
      wardCode: "",
      province: "",
      provinceCode: "",
      note: formData.note || "",
    });
    clearWards();
  };

  const handleApplyCoupon = (couponCode: string) => {
    const coupon = activeCoupons.find((c) => c.code === couponCode);
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

  const validatePhoneNumber = (phone: string): boolean => {
    // Vietnamese phone number format: 10 digits, starts with 0 or +84
    const phoneRegex = /^(\+84|0)[0-9]{9}$/;
    return phoneRegex.test(phone.replace(/\s/g, ""));
  };

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateForm = () => {
    if (
      !formData.fullName ||
      !formData.phone ||
      !formData.address ||
      !formData.email
    ) {
      toast.error("Vui lòng điền đầy đủ thông tin giao hàng");
      return false;
    }

    if (!validatePhoneNumber(formData.phone)) {
      toast.error(
        "Số điện thoại không hợp lệ. Vui lòng nhập đúng định dạng (VD: 0912345678)"
      );
      return false;
    }

    if (!validateEmail(formData.email)) {
      toast.error("Email không hợp lệ");
      return false;
    }

    if (!formData.province || !formData.ward) {
      toast.error("Vui lòng chọn tỉnh/thành phố và xã/phường");
      return false;
    }

    return true;
  };

  const handleSubmitOrder = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      // TODO: Call backend API to create order
      const orderData = {
        user_id: authUser?.id,
        items: enrichedItems.map((item) => ({
          variant_id: item?.variant?.id,
          product_name: item?.product?.name,
          sku: item?.variant?.sku,
          quantity: item?.quantity,
          unit_price: item?.unit_price,
          line_total: (item?.unit_price || 0) * (item?.quantity || 0),
        })),
        subtotal: summary.subtotal,
        discount_total: summary.discount,
        shipping_fee: summary.shipping,
        grand_total: summary.total,
        payment_method: paymentMethod,
        shipping_address_snapshot: formData,
        note: formData.note,
        coupon_code: appliedCoupon?.code,
      };

      console.log("Creating order:", orderData);

      // TODO: Replace with actual API call
      // const response = await privateClient.post("/orders", orderData);
      // const order = response.data;

      // Simulate API call for now
      await new Promise((resolve) => setTimeout(resolve, 1500));

      toast.success("Đặt hàng thành công!");
      clearCart();
      router.push("/user/orders");
    } catch (error) {
      console.error("Order error:", error);
      toast.error("Đặt hàng thất bại. Vui lòng thử lại!");
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
          {/* Left Column - Forms */}
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
              <CardContent className="space-y-4">
                {/* Customer Information (Read-only) */}
                {authUser && (
                  <div className="space-y-4 pb-4 border-b">
                    <h3 className="font-medium text-gray-900">
                      Thông tin khách hàng
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="customer-name">
                          Họ và tên <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="customer-name"
                          value={authUser.fullName}
                          disabled
                          className="bg-gray-50"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="customer-email">
                          Email <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="customer-email"
                          value={authUser.email}
                          disabled
                          className="bg-gray-50"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="customer-phone">
                          Số điện thoại <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="customer-phone"
                          value={authUser.phone || ""}
                          disabled
                          className="bg-gray-50"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Shipping Address Selection */}
                {authUser &&
                  authUser.addresses &&
                  authUser.addresses.length > 0 && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <Label>Chọn địa chỉ giao hàng</Label>
                        <span className="text-xs text-gray-500">
                          {authUser.addresses.length} địa chỉ
                        </span>
                      </div>
                      <RadioGroup
                        value={selectedAddressId?.toString() || "new"}
                        onValueChange={(value: string) => {
                          if (value === "new") {
                            handleNewAddress();
                          } else {
                            handleAddressSelect(parseInt(value));
                          }
                        }}
                      >
                        {authUser.addresses.map((addr) => (
                          <div
                            key={addr.id}
                            className={`flex items-start space-x-3 rounded-lg border p-4 cursor-pointer transition-colors ${
                              selectedAddressId === addr.id
                                ? "border-primary bg-primary/5"
                                : "border-gray-200 hover:border-gray-300"
                            }`}
                            onClick={() => handleAddressSelect(addr.id)}
                          >
                            <RadioGroupItem
                              value={addr.id.toString()}
                              id={`addr-${addr.id}`}
                            />
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <Label
                                  htmlFor={`addr-${addr.id}`}
                                  className="font-medium cursor-pointer"
                                >
                                  {addr.line}
                                </Label>
                                {addr.isDefault && (
                                  <Badge
                                    variant="secondary"
                                    className="text-xs"
                                  >
                                    Mặc định
                                  </Badge>
                                )}
                              </div>
                              <p className="text-sm text-gray-600 mt-1">
                                {[addr.ward, addr.district, addr.province]
                                  .filter(Boolean)
                                  .join(", ")}
                              </p>
                            </div>
                          </div>
                        ))}

                        {/* New Address Option */}
                        <div
                          className={`flex items-start space-x-3 rounded-lg border p-4 cursor-pointer transition-colors ${
                            isNewAddress
                              ? "border-primary bg-primary/5"
                              : "border-gray-200 hover:border-gray-300"
                          }`}
                          onClick={handleNewAddress}
                        >
                          <RadioGroupItem value="new" id="addr-new" />
                          <Label
                            htmlFor="addr-new"
                            className="font-medium cursor-pointer"
                          >
                            Sử dụng địa chỉ mới
                          </Label>
                        </div>
                      </RadioGroup>
                    </div>
                  )}

                {/* Guest Checkout Form (when not logged in) */}
                {!authUser && (
                  <div className="space-y-4">
                    <h3 className="font-medium text-gray-900">
                      Thông tin khách hàng
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="guest-name">
                          Họ và tên <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="guest-name"
                          name="fullName"
                          value={formData.fullName}
                          onChange={handleInputChange}
                          placeholder="Nhập họ và tên"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="guest-email">
                          Email <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="guest-email"
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          placeholder="Nhập email"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="guest-phone">
                          Số điện thoại <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="guest-phone"
                          name="phone"
                          value={formData.phone}
                          onChange={handleInputChange}
                          placeholder="Nhập số điện thoại"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* New Address Form (Only address fields for logged in users) */}
                {isNewAddress && authUser && (
                  <div className="space-y-4 pt-4 border-t">
                    <h3 className="font-medium text-gray-900">
                      Nhập địa chỉ giao hàng mới
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="province">
                          Tỉnh/ Thành phố{" "}
                          <span className="text-red-500">*</span>
                        </Label>
                        <Select
                          value={formData.provinceCode}
                          onValueChange={handleProvinceChange}
                        >
                          <SelectTrigger>
                            <SelectValue
                              placeholder={
                                isLoadingProvinces
                                  ? "Đang tải..."
                                  : "Chọn tỉnh/thành phố"
                              }
                            />
                          </SelectTrigger>
                          <SelectContent className="max-h-60 overflow-y-auto">
                            {provinces.map((province) => (
                              <SelectItem
                                key={province.code}
                                value={province.code}
                              >
                                {province.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="ward">
                          Xã/ Phường <span className="text-red-500">*</span>
                        </Label>
                        <Select
                          value={formData.wardCode}
                          onValueChange={handleWardChange}
                          disabled={!formData.provinceCode}
                        >
                          <SelectTrigger>
                            <SelectValue
                              placeholder={
                                !formData.provinceCode
                                  ? "Chọn tỉnh/thành phố trước"
                                  : isLoadingWards
                                  ? "Đang tải..."
                                  : "Chọn xã/phường"
                              }
                            />
                          </SelectTrigger>
                          <SelectContent className="max-h-60 overflow-y-auto">
                            {wards.map((ward) => (
                              <SelectItem key={ward.code} value={ward.code}>
                                {ward.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="address">
                        Địa chỉ cụ thể <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="address"
                        name="address"
                        value={formData.address}
                        onChange={handleInputChange}
                        placeholder="Số nhà, tên đường..."
                      />
                    </div>
                  </div>
                )}
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
                <RadioGroup
                  value={paymentMethod}
                  onValueChange={(value: string) =>
                    setPaymentMethod(value as "COD" | "WALLET")
                  }
                >
                  {/* COD Payment */}
                  <div
                    className={`flex items-center space-x-3 rounded-lg border p-4 cursor-pointer transition-colors ${
                      paymentMethod === "COD"
                        ? "border-primary bg-primary/5"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                    onClick={() => setPaymentMethod("COD")}
                  >
                    <RadioGroupItem value="COD" id="payment-cod" />
                    <Label
                      htmlFor="payment-cod"
                      className="flex-1 cursor-pointer"
                    >
                      <div className="font-medium">
                        Thanh toán khi nhận hàng (COD)
                      </div>
                      <p className="text-sm text-gray-500 mt-1">
                        Thanh toán bằng tiền mặt khi nhận hàng
                      </p>
                    </Label>
                  </div>

                  {/* VNPay Payment */}
                  <div
                    className={`flex items-center space-x-3 rounded-lg border p-4 cursor-pointer transition-colors ${
                      paymentMethod === "WALLET"
                        ? "border-primary bg-primary/5"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                    onClick={() => setPaymentMethod("WALLET")}
                  >
                    <RadioGroupItem value="WALLET" id="payment-wallet" />
                    <Label
                      htmlFor="payment-wallet"
                      className="flex-1 cursor-pointer"
                    >
                      <div className="flex items-center gap-3">
                        <span className="font-medium">
                          Thanh toán qua VNPay
                        </span>
                        <Image
                          src="/images/logo/vnpay.svg"
                          alt="VNPay"
                          width={60}
                          height={20}
                          className="h-5 w-auto"
                        />
                      </div>
                    </Label>
                  </div>
                </RadioGroup>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Order Summary */}
          <div className="lg:col-span-1">
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle>Đơn hàng ({items.length} sản phẩm)</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Products List */}
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {enrichedItems.map((item) => {
                    if (!item || !item.product) return null;

                    const productImage =
                      item.product.images?.[0]?.imageUrl ||
                      "/images/placeholder.jpg";

                    return (
                      <div key={item.id} className="flex gap-3">
                        <div className="relative flex-shrink-0">
                          <Image
                            src={productImage}
                            alt={item.product.name}
                            width={60}
                            height={60}
                            className="rounded-lg object-cover"
                          />
                          <Badge
                            className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs"
                            variant="secondary"
                          >
                            {item.quantity}
                          </Badge>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-medium line-clamp-2">
                            {item.product.name}
                          </h4>
                          <div className="text-xs text-gray-500 mt-1">
                            {item.color && (
                              <span>
                                {item.color.name}
                                {item.size && " / "}
                              </span>
                            )}
                            {item.size && <span>{item.size.code}</span>}
                          </div>
                          <div className="text-sm font-medium mt-1">
                            {formatPrice(item.unit_price * item.quantity)}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <Separator />

                {/* Coupon Section */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Ticket className="w-4 h-4 text-primary" />
                    <Label>Mã giảm giá</Label>
                  </div>

                  {appliedCoupon ? (
                    <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                      <div className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-green-600" />
                        <span className="text-sm font-medium text-green-700">
                          {appliedCoupon.code}
                        </span>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleRemoveCoupon}
                        className="text-red-500 hover:text-red-700 h-8"
                      >
                        Hủy
                      </Button>
                    </div>
                  ) : (
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => setShowCouponList(!showCouponList)}
                    >
                      <Ticket className="w-4 h-4 mr-2" />
                      Chọn mã giảm giá
                    </Button>
                  )}

                  {/* Coupon List */}
                  {showCouponList && !appliedCoupon && (
                    <div className="space-y-2 max-h-48 overflow-y-auto border rounded-lg p-2">
                      {activeCoupons.length > 0 ? (
                        activeCoupons.map((coupon) => (
                          <div
                            key={coupon.id}
                            className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                            onClick={() => handleApplyCoupon(coupon.code)}
                          >
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <Badge variant="secondary" className="text-xs">
                                  {coupon.code}
                                </Badge>
                                <span className="text-sm font-medium">
                                  Giảm {formatPrice(coupon.value)}
                                </span>
                              </div>
                              <p className="text-xs text-gray-500 mt-1">
                                {coupon.description || coupon.name}
                              </p>
                              {coupon.minOrderTotal && (
                                <p className="text-xs text-gray-400 mt-1">
                                  Đơn tối thiểu:{" "}
                                  {formatPrice(coupon.minOrderTotal)}
                                </p>
                              )}
                            </div>
                            <ChevronRight className="w-4 h-4 text-gray-400" />
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-4 text-sm text-gray-500">
                          Không có mã giảm giá khả dụng
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <Separator />

                {/* Order Summary */}
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tạm tính:</span>
                    <span className="font-medium">
                      {formatPrice(summary.subtotal)}
                    </span>
                  </div>
                  {summary.discount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Giảm giá:</span>
                      <span className="font-medium">
                        -{formatPrice(summary.discount)}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-gray-600">Phí vận chuyển:</span>
                    <span className="font-medium">
                      {summary.shipping === 0
                        ? "Miễn phí"
                        : formatPrice(summary.shipping)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Thuế (VAT 10%):</span>
                    <span className="font-medium">
                      {formatPrice(summary.tax)}
                    </span>
                  </div>
                </div>

                <Separator />

                {/* Total */}
                <div className="flex justify-between items-center text-lg font-semibold">
                  <span>Tổng cộng:</span>
                  <span className="text-primary">
                    {formatPrice(summary.total)}
                  </span>
                </div>

                {/* Checkout Button */}
                <Button
                  className="w-full"
                  size="lg"
                  onClick={handleSubmitOrder}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Đang xử lý..." : "Hoàn tất đơn hàng"}
                </Button>

                <Button
                  variant="ghost"
                  className="w-full"
                  onClick={() => router.push("/cart")}
                >
                  Quay lại giỏ hàng
                </Button>

                {/* Note */}
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                  <p className="text-xs text-amber-800">
                    Chúng tôi sẽ XÁC NHẬN đơn hàng bằng TIN NHẮN SMS. Bạn vui
                    lòng kiểm tra TIN NHẮN ngay khi đặt hàng thành công và CHỜ
                    NHẬN HÀNG
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
