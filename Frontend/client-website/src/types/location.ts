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
