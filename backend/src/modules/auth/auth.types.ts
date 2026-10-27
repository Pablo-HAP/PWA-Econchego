export type AuthUser = {
	id: string;
	name: string;
	email: string;
	phone: string | null;
};

export type AuthResponse = {
	accessToken: string;
	user: AuthUser;
};

export type JwtPayload = {
	sub: string;
	email: string;
};