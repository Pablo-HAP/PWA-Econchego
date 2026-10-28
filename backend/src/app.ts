import Fastify from "fastify";
import cors from "@fastify/cors";
import helmet from "@fastify/helmet";
import jwt from "@fastify/jwt";
import rateLimit from "@fastify/rate-limit";
import { ZodError } from "zod";
import { env } from "./config/env";
import { AppError } from "./lib/errors";
import { prisma } from "./lib/prisma";
import { registerRoutes } from "./routes";

const app = Fastify({
	logger: true,
	// Atrás do Render/Vercel, sem isso todo mundo aparece com o mesmo IP
	// e o rate limit bloquearia todas as usuárias juntas.
	trustProxy: true,
});

app.register(helmet);

app.register(cors, {
	origin: env.CORS_ORIGIN.split(",").map((origin) => origin.trim()),
	methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
});

// global: false => só limita as rotas que pedirem (login e cadastro)
app.register(rateLimit, {
	global: false,
	errorResponseBuilder: () => ({
		statusCode: 429,
		message: "Muitas tentativas. Aguarde alguns minutos e tente novamente.",
	}),
});

app.register(jwt, {
	secret: env.JWT_SECRET,
	sign: { expiresIn: "7d" },
});

// Handler de erros único: os controllers não precisam de try/catch.
app.setErrorHandler((error, request, reply) => {
	if (error instanceof ZodError) {
		const issues = error.issues.map((issue) => ({
			field: issue.path.join("."),
			message: issue.message,
		}));

		return reply.code(400).send({
			message: issues[0]?.message ?? "Verifique os dados informados.",
			issues,
		});
	}

	if (error instanceof AppError) {
		return reply.code(error.statusCode).send({ message: error.message });
	}

	// Erros 4xx do próprio Fastify e dos plugins (JSON inválido, rate limit etc.)
	const { statusCode, message } = (error ?? {}) as { statusCode?: number; message?: string };

	if (statusCode && statusCode >= 400 && statusCode < 500) {
		return reply.code(statusCode).send({ message: message ?? "Requisição inválida." });
	}
	request.log.error(error);
	return reply.code(500).send({ message: "Erro interno. Tente novamente em instantes." });
});

app.register(registerRoutes);

app.addHook("onClose", async () => {
	await prisma.$disconnect();
});

export { app };