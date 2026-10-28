import bcrypt from "bcryptjs";
import { AppError } from "../../lib/errors";
import { prisma } from "../../lib/prisma";
import type { AuthUser, LoginInput, RegisterInput } from "./auth.types";

// Versão do termo de consentimento (LGPD). Se o texto do termo mudar, aumente a versão.
const CONSENT_VERSION = "v1";

// Campos que podem sair da API. O passwordHash nunca entra aqui.
const authUserSelect = {
	id: true,
	name: true,
	email: true,
	role: true,
	dueDate: true,
	birthDate: true,
	ubsReference: true,
} as const;

const isUniqueViolation = (error: unknown) =>
	typeof error === "object" && error !== null && "code" in error && error.code === "P2002";

const registerUser = async (input: RegisterInput): Promise<AuthUser> => {
	const existingUser = await prisma.user.findUnique({
		where: { email: input.email },
		select: { id: true },
	});

	if (existingUser) {
		throw new AppError("E-mail já cadastrado.", 409);
	}

	const passwordHash = await bcrypt.hash(input.password, 10);

	try {
		return await prisma.user.create({
			data: {
				name: input.name,
				email: input.email,
				passwordHash,
				// Guarda só a data da fase escolhida
				dueDate: input.phase === "PREGNANT" ? (input.dueDate ?? null) : null,
				birthDate: input.phase === "BABY" ? (input.birthDate ?? null) : null,
				ubsReference: input.ubsReference ?? null,
				consentAt: new Date(),
				consentVersion: CONSENT_VERSION,
			},
			select: authUserSelect,
		});
	} catch (error) {
		// Duas requisições com o mesmo e-mail ao mesmo tempo
		if (isUniqueViolation(error)) {
			throw new AppError("E-mail já cadastrado.", 409);
		}
		throw error;
	}
};

const loginUser = async (input: LoginInput): Promise<AuthUser> => {
	const found = await prisma.user.findUnique({
		where: { email: input.email },
		select: { ...authUserSelect, passwordHash: true },
	});

	if (!found) {
		throw new AppError("Credenciais inválidas.", 401);
	}

	const { passwordHash, ...user } = found;
	const isPasswordValid = await bcrypt.compare(input.password, passwordHash);

	if (!isPasswordValid) {
		throw new AppError("Credenciais inválidas.", 401);
	}

	return user;
};

const getAuthenticatedUser = async (userId: string): Promise<AuthUser> => {
	const user = await prisma.user.findUnique({
		where: { id: userId },
		select: authUserSelect,
	});

	// Token válido, mas a conta foi excluída
	if (!user) {
		throw new AppError("Sessão inválida. Entre novamente.", 401);
	}

	return user;
};

export { registerUser, loginUser, getAuthenticatedUser };