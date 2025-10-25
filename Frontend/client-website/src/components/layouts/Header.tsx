"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Search, Menu, X, Phone, Mail, User, Headphones } from "lucide-react";
import { CartSheet } from "@/components/common/CartSheet";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import { cn } from "@/lib/utils";
import useAuthStore from "@/stores/useAuthStore";
import { useCategoryStore } from "@/stores/categoryStore";
import Logo from "../common/Logo";
// Component ListItem
const ListItem = ({
  className,
  title,
  children,
  href,
  ...props
}: {
  className?: string;
  title: string;
  children?: React.ReactNode;
  href: string;
}) => {
  return (
    <li>
      <NavigationMenuLink asChild>
        <Link
          href={href}
          className={cn(
            "space-y-1 rounded-md p-3 leading-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent",
            className
          )}
          {...props}
        >
          <div className="text-sm text-center uppercase font-mmedium leading-none">
            {title}
          </div>
          <p className="text-sm leading-snug text-muted-foreground">
            {children}
          </p>
        </Link>
      </NavigationMenuLink>
    </li>
  );
};

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const { authUser } = useAuthStore();
  const { categories, fetchCategories } = useCategoryStore();
  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);
  console.log("Categories in Header:", categories);
  // Category cha = không có parentId
  const parentCategories = categories.filter((cat) => !cat.parentId);

  return (
    <>
      {/* Top Header Bar - Desktop */}
      <div className="bg-black text-white py-2 text-sm hidden md:block">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-2">
                <Phone className="w-4 h-4" />
                <span>HOTLINE: 1900 1234</span>
              </div>
              <div className="flex items-center space-x-2">
                <Mail className="w-4 h-4" />
                <span>support@fashionstore.com</span>
              </div>
            </div>
            <div className="flex items-center space-x-6">
              <Link
                href="/support"
                className="hover:cursor-pointer transition-colors"
              >
                <div className="flex items-center space-x-2">
                  <Headphones className="w-4 h-4" />
                  <span>SUPPORT</span>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Top Header Bar - Mobile */}
      <div className="bg-black text-white py-2 text-sm md:hidden">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Phone className="w-4 h-4" />
              <span>1900 1234</span>
            </div>
            <Link href="/support" className="transition-colors">
              <div className="flex items-center space-x-2">
                <Headphones className="w-4 h-4" />
                <span>SUPPORT</span>
              </div>
            </Link>
          </div>
        </div>
      </div>

      <header className="bg-white sticky top-0 z-50 py-1 md:py-2 px-2">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center">
              <Link href="/" className="text-2xl font-bold">
                <Logo />
              </Link>
            </div>

            {/* Desktop Navigation with NavigationMenu */}
            <div className="hidden md:block">
              <NavigationMenu>
                <NavigationMenuList>
                  {/* Trang chủ */}
                  <NavigationMenuItem className="px-2">
                    <Link href="/">
                      <NavigationMenuLink asChild>
                        <span className="uppercase font-bold">Trang chủ</span>
                      </NavigationMenuLink>
                    </Link>
                  </NavigationMenuItem>

                  {parentCategories.map((parent) => {
                    const children = categories.filter(
                      (child) => child.parentId === parent.id
                    );

                    if (children.length === 0) {
                      return (
                        <NavigationMenuItem key={parent.id} className="px-2">
                          <Link href={`/categories/${parent.slug}`}>
                            <NavigationMenuLink asChild>
                              <span className="uppercase font-bold">
                                {parent.name}
                              </span>
                            </NavigationMenuLink>
                          </Link>
                        </NavigationMenuItem>
                      );
                    }

                    return (
                      <NavigationMenuItem key={parent.id} className="px-2">
                        <NavigationMenuTrigger
                          asChild
                          className="uppercase font-bold"
                        >
                          <Link href={`/categories/${parent.slug}`}>
                            {parent.name}
                          </Link>
                        </NavigationMenuTrigger>

                        <NavigationMenuContent>
                          <ul className="grid w-[400px] gap-2 md:w-[500px] md:grid-cols-2 lg:w-[600px] p-4">
                            {children.map((child) => (
                              <ListItem
                                key={child.id}
                                title={child.name}
                                href={`/categories/${parent.slug}/${child.slug}`}
                              ></ListItem>
                            ))}
                          </ul>
                        </NavigationMenuContent>
                      </NavigationMenuItem>
                    );
                  })}
                  <NavigationMenuItem className="px-2">
                    <Link href="/news">
                      <NavigationMenuLink asChild>
                        <span className="uppercase font-bold">Tin tức</span>
                      </NavigationMenuLink>
                    </Link>
                  </NavigationMenuItem>
                </NavigationMenuList>
              </NavigationMenu>
            </div>

            {/* Search, Cart, User */}
            <div className="flex items-center space-x-4">
              {/* Search Input */}
              <div className="relative hidden md:block">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="w-5 h-5" />
                </div>
                <input
                  type="text"
                  placeholder="TÌM KIẾM SẢN PHẨM"
                  className="w-80 pl-10 pr-4 py-2 border border-gray-500 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-800 focus:border-transparent text-sm"
                />
              </div>

              {/* Mobile Search Button */}
              <button
                className="md:hidden p-2 hover:bg-gray-100 rounded-full"
                onClick={() => setIsSearchOpen(!isSearchOpen)}
              >
                <Search className="w-5 h-5" />
              </button>

              <CartSheet />

              <Link
                href={authUser ? "/user" : "/user/login"}
                className="p-2 hover:bg-gray-100 rounded-full"
              >
                <User className="w-5 h-5" />
              </Link>

              {/* Mobile menu button */}
              <button
                className="md:hidden p-2"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
              >
                {isMenuOpen ? (
                  <X className="w-5 h-5" />
                ) : (
                  <Menu className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>

          {/* Mobile Navigation */}
          {isMenuOpen && (
            <div className="md:hidden py-4 border-t">
              <Link
                href="/"
                className="block py-2 text-gray-700 hover:text-blue-600"
                onClick={() => setIsMenuOpen(false)}
              >
                Trang chủ
              </Link>

              {parentCategories.map((parent) => {
                const children = categories.filter(
                  (child) => child.parentId === parent.id
                );

                if (children.length === 0) {
                  return (
                    <Link
                      key={parent.id}
                      href={`/categories/${parent.slug}`}
                      className="block py-2 text-gray-700 hover:text-blue-600"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      {parent.name}
                    </Link>
                  );
                }

                return (
                  <div key={parent.id} className="py-2">
                    <div className="font-semibold text-gray-900 mb-2">
                      {parent.name}
                    </div>
                    <div className="pl-4 space-y-1">
                      {children.map((child) => (
                        <Link
                          key={child.id}
                          href={`/categories/${parent.slug}/${child.slug}`}
                          className="block py-1 text-sm text-gray-600 hover:text-blue-600"
                          onClick={() => setIsMenuOpen(false)}
                        >
                          {child.name}
                        </Link>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Mobile Search */}
          {isSearchOpen && (
            <div className="md:hidden py-4 border-t bg-gray-50">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="w-5 h-5" />
                </div>
                <input
                  type="text"
                  placeholder="TÌM KIẾM SẢN PHẨM"
                  className="w-full pl-10 pr-4 py-3 border text-sm border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-600 focus:border-transparent"
                />
              </div>
            </div>
          )}
        </div>
      </header>
    </>
  );
}
