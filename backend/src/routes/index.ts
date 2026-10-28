import type { FastifyInstance } from "fastify";
import { authRoutes } from "../modules/auth/auth.routes";
import { healthRoutes } from "../modules/health/health.routes";

// Todas as rotas ficam sob /api (ex.: /api/auth/login, /api/health).
// Os próximos módulos (contents, checklist...) entram aqui.
const registerRoutes = async (app: FastifyInstance) => {
	await app.register(
		async (api) => {
			await api.register(healthRoutes);
			await api.register(authRoutes);
		},
		{ prefix: "/api" },
	);
};

export { registerRoutes };