// SizeSelector.tsx
import React from "react";

interface Size {
    id: number;
    name: string;
    code: string;
    sortOrder: number;
}

interface SizeSelectorProps {
    availableSizes: Size[];
    selectedSize: Size | null;
    onSelectSize: (size: Size) => void;
}

export default function SizeSelector({
                                         availableSizes,
                                         selectedSize,
                                         onSelectSize,
                                     }: SizeSelectorProps) {
    return (
        <div>
            <h3 className="font-semibold text-gray-900 mb-3 sm:mb-4 text-sm sm:text-base">
                Kích cỡ: {selectedSize?.code || "Chưa chọn"}
            </h3>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 sm:gap-3">
                {availableSizes.map((size) => (
                    <button
                        key={size.id}
                        onClick={() => onSelectSize(size)}
                        className={`py-2 sm:py-3 px-3 sm:px-4 border rounded-lg text-xs sm:text-sm font-medium transition-colors ${
                            selectedSize?.id === size.id
                                ? "border-gray-900 bg-gray-900 text-white"
                                : "border-gray-300 hover:border-gray-400 bg-white text-gray-700"
                        }`}
                    >
                        {size.code}
                    </button>
                ))}
            </div>
        </div>
    );
}