// Auth types
export interface SignUpData {
  email: string;
  password: string;
  fullName: string;
  phoneNumber?: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface ResetPasswordData {
  token: string;
  password: string;
}
