import type { FastifyPluginAsync } from "fastify";
import { requireAdmin } from "../../lib/auth";
import {
	categories,
	create,
	exportMetrics,
	getContent,
	listContents,
	metrics,
	update,
	validate,
} from "./admin.controller";

const adminRoutes: FastifyPluginAsync = async (app) => {
	// Todas as rotas deste módulo são só para ADMIN
	app.addHook("preHandler", requireAdmin);

	app.get("/admin/metrics", metrics);
	app.get("/admin/metrics/export", exportMetrics);

	app.get("/admin/categories", categories);
	app.get("/admin/contents", listContents);
	app.get("/admin/contents/:id", getContent);
	app.post("/admin/contents", create);
	app.put("/admin/contents/:id", update);
	app.patch("/admin/contents/:id/validate", validate);
};

export { adminRoutes };
