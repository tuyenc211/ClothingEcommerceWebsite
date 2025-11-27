// ColorSelector.tsx
import React from "react";

interface Color {
    id: number;
    name: string;
    code: string;
}

interface ColorSelectorProps {
    availableColors: Color[];
    selectedColor: Color | null;
    onSelectColor: (color: Color) => void;
}

export default function  ColorSelector({availableColors, selectedColor, onSelectColor} : ColorSelectorProps) {
    return (
        <div>
            <h3 className="font-semibold text-gray-900 mb-3 sm:mb-4 text-sm sm:text-base">
                Màu sắc: {selectedColor?.name || "Chưa chọn"}
            </h3>
            <div className="flex flex-wrap gap-2 sm:gap-3">
                {availableColors.map((color) => (
                    <button
                        key={color.id}
                        onClick={() => onSelectColor(color)}
                        className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg border-1 transition-all ${
                            selectedColor?.id === color.id
                                ? "border-gray-900 border-2 ring-2 ring-gray-300"
                                : "border-gray-300 hover:border-gray-400"
                        }`}
                        style={{ backgroundColor: color.code }}
                        title={color.name}
                    />
                ))}
            </div>
        </div>
    );
};