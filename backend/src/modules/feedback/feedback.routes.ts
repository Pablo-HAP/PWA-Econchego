import type { FastifyPluginAsync } from "fastify";
import { authenticate } from "../../lib/auth";
import { create } from "./feedback.controller";

const feedbackRoutes: FastifyPluginAsync = async (app) => {
	app.post("/feedback", { preHandler: [authenticate] }, create);
};

export { feedbackRoutes };