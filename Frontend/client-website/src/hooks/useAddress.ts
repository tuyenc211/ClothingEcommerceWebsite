"use client";

import axios from "axios";
import { useState, useEffect, useCallback } from "react";

// Response wrappers
export interface Province {
  code: string; // "01", "79", ...
  name: string; // "Thành phố Hà Nội", ...
  englishName: string;
  administrativeLevel: string; // "Tỉnh" | "Thành phố Trung ương" | ...
  decree: string; // "202/2025/QH15 - 12/06/2025" | ""
}

export interface Ward {
  code: string;
  name: string;
  englishName: string;
  administrativeLevel: string;
  provinceCode: string;
  provinceName: string;
  decree: string;
}

interface ProvinceResponse {
  requestId: string;
  provinces: Province[];
}

interface WardResponse {
  requestId: string;
  communes: Ward[];
}
const API_BASE = "/address-kit";

const normalizeName = (s: string) =>
  (s || "")
    .replace(/\s*\n\s*/g, " ")
    .replace(/\s+/g, " ")
    .trim();

export function useAddress(initialEffectiveDate = "2025-07-01") {
  const [effectiveDate, setEffectiveDate] =
    useState<string>(initialEffectiveDate);
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [wards, setWards] = useState<Ward[]>([]);
  const [isLoadingProvinces, setIsLoadingProvinces] = useState(false);
  const [isLoadingWards, setIsLoadingWards] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch provinces
  const fetchProvinces = useCallback(async () => {
    setIsLoadingProvinces(true);
    setError(null);
    try {
      const { data } = await axios.get<ProvinceResponse>(
        `${API_BASE}/${effectiveDate}/provinces`
      );
      const cleaned = (data.provinces || []).map((p) => ({
        ...p,
        name: normalizeName(p.name),
      }));
      console.log("✅ Provinces loaded:", cleaned.length);
      setProvinces(cleaned);
    } catch (error) {
      console.error("❌ Error fetching provinces:", error);
      setProvinces([]);
      setError("Không tải được danh sách tỉnh/thành");
    } finally {
      setIsLoadingProvinces(false);
    }
  }, [effectiveDate]);
  // Fetch wards by province
  const fetchWards = async (provinceCode: string) => {
    if (!provinceCode) return;
    setIsLoadingWards(true);
    setError(null);
    try {
      const { data } = await axios.get<WardResponse>(
        `${API_BASE}/${effectiveDate}/provinces/${provinceCode}/communes`,
        { timeout: 15000 }
      );
      const cleaned = (data.communes || []).map((c) => ({
        ...c,
        name: normalizeName(c.name),
      }));
      setWards(cleaned);
    } catch {
      setWards([]);
      setError("Không tải được danh sách xã/phường");
    } finally {
      setIsLoadingWards(false);
    }
  };

  const clearWards = () => setWards([]);

  return {
    // data
    provinces,
    wards,
    fetchProvinces,
    isLoadingProvinces,
    isLoadingWards,
    error,
    fetchWards,
    clearWards,
    effectiveDate,
    setEffectiveDate,
  };
}

/**
 * API Danh mục hành chính Việt Nam - Cục Thống Kê
 *
 * Nguồn: Tổng cục Thống kê Việt Nam
 * Đặc điểm: Dữ liệu được cập nhật theo nghị quyết Quốc Hội và nghị định Chính Phủ
 *
 * Các endpoint:
 * 1. GET /{effectiveDate}/provinces
 *    - Lấy danh sách tỉnh/thành phố hiệu lực tại thời điểm cụ thể
 *    - effectiveDate: "latest" (mới nhất) hoặc ngày cụ thể (VD: "2025-07-01")
 *
 * 2. GET /{effectiveDate}/provinces/{provinceCode}/communes
 *    - Lấy danh sách xã/phường thuộc một tỉnh/thành
 *    - provinceCode: Mã tỉnh (VD: "01" cho Hà Nội, "79" cho TP.HCM)
 *
 * 3. GET /{effectiveDate}/communes
 *    - Lấy tất cả xã/phường có hiệu lực tại thời điểm cụ thể
 *
 * Response format:
 * {
 *   "requestId": "string",
 *   "provinces": [...] // hoặc "communes": [...]
 * }
 *
 * Ví dụ sử dụng:
 * - Lấy tỉnh hiện tại: GET /latest/provinces
 * - Lấy xã của Hà Nội: GET /latest/provinces/01/communes
 * - Lấy tỉnh ngày 1/7/2025: GET /2025-07-01/provinces
 */
