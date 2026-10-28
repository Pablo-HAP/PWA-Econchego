import type { FastifyInstance } from "fastify";
import { authRoutes } from "../modules/auth/auth.routes";
import { badgesRoutes } from "../modules/badges/badges.routes";
import { bugsRoutes } from "../modules/bugs/bugs.routes";
import { checklistRoutes } from "../modules/checklist/checklist.routes";
import { contentsRoutes } from "../modules/contents/contents.routes";
import { feedbackRoutes } from "../modules/feedback/feedback.routes";
import { healthRoutes } from "../modules/health/health.routes";
import { progressRoutes } from "../modules/progress/progress.routes";
import { questionsRoutes } from "../modules/questions/questions.routes";

// Todas as rotas ficam sob /api (ex.: /api/auth/login, /api/contents/for-me).
// O módulo admin (métricas e validação de conteúdo) entra aqui na Fase 6.
const registerRoutes = async (app: FastifyInstance) => {
	await app.register(
		async (api) => {
			await api.register(healthRoutes);
			await api.register(authRoutes);
			await api.register(contentsRoutes);
			await api.register(progressRoutes);
			await api.register(checklistRoutes);
			await api.register(badgesRoutes);
			await api.register(questionsRoutes);
			await api.register(feedbackRoutes);
			await api.register(bugsRoutes);
		},
		{ prefix: "/api" },
	);
};

export { registerRoutes };