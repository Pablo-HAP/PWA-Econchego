import type { FastifyReply, FastifyRequest } from "fastify";
import { loginSchema, registerSchema } from "./auth.schemas";
import { getAuthenticatedUser, loginUser, registerUser } from "./auth.service";
import type { AuthResponse, AuthUser } from "./auth.types";

// O token é assinado aqui, no controller, porque é ele que conhece o reply.
// O service só cuida de regra de negócio e banco.
const buildAuthResponse = async (reply: FastifyReply, user: AuthUser): Promise<AuthResponse> => {
	const accessToken = await reply.jwtSign({
		sub: user.id,
		email: user.email,
		role: user.role,
	});

	return { accessToken, user };
};

const register = async (request: FastifyRequest, reply: FastifyReply) => {
	const body = registerSchema.parse(request.body);
	const user = await registerUser(body);

	return reply.code(201).send(await buildAuthResponse(reply, user));
};

const login = async (request: FastifyRequest, reply: FastifyReply) => {
	const body = loginSchema.parse(request.body);
	const user = await loginUser(body);

	return reply.send(await buildAuthResponse(reply, user));
};

const me = async (request: FastifyRequest, reply: FastifyReply) => {
	const user = await getAuthenticatedUser(request.user.sub);

	return reply.send({ user });
};

export { login, register, me };