import type { FastifyInstance } from "fastify";
import { authRoutes } from "../modules/auth/auth.routes";
import { checklistRoutes } from "../modules/checklist/checklist.routes";
import { contentsRoutes } from "../modules/contents/contents.routes";
import { healthRoutes } from "../modules/health/health.routes";
import { progressRoutes } from "../modules/progress/progress.routes";

// Todas as rotas ficam sob /api (ex.: /api/auth/login, /api/contents/for-me).
// Os próximos módulos (questions, feedback, bugs, admin) entram aqui.
const registerRoutes = async (app: FastifyInstance) => {
	await app.register(
		async (api) => {
			await api.register(healthRoutes);
			await api.register(authRoutes);
			await api.register(contentsRoutes);
			await api.register(progressRoutes);
			await api.register(checklistRoutes);
		},
		{ prefix: "/api" },
	);
};

export { registerRoutes };