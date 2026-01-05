export interface Role {
  id: number;
  name: string;
}

export interface Address {
  id: number;
  user_id: number;
  line: string;
  ward?: string;
  district?: string;
  province?: string;
  country?: string;
  isDefault: boolean;
}

export interface User {
  id: number;
  email: string;
  password?: string;
  fullName: string;
  phone?: string;
  isActive: boolean;
  roles?: Role[];
  addresses?: Address[];
}
