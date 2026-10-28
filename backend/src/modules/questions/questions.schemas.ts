import { z } from "zod";

const createQuestionSchema = z.object({
	text: z
		.string({ error: "Escreva sua dúvida." })
		.trim()
		.min(5, "A dúvida deve ter no mínimo 5 caracteres.")
		.max(1000, "A dúvida deve ter no máximo 1000 caracteres."),
});

const listQuestionsQuerySchema = z.object({
	status: z.enum(["PENDING", "ANSWERED"], { error: "Status inválido." }).optional(),
});

const questionParamsSchema = z.object({
	id: z.string().min(1, "Identificador inválido."),
});

const answerQuestionSchema = z.object({
	answer: z
		.string({ error: "Escreva a resposta." })
		.trim()
		.min(2, "A resposta deve ter no mínimo 2 caracteres.")
		.max(2000, "A resposta deve ter no máximo 2000 caracteres."),
});

export {
	answerQuestionSchema,
	createQuestionSchema,
	listQuestionsQuerySchema,
	questionParamsSchema,
};