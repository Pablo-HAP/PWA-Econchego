import type { FastifyPluginAsync } from "fastify";
import { authenticate } from "../../lib/auth";
import { forMe, getOne, list } from "./contents.controller";

const contentsRoutes: FastifyPluginAsync = async (app) => {
	// Todas as rotas deste módulo exigem login
	app.addHook("preHandler", authenticate);

	app.get("/contents", list);
	app.get("/contents/for-me", forMe);
	app.get("/contents/:id", getOne);
};

export { contentsRoutes };