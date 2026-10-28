import { z } from "zod";

const itemParamsSchema = z.object({
	itemId: z.string().min(1, "Identificador inválido."),
});

// done: marca ou desmarca como feito. scheduledAt: data agendada (null apaga).
const updateChecklistSchema = z
	.object({
		done: z.boolean({ error: "O campo 'feito' deve ser verdadeiro ou falso." }).optional(),
		scheduledAt: z.coerce.date({ error: "Informe uma data válida." }).nullable().optional(),
	})
	.refine(
		(data) => data.done !== undefined || data.scheduledAt !== undefined,
		"Informe se o item foi feito ou a data agendada.",
	);

export { itemParamsSchema, updateChecklistSchema };