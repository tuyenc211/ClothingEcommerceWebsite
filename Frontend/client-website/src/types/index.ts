export interface SignUpData {
  fullName: string;
  email: string;
  password: string;
  phone: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface ResetPasswordData {
  password: string;
  confirmPassword: string;
}
export interface Color {
    id: number;
    name: string;
    code: string;
}
export interface Size {
    id: number;
    code: string;
    name: string;
    sortOrder: number;
}
