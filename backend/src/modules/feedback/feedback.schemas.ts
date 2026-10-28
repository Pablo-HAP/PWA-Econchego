import { z } from "zod";

const createFeedbackSchema = z.object({
	rating: z
		.number({ error: "Informe uma nota de 1 a 5." })
		.int("A nota deve ser um número inteiro.")
		.min(1, "A nota deve ser de 1 a 5.")
		.max(5, "A nota deve ser de 1 a 5."),
	comment: z.string().trim().max(500, "O comentário deve ter no máximo 500 caracteres.").optional(),
	// Opcional: avaliar um conteúdo específico. Sem ele, é uma avaliação geral do app.
	contentId: z.string().min(1, "Identificador inválido.").optional(),
});

export { createFeedbackSchema };