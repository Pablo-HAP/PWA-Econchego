import Fastify from "fastify";
import cors from "@fastify/cors";
import jwt from "@fastify/jwt";
import { env } from "./config/env";
import { prisma } from "./lib/prisma";
import { registerRoutes } from "./routes";

const app = Fastify({ logger: true });

app.register(cors, {
	origin: true,
	credentials: true,
});

app.register(jwt, {
	secret: env.JWT_SECRET,
});

app.register(registerRoutes);

app.addHook("onClose", async () => {
	await prisma.$disconnect();
});

export { app };