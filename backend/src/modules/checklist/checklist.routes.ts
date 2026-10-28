import type { FastifyPluginAsync } from "fastify";
import { authenticate } from "../../lib/auth";
import { list, update } from "./checklist.controller";

const checklistRoutes: FastifyPluginAsync = async (app) => {
	app.addHook("preHandler", authenticate);

	app.get("/checklist", list);
	app.patch("/checklist/:itemId", update);
};

export { checklistRoutes };