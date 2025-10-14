"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import useAuthStore from "@/stores/useAuthStore";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  LayoutDashboard,
  ShoppingCart,
  Users,
  Palette,
  FolderOpen,
  ClipboardList,
  Gift,
  LogOut,
  Menu,
  X,
  Plus,
  List,
  Warehouse,
} from "lucide-react";
import Link from "next/link";
// import { ProtectedRoute } from "@/components/auth/ProtectedRoute";

interface SidebarItem {
  title: string;
  href?: string;
  icon: React.ElementType;
  children?: SidebarItem[];
}

const sidebarItems: SidebarItem[] = [
  {
    title: "Dashboard",
    href: "/admin",
    icon: LayoutDashboard,
  },
  {
    title: "Quản lý tài khoản",
    icon: Users,
    children: [
      {
        title: "Danh sách tài khoản",
        href: "/admin/users",
        icon: List,
      },
      {
        title: "Thêm nhân viên",
        href: "/admin/users/add-staff",
        icon: Plus,
      },
    ],
  },
  {
    title: "Quản lý danh mục",
    icon: ShoppingCart,
    children: [
      {
        title: "Thêm sản phẩm",
        href: "/admin/product",
        icon: Plus,
      },
      {
        title: "Danh sách sản phẩm",
        href: "/admin/list-product",
        icon: List,
      },
      {
        title: "Thêm danh mục chính",
        href: "/admin/categories/add",
        icon: FolderOpen,
      },

      {
        title: "Danh sách danh mục chính",
        href: "/admin/categories",
        icon: List,
      },
      {
        title: "Thêm danh mục con",
        href: "/admin/subcategories/add",
        icon: FolderOpen,
      },
      {
        title: "Danh sách danh mục con",
        href: "/admin/subcategories",
        icon: List,
      },
      {
        title: "Thêm màu",
        href: "/admin/colors/add",
        icon: Palette,
      },
      {
        title: "Danh sách màu",
        href: "/admin/colors",
        icon: List,
      },
      {
        title: "Thêm kích thước",
        href: "/admin/sizes/add",
        icon: Plus,
      },
      {
        title: "Danh sách kích thước",
        href: "/admin/sizes",
        icon: List,
      },
    ],
  },
  {
    title: "Quản lý đơn hàng",
    href: "/admin/orders",
    icon: ClipboardList,
  },
  {
    title: "Quản lý mã giảm giá",
    icon: Gift,
    children: [
      {
        title: "Thêm mã giảm giá",
        href: "/admin/coupon",
        icon: Plus,
      },
      {
        title: "Danh sách mã giảm giá",
        href: "/admin/coupon-list",
        icon: List,
      },
    ],
  },
  {
    title: "Quản lý kho",
    href: "/admin/stock",
    icon: Warehouse,
  },
];

interface SidebarProps {
  collapsed: boolean;
  onCollapse: (collapsed: boolean) => void;
  className?: string;
  handleLogout: () => void;
}

