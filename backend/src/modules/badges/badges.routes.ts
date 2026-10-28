import type { FastifyPluginAsync } from "fastify";
import { authenticate } from "../../lib/auth";
import { list } from "./badges.controller";

const badgesRoutes: FastifyPluginAsync = async (app) => {
	app.addHook("preHandler", authenticate);

	app.get("/badges", list);
};

export { badgesRoutes };