import type { FastifyInstance } from "fastify";
import { authRoutes } from "../modules/auth/auth.routes";
import { healthRoutes } from "../modules/health/health.routes";
//import { usersRoutes } from "../modules/users/users.routes";

const registerRoutes = async (app: FastifyInstance) => {
	await app.register(authRoutes);
	await app.register(healthRoutes);
	await app.register(usersRoutes);
};

export { registerRoutes };