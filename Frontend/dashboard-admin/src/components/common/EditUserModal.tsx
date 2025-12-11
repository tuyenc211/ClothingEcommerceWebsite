"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
    Save,
    X,
    User as UserIcon,
    UserCheck,
    Users,
} from "lucide-react";
import { User } from "@/stores/useAuthStore";
import { toast } from "sonner";

interface EditUserFormData {
    fullName: string;
    phone: string;
}

interface EditUserModalProps {
    user: User;
    trigger?: React.ReactNode;
    onSubmit: (userId: number, userData: Partial<User>) => Promise<void>;
}

export default function EditUserModal({
                                          user,
                                          trigger,
                                          onSubmit,
                                      }: EditUserModalProps) {
    const [open, setOpen] = useState(false);
    const {
        register,
        handleSubmit,

        formState: { errors , isLoading},
        reset,
    } = useForm<EditUserFormData>({
        defaultValues: {
            fullName: user.fullName || "",
            phone: user.phone || "",
        },
    });

    // Reset form khi modal mở
    useEffect(() => {
        if (open && user) {
            reset({
                fullName: user.fullName || "",
                phone: user.phone || "",
            });
        }
    }, [open, user, reset]);

    const onSubmitForm = async (data: EditUserFormData) => {
            const updatedData: Partial<User> = {
                fullName: data.fullName,
                phone: data.phone,
            };
            await onSubmit(user.id, updatedData);
            setOpen(false);}
    const handleCancel = () => {
        setOpen(false);
        reset();
    };
    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>{trigger}</DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto mx-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-3">
                        <Avatar className="h-12 w-12">
                            <AvatarFallback className="text-lg">
                                {user.fullName
                                    .split(" ")
                                    .map((n) => n[0])
                                    .join("")}
                            </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                            <div className="flex items-center gap-3">
                                <h2 className="text-xl font-semibold">Chỉnh sửa thông tin</h2>
                            </div>
                        </div>
                    </DialogTitle>
                    <DialogDescription>
                        Cập nhật thông tin cá nhân của tài khoản
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit(onSubmitForm)} className="space-y-6">
                    {/* Thông tin cơ bản */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-lg">
                                <UserIcon className="h-5 w-5" />
                                Thông tin cá nhân
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {/* Họ và tên */}
                            <div className="space-y-2">
                                <Label htmlFor="fullName">Họ và tên *</Label>
                                <Input
                                    id="fullName"
                                    {...register("fullName", {
                                        required: "Họ tên không được để trống",
                                    })}
                                    className={errors.fullName ? "border-red-500" : ""}
                                    disabled={isLoading}
                                    placeholder="Nhập họ và tên"
                                />
                                {errors.fullName && (
                                    <p className="text-sm text-red-500 mt-1">
                                        {errors.fullName.message}
                                    </p>
                                )}
                            </div>

                            {/* Email (readonly) */}
                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <div className="flex items-center gap-3">
                                    <Input
                                        id="email"
                                        value={user.email}
                                        readOnly
                                        className="bg-muted cursor-not-allowed"
                                    />
                                </div>
                            </div>

                            {/* Số điện thoại */}
                            <div className="space-y-2">
                                <Label htmlFor="phone">Số điện thoại *</Label>
                                <div className="flex items-center gap-3">
                                    <Input
                                        id="phone"
                                        {...register("phone", {
                                            required: "Số điện thoại không được để trống",
                                            pattern: {
                                                value: /^[0-9]{10,11}$/,
                                                message: "Số điện thoại không hợp lệ (10-11 chữ số)",
                                            },
                                        })}
                                        className={errors.phone ? "border-red-500" : ""}
                                        disabled={isLoading}
                                        placeholder="Nhập số điện thoại"
                                    />
                                </div>
                                {errors.phone && (
                                    <p className="text-sm text-red-500 mt-1">
                                        {errors.phone.message}
                                    </p>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Thông tin vai trò (readonly) */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-lg">
                                Thông tin vai trò
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div className="flex items-center justify-between">
                                <span className="font-medium">Vai trò:</span>
                                <div className="flex items-center gap-2">
                                    {(user.roles?.[0]?.name || "")}
                                </div>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="font-medium">Trạng thái:</span>
                                <Badge variant={user.isActive ? "default" : "secondary"}>
                                    {user.isActive ? "Hoạt động" : "Không hoạt động"}
                                </Badge>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Action buttons */}
                    <div className="flex justify-end gap-3 pt-4">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={handleCancel}
                            disabled={isLoading}
                        >
                            <X className="h-4 w-4 mr-2" />
                            Hủy
                        </Button>
                        <Button type="submit" disabled={isLoading}>
                            {isLoading ? (
                                <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                    Đang lưu...
                                </>
                            ) : (
                                <>
                                    <Save className="h-4 w-4 mr-2" />
                                    Lưu thay đổi
                                </>
                            )}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}