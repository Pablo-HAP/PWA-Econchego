import type { FastifyPluginAsync } from "fastify";
import { authenticate } from "../../lib/auth";
import { exportData, removeAccount } from "./privacy.controller";

const privacyRoutes: FastifyPluginAsync = async (app) => {
	app.get("/privacy/export", { preHandler: [authenticate] }, exportData);

	// Limite baixo: a rota confere senha e não pode servir para adivinhá-la
	app.delete(
		"/privacy/account",
		{
			preHandler: [authenticate],
			config: { rateLimit: { max: 5, timeWindow: "10 minutes" } },
		},
		removeAccount,
	);
};

export { privacyRoutes };
