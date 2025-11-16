"use client";

import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Upload, X, ImageIcon } from "lucide-react";
import Image from "next/image";

interface ImageUploadProps {
  label: string;
  value?: string;
  onChange: (imageUrl: string) => void;
  error?: string;
  required?: boolean;
  maxSize?: number; // in MB
  acceptedTypes?: string[];
}

const ImageUpload: React.FC<ImageUploadProps> = ({
  label,
  value,
  onChange,
  error,
  required = false,
  maxSize = 2,
  acceptedTypes = ["image/jpeg", "image/png", "image/webp"],
}) => {
  const [preview, setPreview] = useState<string | null>(value || null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string>("");

  const handleFileSelect = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploadError("");

    // Validate file type
    if (!acceptedTypes.includes(file.type)) {
      setUploadError(
        `Chỉ chấp nhận file: ${acceptedTypes
          .map((type) => type.split("/")[1])
          .join(", ")}`
      );
      return;
    }

    // Validate file size
    if (file.size > maxSize * 1024 * 1024) {
      setUploadError(`Kích thước file không được vượt quá ${maxSize}MB`);
      return;
    }

    setUploading(true);

    try {
      // Create preview URL
      const previewUrl = URL.createObjectURL(file);
      setPreview(previewUrl);

      // In a real app, you would upload to a server/cloud storage
      // For demo, we'll use the preview URL
      const mockUploadUrl = `/uploads/categories/${Date.now()}-${file.name}`;

      // Simulate upload delay
      await new Promise((resolve) => setTimeout(resolve, 1000));

      onChange(mockUploadUrl);
    } catch (error) {
      setUploadError("Lỗi khi tải lên ảnh");
      console.error("Upload error:", error);
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = () => {
    setPreview(null);
    onChange("");
    setUploadError("");
  };

  return (
    <div className="space-y-2">
      <Label className="text-sm font-medium text-gray-700">
        {label} {required && <span className="text-red-500">*</span>}
      </Label>

      <Card className="border-dashed border-2 border-gray-300 hover:border-gray-400 transition-colors">
        <CardContent className="p-6">
          {preview ? (
            <div className="space-y-4">
              <div className="relative aspect-video max-w-xs mx-auto">
                <Image
                  src={preview}
                  alt="Preview"
                  fill
                  className="object-cover rounded-lg"
                  sizes="(max-width: 320px) 100vw, 320px"
                />
              </div>
              <div className="flex justify-center space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    document.getElementById(`file-input-${label}`)?.click()
                  }
                  disabled={uploading}
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Thay đổi
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleRemove}
                  disabled={uploading}
                >
                  <X className="w-4 h-4 mr-2" />
                  Xóa
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-center space-y-4">
              <div className="mx-auto flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full">
                <ImageIcon className="w-8 h-8 text-gray-400" />
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-2">
                  Kéo thả ảnh vào đây hoặc click để chọn
                </p>
                <p className="text-xs text-gray-500">
                  PNG, JPG, WEBP lên đến {maxSize}MB
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                onClick={() =>
                  document.getElementById(`file-input-${label}`)?.click()
                }
                disabled={uploading}
              >
                {uploading ? (
                  <>
                    <div className="w-4 h-4 mr-2 animate-spin rounded-full border-2 border-gray-300 border-t-gray-600" />
                    Đang tải lên...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4 mr-2" />
                    Chọn ảnh
                  </>
                )}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <input
        id={`file-input-${label}`}
        type="file"
        accept={acceptedTypes.join(",")}
        onChange={handleFileSelect}
        className="hidden"
      />

      {(error || uploadError) && (
        <p className="text-sm text-red-500">{error || uploadError}</p>
      )}
    </div>
  );
};

export default ImageUpload;
