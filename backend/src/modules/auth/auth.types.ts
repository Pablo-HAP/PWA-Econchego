import type { z } from "zod";
import type { loginSchema, registerSchema } from "./auth.schemas";

export type Role = "USER" | "ADMIN";

export type AuthUser = {
	id: string;
	name: string;
	email: string;
	role: Role;
	dueDate: Date | null;
	birthDate: Date | null;
	ubsReference: string | null;
};

export type AuthResponse = {
	accessToken: string;
	user: AuthUser;
};

export type JwtPayload = {
	sub: string;
	email: string;
	role: Role;
};

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;