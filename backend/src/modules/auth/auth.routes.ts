import type { FastifyPluginAsync } from "fastify";
import { authenticate } from "../../lib/auth";
import { login, me, register } from "./auth.controller";

const authRoutes: FastifyPluginAsync = async (app) => {
	// Limites por IP. O cadastro é mais folgado porque várias gestantes podem
	// se cadastrar juntas no mesmo Wi-Fi (por exemplo, numa UBS).
	app.post(
		"/auth/register",
		{ config: { rateLimit: { max: 30, timeWindow: "1 hour" } } },
		register,
	);

	app.post(
		"/auth/login",
		{ config: { rateLimit: { max: 10, timeWindow: "5 minutes" } } },
		login,
	);

	app.get("/auth/me", { preHandler: [authenticate] }, me);
};

export { authRoutes };