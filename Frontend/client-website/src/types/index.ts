export interface SignUpData {
  fullName: string;
  email: string;
  password: string;
  phoneNumber: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface ResetPasswordData {
  password: string;
  confirmPassword: string;
}
