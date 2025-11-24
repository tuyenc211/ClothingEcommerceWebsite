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
  ClipboardList,
  Gift,
  LogOut,
  Menu,
  X,
  List,
  Warehouse,
  Ruler,
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
// import { ProtectedRoute } from "@/components/auth/ProtectedRoute";

interface SidebarItem {
  title: string;
  href?: string;
  icon: React.ElementType;
  children?: SidebarItem[];
  requireRole?: "ADMIN" | "STAFF";
}
const sidebarItems: SidebarItem[] = [
  {
    title: "Trang tổng quan",
    href: "/",
    icon: LayoutDashboard,
  },
  {
    title: "Quản lý tài khoản",
    icon: Users,
    href: "/users",
    requireRole: "ADMIN",
  },
  {
    title: "Quản lý danh mục",
    icon: ShoppingCart,
    children: [
      {
        title: "Danh sách danh mục chính",
        href: "/categories",
        icon: List,
      },
      {
        title: "Danh sách danh mục con",
        href: "/subcategories",
        icon: List,
      },
    ],
  },
  {
    title: "Quản lý sản phẩm",
    href: "/list-product",
    icon: ShoppingCart,
  },
  {
    title: "Quản lý màu sắc",
    href: "/colors",
    icon: Palette,
  },
  {
    title: "Quản lý kích thước",
    href: "/sizes",
    icon: Ruler,
  },
  {
    title: "Quản lý đơn hàng",
    href: "/orders",
    icon: ClipboardList,
  },
  {
    title: "Quản lý mã giảm giá",
    href: "/coupon-list",
    icon: Gift,
  },
  {
    title: "Quản lý kho",
    href: "/stock",
    icon: Warehouse,
  },
];

interface SidebarProps {
  collapsed: boolean;
  onCollapse: (collapsed: boolean) => void;
  className?: string;
  handleLogout: () => void;
  showLogoutDialog: boolean;
  setShowLogoutDialog: (showLogoutDialog: boolean) => void;
}

function Sidebar({
  collapsed,
  className,
  handleLogout,
  showLogoutDialog,
  setShowLogoutDialog,
}: Omit<SidebarProps, "onCollapse">) {
  const { isAdmin } = useAuthStore();
  const [openItems, setOpenItems] = useState<string[]>([]);

  const filteredSidebarItems = sidebarItems.filter((item) => {
    if (!item.requireRole) {
      return true;
    }
    if (item.requireRole === "ADMIN") {
      return isAdmin();
    }
  });
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
              Atino Admin Dashboard
            </h2>
            {collapsed && (
              <span className="text-lg font-semibold text-white">Atino</span>
            )}
          </div>
        </div>
        <div className="px-3">
          <div className="space-y-1">
            {filteredSidebarItems.map((item) => renderSidebarItem(item))}
            <AlertDialog
              open={showLogoutDialog}
              onOpenChange={setShowLogoutDialog}
            >
              <AlertDialogTrigger asChild>
                <Button
                  variant="ghost"
                  className={cn(
                    "w-full",
                    collapsed && "justify-center",
                    " justify-start text-left text-white hover:text-red-400"
                  )}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  {!collapsed && <span>Đăng xuất</span>}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Xác nhận đăng xuất</AlertDialogTitle>
                  <AlertDialogDescription>
                    Bạn có chắc chắn muốn đăng xuất khỏi hệ thống quản trị
                    không?
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Hủy</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleLogout}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    Đăng xuất
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const { authUser, logout } = useAuthStore();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await logout();
      setShowLogoutDialog(false);
      window.location.href = "/login";
    } catch (error) {
      console.error("Logout error:", error);
      setShowLogoutDialog(false);
      toast.error("Đăng xuất thất bại");
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
            showLogoutDialog={showLogoutDialog}
            setShowLogoutDialog={setShowLogoutDialog}
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
              showLogoutDialog={showLogoutDialog}
              setShowLogoutDialog={setShowLogoutDialog}
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
                          {authUser?.fullName}
                        </p>
                        <p className="text-xs text-gray-500">
                          {authUser?.email}
                        </p>
                      </div>
                    </div>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <Link href="/users/profile">
                    <DropdownMenuItem>Xem hồ sơ</DropdownMenuItem>
                  </Link>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                    <AlertDialog
                      open={showLogoutDialog}
                      onOpenChange={setShowLogoutDialog}
                    >
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="ghost"
                          className="w-full justify-start text-left text-red-600 hover:text-red-400"
                        >
                          <LogOut className="mr-2 h-4 w-4" />
                          Đăng xuất
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>
                            Xác nhận đăng xuất
                          </AlertDialogTitle>
                          <AlertDialogDescription>
                            Bạn có chắc chắn muốn đăng xuất khỏi hệ thống quản
                            trị không?
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Hủy</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={handleLogout}
                            className="bg-red-600 hover:bg-red-700"
                          >
                            Đăng xuất
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
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
