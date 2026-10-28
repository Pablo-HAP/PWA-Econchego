import type { FastifyPluginAsync } from "fastify";
import { authenticate, requireAdmin } from "../../lib/auth";
import { create, list, update } from "./bugs.controller";

const bugsRoutes: FastifyPluginAsync = async (app) => {
	// Qualquer usuária logada pode relatar um problema
	app.post("/bugs", { preHandler: [authenticate] }, create);

	// Painel admin
	app.get("/bugs", { preHandler: [requireAdmin] }, list);
	app.patch("/bugs/:id", { preHandler: [requireAdmin] }, update);
};

export { bugsRoutes };