import type { FastifyRequest } from "fastify";
import type { JwtPayload } from "../modules/auth/auth.types";
import { AppError } from "./errors";

// Diz ao TypeScript o formato do token, para request.user ter tipo.
declare module "@fastify/jwt" {
	interface FastifyJWT {
		payload: JwtPayload;
		user: JwtPayload;
	}
}

// Uso nas rotas privadas: { preHandler: [authenticate] }
const authenticate = async (request: FastifyRequest) => {
	try {
		await request.jwtVerify();
	} catch {
		throw new AppError("Sessão inválida ou expirada. Entre novamente.", 401);
	}
};

// Uso nas rotas do painel: { preHandler: [requireAdmin] }
const requireAdmin = async (request: FastifyRequest) => {
	await authenticate(request);

	if (request.user.role !== "ADMIN") {
		throw new AppError("Acesso restrito à administração.", 403);
	}
};

export { authenticate, requireAdmin };