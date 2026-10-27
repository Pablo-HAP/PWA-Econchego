import bcrypt from "bcryptjs";
import { prisma } from "../../lib/prisma";
import type { AuthResponse, AuthUser, JwtPayload } from "./auth.types";
import { authUserSelect } from "./auth.schemas";

type RegisterInput = {
	name: string;
	email: string;
	password: string;
	phone?: string;
};

type LoginInput = {
	email: string;
	password: string;
};

type JwtSigner = {
	(payload: JwtPayload): Promise<string>;
};

const mapUser = (user: {
	id: string;
	name: string;
	email: string;
	phone: string | null;
}): AuthUser => ({
	id: user.id,
	name: user.name,
	email: user.email,
	phone: user.phone,
});

const buildAuthResponse = async (
	user: {
		id: string;
		name: string;
		email: string;
		phone: string | null;
	},
	signToken: JwtSigner,
): Promise<AuthResponse> => {
	const accessToken = await signToken({ sub: user.id, email: user.email });

	return {
		accessToken,
		user: mapUser(user),
	};
};

const registerUser = async (input: RegisterInput, signToken: JwtSigner) => {
	const existingUser = await prisma.user.findUnique({
		where: { email: input.email },
	});

	if (existingUser) {
		throw new Error("E-mail já cadastrado.");
	}

	const passwordHash = await bcrypt.hash(input.password, 10);

	const user = await prisma.user.create({
		data: {
			name: input.name,
			email: input.email,
			passwordHash,
			phone: input.phone,
		},
		select: authUserSelect,
	});

	return buildAuthResponse(user, signToken);
};

const loginUser = async (input: LoginInput, signToken: JwtSigner) => {
	const user = await prisma.user.findUnique({
		where: { email: input.email },
	});

	if (!user) {
		throw new Error("Credenciais inválidas.");
	}

	const isPasswordValid = await bcrypt.compare(input.password, user.passwordHash);

	if (!isPasswordValid) {
		throw new Error("Credenciais inválidas.");
	}

	return buildAuthResponse(
		{
			id: user.id,
			name: user.name,
			email: user.email,
			phone: user.phone,
		},
		signToken,
	);
};

const getAuthenticatedUser = async (userId: string) => {
	const user = await prisma.user.findUnique({
		where: { id: userId },
		select: authUserSelect,
	});

	if (!user) {
		throw new Error("Usuário não encontrado.");
	}

	return mapUser(user);
};

export { registerUser, loginUser, getAuthenticatedUser };