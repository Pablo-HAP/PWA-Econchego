import { z } from "zod";

const statusSchema = z.enum(["OPEN", "IN_PROGRESS", "RESOLVED"], { error: "Status inválido." });

const createBugSchema = z.object({
	title: z
		.string({ error: "Informe um título." })
		.trim()
		.min(3, "O título deve ter no mínimo 3 caracteres.")
		.max(120, "O título deve ter no máximo 120 caracteres."),
	description: z
		.string({ error: "Descreva o problema." })
		.trim()
		.min(5, "A descrição deve ter no mínimo 5 caracteres.")
		.max(2000, "A descrição deve ter no máximo 2000 caracteres."),
});

const listBugsQuerySchema = z.object({
	status: statusSchema.optional(),
});

const bugParamsSchema = z.object({
	id: z.string().min(1, "Identificador inválido."),
});

const updateBugSchema = z.object({
	status: statusSchema,
});

export { bugParamsSchema, createBugSchema, listBugsQuerySchema, updateBugSchema };