function Sidebar({
  collapsed,
  className,
  handleLogout,
}: Omit<SidebarProps, "onCollapse">) {
  const [openItems, setOpenItems] = useState<string[]>([]);
  const toggleItem = (title: string) => {
    setOpenItems((prev) =>
      prev.includes(title)
        ? prev.filter((item) => item !== title)
        : [...prev, title]
    );
  };

  const renderSidebarItem = (item: SidebarItem, depth = 0) => {
    const hasChildren = item.children && item.children.length > 0;
    const isOpen = openItems.includes(item.title);
    const Icon = item.icon;

    if (hasChildren) {
      return (
        <div key={item.title}>
          <Button
            variant="ghost"
            className={cn(
              "w-full justify-start text-left",
              collapsed && "justify-center",
              "my-1",
              depth > 0 && "pl-8"
            )}
            onClick={() => toggleItem(item.title)}
          >
            <Icon className=" h-4 w-4" />
            {!collapsed && (
              <>
                <span>{item.title}</span>
                <span className="ml-auto">{isOpen ? "−" : "+"}</span>
              </>
            )}
          </Button>
          {isOpen && !collapsed && (
            <div className="ml-4 ">
              {item.children?.map((child) =>
                renderSidebarItem(child, depth + 1)
              )}
            </div>
          )}
        </div>
      );
    }

    return (
      <Link key={item.title} href={item.href || "#"}>
        <Button
          variant="ghost"
          className={cn(
            "w-full justify-start text-left",
            collapsed && "justify-center",
            "my-1",
            depth > 0 && "pl-8"
          )}
        >
          <Icon className=" h-4 w-4" />
          {!collapsed && <span>{item.title}</span>}
        </Button>
      </Link>
    );
  };

  return (
    <div className={cn("pb-12", className)}>
      <div className="space-y-4 py-4">
        <div className="px-3 py-2">
          <div className="flex items-center justify-between">
            <h2
              className={cn(
                "text-lg font-semibold text-white",
                collapsed && "hidden"
              )}
            >
              Cart Corner Admin
            </h2>
            {collapsed && (
              <span className="text-lg font-semibold text-white">Corner</span>
            )}
          </div>
        </div>
        <div className="px-3">
          <div className="space-y-1">
            {sidebarItems.map((item) => renderSidebarItem(item))}
            <Button
              variant="ghost"
              className={cn(
                "w-full",
                collapsed && "justify-center",
                " justify-start text-left text-white hover:text-red-400"
              )}
              onClick={handleLogout}
            >
              <LogOut className="mr-2 h-4 w-4" />
              {!collapsed && <span>Đăng xuất</span>}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { authUser, logout } = useAuthStore();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await logout();
      // Không cần manual redirect vì ProtectedRoute sẽ tự động handle
      // router.push("/login");
    } catch (error) {
      console.error("Logout error:", error);
      // Fallback redirect trong trường hợp có lỗi
      router.push("/login");
    }
  };

  return (
    // <ProtectedRoute>
      <div className="flex h-screen bg-gray-100">
        {/* Desktop Sidebar */}
        <div
          className={cn(
            "hidden md:flex md:flex-col md:fixed md:inset-y-0 bg-gray-900 transition-all duration-300",
            collapsed ? "md:w-20" : "md:w-64"
          )}
        >
          <ScrollArea className="flex-1">
            <Sidebar
              collapsed={collapsed}
              className="text-white"
              handleLogout={handleLogout}
            />
          </ScrollArea>
        </div>

        {/* Mobile Sidebar */}
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetContent
            side="left"
            className="p-0 bg-gray-900 text-white border-gray-700"
          >
            <ScrollArea className="h-full">
              <Sidebar
                collapsed={false}
                className="text-white"
                handleLogout={handleLogout}
              />
            </ScrollArea>
          </SheetContent>
        </Sheet>

        {/* Main Content */}
        <div
          className={cn(
            "flex-1 flex flex-col overflow-hidden transition-all duration-300",
            collapsed ? "md:ml-20" : "md:ml-64"
          )}
        >
          {/* Header */}
          <header className="bg-white shadow-sm border-b">
            <div className="flex items-center justify-between px-4 py-3">
              <div className="flex items-center space-x-4">
                <Sheet>
                  <SheetTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="md:hidden"
                      onClick={() => setMobileOpen(true)}
                    >
                      <Menu className="h-6 w-6" />
                    </Button>
                  </SheetTrigger>
                </Sheet>

                <Button
                  variant="ghost"
                  size="icon"
                  className="hidden md:flex"
                  onClick={() => setCollapsed(!collapsed)}
                >
                  {collapsed ? (
                    <Menu className="h-6 w-6" />
                  ) : (
                    <X className="h-6 w-6" />
                  )}
                </Button>
              </div>

              <div className="flex items-center space-x-4">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      className="relative h-10 w-auto rounded-full p-2"
                    >
                      <div className="flex items-center space-x-2">
                        <div className="hidden md:block text-left">
                          <p className="text-sm font-medium">
                            {authUser?.fullName || "Admin"}
                          </p>
                          <p className="text-xs text-gray-500">
                            {authUser?.email}
                          </p>
                        </div>
                      </div>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>Xem hồ sơ</DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>
                      <Button
                        variant="ghost"
                        className="w-full justify-start text-left text-red-600 hover:text-red-400"
                        onClick={handleLogout}
                      >
                        <LogOut className="mr-2 h-4 w-4" />
                        Đăng xuất
                      </Button>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </header>

          {/* Page Content */}
          <main className="flex-1 overflow-auto p-6">{children}</main>
        </div>
      </div>
    // </ProtectedRoute>
  );
}
