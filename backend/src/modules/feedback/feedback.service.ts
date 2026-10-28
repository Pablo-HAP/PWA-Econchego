import { AppError } from "../../lib/errors";
import { prisma } from "../../lib/prisma";
import type { z } from "zod";
import type { createFeedbackSchema } from "./feedback.schemas";

type FeedbackInput = z.infer<typeof createFeedbackSchema>;

const feedbackSelect = {
	id: true,
	rating: true,
	comment: true,
	contentId: true,
	createdAt: true,
} as const;

// Avaliação de um conteúdo: se a usuária já avaliou aquele conteúdo, atualiza a nota
// (assim uma pessoa não pesa mais de uma vez na média). Avaliação geral (sem contentId)
// pode ser enviada mais de uma vez.
const saveFeedback = async (userId: string, input: FeedbackInput) => {
	const comment = input.comment || null;

	if (input.contentId) {
		const content = await prisma.content.findFirst({
			where: { id: input.contentId, published: true },
			select: { id: true },
		});

		if (!content) {
			throw new AppError("Conteúdo não encontrado.", 404);
		}

		const existing = await prisma.feedback.findFirst({
			where: { userId, contentId: input.contentId },
			select: { id: true },
		});

		if (existing) {
			const feedback = await prisma.feedback.update({
				where: { id: existing.id },
				data: { rating: input.rating, comment },
				select: feedbackSelect,
			});

			return { feedback, created: false };
		}
	}

	const feedback = await prisma.feedback.create({
		data: { userId, rating: input.rating, comment, contentId: input.contentId ?? null },
		select: feedbackSelect,
	});

	return { feedback, created: true };
};

export { saveFeedback };