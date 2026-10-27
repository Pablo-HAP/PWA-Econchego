import type { FastifyReply, FastifyRequest } from 'fastify';
import { ZodError } from 'zod';
import { loginSchema, registerSchema } from './auth.schemas';
import { getAuthenticatedUser, loginUser, registerUser } from './auth.service';
import type { JwtPayload } from './auth.types';

const fieldLabels: Record<string, string> = {
	name: 'nome',
	email: 'e-mail',
	password: 'senha',
	phone: 'telefone',
};

const formatValidationIssue = (path: Array<string | number>, message: string, code: string) => {
	const field = path[0];
	const fieldName = typeof field === 'string' ? fieldLabels[field] ?? field : null;

	if (message && message !== 'Invalid input') {
		return message;
	}

	if (code === 'invalid_type' && fieldName) {
		return `O campo ${fieldName} é obrigatório.`;
	}

	if (code === 'too_small' && field === 'password') {
		return 'A senha deve ter no mínimo 6 caracteres.';
	}

	if (code === 'too_small' && field === 'name') {
		return 'O nome deve ter no mínimo 2 caracteres.';
	}

	if (code === 'too_small' && field === 'phone') {
		return 'O telefone deve ter no mínimo 8 caracteres.';
	}

	if ((code === 'invalid_format' || code === 'invalid_string') && field === 'email') {
		return 'Informe um e-mail válido.';
	}

	return 'Verifique os dados informados.';
};

const handleValidationError = (error: ZodError, reply: FastifyReply) => {
	const message = error.issues.map((issue) => formatValidationIssue(issue.path, issue.message, issue.code)).join(' ');

	return reply.code(400).send({
		message: message || 'Verifique os dados informados.',
	});
};

const handleAuthError = (error: unknown, reply: FastifyReply) => {
	if (error instanceof ZodError) {
		return handleValidationError(error, reply);
	}

	if (!(error instanceof Error)) {
		throw error;
	}

	switch (error.message) {
		case 'E-mail já cadastrado.':
			return reply.code(409).send({ message: error.message });
		case 'Credenciais inválidas.':
			return reply.code(401).send({ message: error.message });
		case 'Usuário não encontrado.':
			return reply.code(404).send({ message: error.message });
		default:
			throw error;
	}
};

const login = async (request: FastifyRequest, reply: FastifyReply) => {
	try {
		const body = loginSchema.parse(request.body);
		const auth = await loginUser(body, reply.jwtSign.bind(reply));

		return reply.send(auth);
	} catch (error) {
		return handleAuthError(error, reply);
	}
};

const register = async (request: FastifyRequest, reply: FastifyReply) => {
	try {
		const body = registerSchema.parse(request.body);
		const auth = await registerUser(body, reply.jwtSign.bind(reply));

		return reply.code(201).send(auth);
	} catch (error) {
		return handleAuthError(error, reply);
	}
};

const me = async (request: FastifyRequest, reply: FastifyReply) => {
	try {
		await request.jwtVerify();
		const payload = request.user as JwtPayload;
		const user = await getAuthenticatedUser(payload.sub);

		return reply.send({ user });
	} catch (error) {
		return handleAuthError(error, reply);
	}
};

export { login, register, me };