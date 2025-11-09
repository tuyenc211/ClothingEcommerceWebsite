"use client";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { ReactNode, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import useAuthStore from "@/stores/useAuthStore";
import { Button } from "@/components/ui/button";
import {
  User,
  Package,
  LogOut,
  ChevronRight,
  Home,
  MapPin,
  Star,
} from "lucide-react";
import { toast } from "sonner";
interface UserLayoutProps {
  children: ReactNode;
}

const sidebarItems = [
  {
    href: "/user",
    label: "Thông Tin Cá Nhân",
    icon: User,
  },
  {
    href: "/user/orders",
    label: "Đơn Hàng",
    icon: Package,
  },
  {
    href: "/user/address",
    label: "Quản Lý Địa Chỉ",
    icon: MapPin,
  },
  {
    href: "/user/reviews",
    label: "Đánh Giá Của Tôi",
    icon: Star,
  },
];

export default function UserLayout({ children }: UserLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { authUser, logout } = useAuthStore();
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const handleLogout = async () => {
    try {
      await logout();
      setShowLogoutDialog(false);
      router.push("/");
    } catch {
      setShowLogoutDialog(false);
      toast.error("Đăng xuất thất bại");
    }
  };
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Breadcrumb */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <Link href="/" className="hover:text-gray-900 flex items-center">
              <Home className="h-4 w-4 mr-1" />
              Trang chủ
            </Link>
            <ChevronRight className="h-4 w-4" />
            <span className="text-gray-900">Tài khoản</span>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-lg shadow-sm border p-6">
              {/* User Info */}
              <div className="flex items-center space-x-3 mb-6 pb-6 border-b">
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-medium text-gray-900 truncate">
                    Xin Chào!
                  </h3>
                  <p className="text-lg text-gray-600 truncate font-semibold uppercase">
                    {authUser?.fullName}
                  </p>
                </div>
              </div>

              {/* Navigation */}
              <nav className="space-y-1">
                {sidebarItems.map((item) => {
                  const Icon = item.icon;
                  const isActive =
                    pathname === item.href ||
                    (item.href !== "/user" && pathname?.startsWith(item.href));

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        "flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors",
                        isActive
                          ? "bg-blue-50 text-blue-700 border-r-2 border-blue-700"
                          : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                      )}
                    >
                      <Icon className="h-5 w-5 mr-3" />
                      {item.label}
                    </Link>
                  );
                })}
              </nav>

              {/* Logout Button */}
              <div className="mt-6 pt-6 border-t">
                <AlertDialog
                  open={showLogoutDialog}
                  onOpenChange={setShowLogoutDialog}
                >
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <LogOut className="h-5 w-5 mr-3" />
                      Đăng Xuất
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Xác nhận đăng xuất</AlertDialogTitle>
                    </AlertDialogHeader>
                    <AlertDialogDescription>
                      Bạn có chắc chắn muốn đăng xuất khỏi tài khoản này?
                    </AlertDialogDescription>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Hủy</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleLogout}
                        className="bg-red-600 hover:bg-red-700"
                      >
                        Đăng Xuất
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-9">
            <div>{children}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
