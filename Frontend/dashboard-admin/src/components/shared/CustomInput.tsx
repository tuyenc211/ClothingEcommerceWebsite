"use client";

import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface CustomInputProps {
  label: string;
  name: string;
  type?: string;
  value?: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  error?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  maxLength?: number;
}

const CustomInput: React.FC<CustomInputProps> = ({
  label,
  name,
  type = "text",
  value,
  onChange,
  placeholder,
  error,
  required = false,
  disabled = false,
  className = "",
  maxLength,
}) => {
  return (
    <div className="space-y-2">
      <Label htmlFor={name} className="text-sm font-medium text-gray-700">
        {label} {required && <span className="text-red-500">*</span>}
      </Label>
      <Input
        id={name}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        className={`${error ? "border-destructive" : ""} ${className}`}
        required={required}
        maxLength={maxLength}
      />
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
};

export default CustomInput;
