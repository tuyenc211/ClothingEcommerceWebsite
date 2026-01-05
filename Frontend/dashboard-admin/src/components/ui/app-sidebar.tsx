import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarFooter,
} from "@/components/ui/sidebar";
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
import useAuthStore from "@/stores/useAuthStore";
import { useRouter } from "next/navigation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
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
  ChevronRight,
  User2,
  ChevronUp,
} from "lucide-react";
import Link from "next/link";
interface SidebarItem {
  title: string;
  url?: string;
  icon: React.ElementType;
  children?: SidebarItem[];
  requireRole?: "ADMIN" | "STAFF";
}
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
export function AppSidebar() {
  const { authUser, logout } = useAuthStore();
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
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
  const sidebarItems: SidebarItem[] = [
    {
      title: "Trang tổng quan",
      url: "/",
      icon: LayoutDashboard,
    },
    {
      title: "Quản lý tài khoản",
      icon: Users,
      url: "/users",
      requireRole: "ADMIN",
    },
    {
      title: "Quản lý danh mục",
      icon: ShoppingCart,
      children: [
        {
          title: "Danh sách danh mục chính",
          url: "/categories",
          icon: List,
        },
        {
          title: "Danh sách danh mục con",
          url: "/subcategories",
          icon: List,
        },
      ],
    },
    {
      title: "Quản lý sản phẩm",
      url: "/list-product",
      icon: ShoppingCart,
    },
    {
      title: "Quản lý màu sắc",
      url: "/colors",
      icon: Palette,
    },
    {
      title: "Quản lý kích thước",
      url: "/sizes",
      icon: Ruler,
    },
    {
      title: "Quản lý đơn hàng",
      url: "/orders",
      icon: ClipboardList,
    },
    {
      title: "Quản lý mã giảm giá",
      url: "/coupon-list",
      icon: Gift,
    },
    {
      title: "Quản lý kho",
      url: "/stock",
      icon: Warehouse,
    },
  ];
  // Filter menu items theo role của user
  const filteredItems = sidebarItems.filter((item) => {
    if (!item.requireRole) return true;
    return authUser?.roles?.some((r) => r.name === item.requireRole);
  });

  return (
    <>
      <Sidebar collapsible="icon" className="">
        <Collapsible defaultOpen className="group/collapsible">
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel className="text-lg font-bold uppercase mb-6">
                {" "}
                Atino Dashboard
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {filteredItems.map((item) => (
                    <Collapsible
                      key={item.title}
                      asChild
                      defaultOpen
                      className="group/collapsible"
                    >
                      <SidebarMenuItem>
                        {item.children ? (
                          <>
                            <CollapsibleTrigger asChild>
                              <SidebarMenuButton tooltip={item.title}>
                                <item.icon />
                                <span>{item.title}</span>
                                <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                              </SidebarMenuButton>
                            </CollapsibleTrigger>
                            <CollapsibleContent>
                              <SidebarMenuSub>
                                {item.children.map((subItem) => (
                                  <SidebarMenuSubItem key={subItem.title}>
                                    <SidebarMenuSubButton asChild>
                                      <a href={subItem.url}>
                                        <subItem.icon />
                                        <span>{subItem.title}</span>
                                      </a>
                                    </SidebarMenuSubButton>
                                  </SidebarMenuSubItem>
                                ))}
                              </SidebarMenuSub>
                            </CollapsibleContent>
                          </>
                        ) : (
                          <SidebarMenuButton asChild tooltip={item.title}>
                            <a href={item.url}>
                              <item.icon />
                              <span>{item.title}</span>
                            </a>
                          </SidebarMenuButton>
                        )}
                      </SidebarMenuItem>
                    </Collapsible>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
        </Collapsible>
        <SidebarFooter>
          <SidebarMenu>
            <SidebarMenuItem>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <SidebarMenuButton>
                    <User2 />
                    <span>{authUser?.fullName}</span>
                    <ChevronUp className="ml-auto" />
                  </SidebarMenuButton>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  side="top"
                  className="w-[--radix-popper-anchor-width]"
                >
                  <DropdownMenuItem
                    onClick={() => {
                      window.location.href = "users/profile";
                    }}
                  >
                    <User2 className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setShowLogoutDialog(true)}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Đăng xuất</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </Sidebar>
      <AlertDialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận đăng xuất</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn đăng xuất khỏi hệ thống quản trị không?
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
    </>
  );
}
