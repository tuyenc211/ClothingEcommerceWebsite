"use client";

import axios from "axios";
import { useState, useEffect } from "react";

const API_BASE_URL = "http://wavebear.com.vn/api/location-viet-nam";

export interface Province {
  province_id: number;
  code: string;
  name: string;
  full_name: string;
  name_en: string;
  full_name_en: string;
  type: string;
  type_en: string;
}

export interface Ward {
  ward_id: number;
  code: string;
  name: string;
  type: string;
  province_code: string;
  full_name: string;
  name_en: string;
  full_name_en: string;
  type_en: string;
}

export function useAddress() {
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [wards, setWards] = useState<Ward[]>([]);
  const [isLoadingProvinces, setIsLoadingProvinces] = useState(false);
  const [isLoadingWards, setIsLoadingWards] = useState(false);

  // Fetch danh sách tỉnh/thành phố
  useEffect(() => {
    const fetchProvinces = async () => {
      setIsLoadingProvinces(true);
      try {
        const response = await axios.get(`${API_BASE_URL}/provider`);
        console.log("Provinces:", response.data);
        setProvinces(response.data || []);
      } catch (error) {
        console.error("Lỗi khi lấy danh sách tỉnh/thành phố:", error);
        setProvinces([]);
      } finally {
        setIsLoadingProvinces(false);
      }
    };

    fetchProvinces();
  }, []);

  // Fetch xã/phường theo mã tỉnh
  const fetchWards = async (provinceCode: string) => {
    setIsLoadingWards(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/ward/${provinceCode}`);
      console.log("Wards:", response.data);
      setWards(response.data || []);
    } catch (error) {
      console.error("Lỗi khi lấy danh sách xã/phường:", error);
      setWards([]);
    } finally {
      setIsLoadingWards(false);
    }
  };

  // Clear wards when province changes
  const clearWards = () => {
    setWards([]);
  };

  return {
    provinces,
    wards,
    isLoadingProvinces,
    isLoadingWards,
    fetchWards,
    clearWards,
  };
}

// 4. Chi Tiết Các Endpoint
// 4.1 Danh sách Tỉnh/Thành phố
// Endpoint:
// GET http://wavebear.com.vn/api/location-viet-nam/provider
// Mục đích: Lấy toàn bộ tỉnh/thành phố.

// Ví dụ JavaScript:

// javascriptCopy
// fetch("http://wavebear.com.vn/api/location-viet-nam/provider")
//   .then(res => res.json())
//   .then(results => console.log(results));
//   4.3 Xã/Phường theo tỉnh
// Endpoint:
// GET : http://wavebear.com.vn/api/location-viet-nam/ward/{provinceCode}
// Mục đích: Lấy tất cả xã/phường của tỉnh.

// Ví dụ JavaScript:

// javascriptCopy
// const provinceCode = 37;
// fetch(`http://wavebear.com.vn/api/location-viet-nam/ward/${provinceCode}`)
//   .then(res => res.json())
//   .then(results => console.log(results));

//   Tóm Tắt Endpoint
//  Lấy toàn bộ tỉnh/thành phố
// GET / api / location - viet - nam / provider
// Lấy tất cả xã/phường của tỉnh có mã 'provinceCode'.
// GET /api/location-viet-nam/ward/{provinceCode}
