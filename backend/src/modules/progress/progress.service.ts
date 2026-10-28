import { AppError } from "../../lib/errors";
import { prisma } from "../../lib/prisma";

// Marca o conteúdo como concluído. Repetir a chamada não duplica nada
// (o banco tem unique em userId + contentId) e devolve a data original.
// Na Fase 4, é aqui que entra a chamada de awardBadges(userId).
const completeContent = async (userId: string, contentId: string) => {
	const content = await prisma.content.findFirst({
		where: { id: contentId, published: true },
		select: { id: true },
	});

	if (!content) {
		throw new AppError("Conteúdo não encontrado.", 404);
	}

	return prisma.contentProgress.upsert({
		where: { userId_contentId: { userId, contentId } },
		update: {},
		create: { userId, contentId },
		select: { contentId: true, completedAt: true },
	});
};

export { completeContent };