// lib/jwt.ts
import { jwtVerify } from "jose";

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET);

export async function verifyToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    // payload chứa { id, email, iat, exp }
    return payload; // trả về object nếu hợp lệ
  } catch {
    return null;
  }
}
