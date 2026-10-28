import type { FastifyPluginAsync } from "fastify";
import { authenticate } from "../../lib/auth";
import { complete } from "./progress.controller";

const progressRoutes: FastifyPluginAsync = async (app) => {
	app.addHook("preHandler", authenticate);

	app.post("/contents/:id/complete", complete);
};

export { progressRoutes };