import type { FastifyPluginAsync } from "fastify";
import { authenticate, requireAdmin } from "../../lib/auth";
import { answer, create, listAll, listMine } from "./questions.controller";

const questionsRoutes: FastifyPluginAsync = async (app) => {
	// Usuária
	app.post("/questions", { preHandler: [authenticate] }, create);
	app.get("/questions/mine", { preHandler: [authenticate] }, listMine);

	// Painel admin
	app.get("/questions", { preHandler: [requireAdmin] }, listAll);
	app.patch("/questions/:id/answer", { preHandler: [requireAdmin] }, answer);
};

export { questionsRoutes };