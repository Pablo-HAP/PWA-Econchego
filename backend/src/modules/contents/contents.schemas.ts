import { z } from "zod";

const listContentsQuerySchema = z.object({
	stage: z
		.enum(["PRENATAL", "PARTO", "POSPARTO", "PRIMEIRO_ANO"], { error: "Etapa inválida." })
		.optional(),
	// slug da categoria (ex.: "alimentacao")
	category: z.string().trim().min(1, "Categoria inválida.").optional(),
	week: z.coerce
		.number({ error: "Semana inválida." })
		.int("Semana inválida.")
		.min(1, "Semana inválida.")
		.max(42, "Semana inválida.")
		.optional(),
	month: z.coerce
		.number({ error: "Mês inválido." })
		.int("Mês inválido.")
		.min(0, "Mês inválido.")
		.max(24, "Mês inválido.")
		.optional(),
});

const idParamsSchema = z.object({
	id: z.string().min(1, "Identificador inválido."),
});

export { idParamsSchema, listContentsQuerySchema };