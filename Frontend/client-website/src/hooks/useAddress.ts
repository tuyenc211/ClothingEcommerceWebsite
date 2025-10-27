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

export interface Commune {
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

interface CommuneResponse {
  requestId: string;
  communes: Commune[];
}
const API_BASE = "https://production.cas.so/address-kit";

const normalizeName = (s: string) =>
  (s || "")
    .replace(/\s*\n\s*/g, " ")
    .replace(/\s+/g, " ")
    .trim();

export function useAddress(initialEffectiveDate = "2025-07-01") {
  const [effectiveDate, setEffectiveDate] =
    useState<string>(initialEffectiveDate);
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [communes, setCommunes] = useState<Commune[]>([]);
  const [isLoadingProvinces, setIsLoadingProvinces] = useState(false);
  const [isLoadingCommunes, setIsLoadingCommunes] = useState(false);
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
      setProvinces(cleaned);
    } catch {
      setProvinces([]);
      setError("Không tải được danh sách tỉnh/thành");
    } finally {
      setIsLoadingProvinces(false);
    }
  }, [effectiveDate]);

  useEffect(() => {
     fetchProvinces();
  }, [fetchProvinces]);

  // Fetch communes by province
  const fetchCommunes = async (provinceCode: string) => {
    if (!provinceCode) return;
    setIsLoadingCommunes(true);
    setError(null);
    try {
      const { data } = await axios.get<CommuneResponse>(
        `${API_BASE}/${effectiveDate}/provinces/${provinceCode}/communes`,
        { timeout: 15000 }
      );
      const cleaned = (data.communes || []).map((c) => ({
        ...c,
        name: normalizeName(c.name),
      }));
      setCommunes(cleaned);
    } catch {
      setCommunes([]);
      setError("Không tải được danh sách xã/phường");
    } finally {
      setIsLoadingCommunes(false);
    }
  };

  const clearCommunes = () => setCommunes([]);

  return {
    // data
    provinces,
    communes,
    // loading & error
    isLoadingProvinces,
    isLoadingCommunes,
    error,
    // actions
    fetchCommunes,
    clearCommunes,
    effectiveDate,
    setEffectiveDate,

    // Aliases để backward-compatible với code hiện tại
    wards: communes,
    isLoadingWards: isLoadingCommunes,
    fetchWards: fetchCommunes,
    clearWards: clearCommunes,
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
