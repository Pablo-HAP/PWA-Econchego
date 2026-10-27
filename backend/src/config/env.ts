import "dotenv/config";
import { z } from "zod";

const envSchema = z.object({
	NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
	PORT: z.coerce.number().int().positive().default(3333),
	DATABASE_URL: z.string().min(1, "DATABASE_URL é obrigatória."),
	JWT_SECRET: z.string().min(32, "JWT_SECRET deve ter no mínimo 32 caracteres."),
	CORS_ORIGIN: z.string().min(1).default("http://localhost:5173"),
});

const env = envSchema.parse(process.env);

export { env };