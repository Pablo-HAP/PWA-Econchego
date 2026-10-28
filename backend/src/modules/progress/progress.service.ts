import { AppError } from "../../lib/errors";
import { prisma } from "../../lib/prisma";
import { awardBadges } from "../badges/badges.service";

// Marca o conteúdo como concluído. Repetir a chamada não duplica nada
// (o banco tem unique em userId + contentId) e devolve a data original.
// newBadges traz os selos conquistados agora (lista vazia se nenhum).
const completeContent = async (userId: string, contentId: string) => {
	const content = await prisma.content.findFirst({
		where: { id: contentId, published: true },
		select: { id: true },
	});

	if (!content) {
		throw new AppError("Conteúdo não encontrado.", 404);
	}

	const progress = await prisma.contentProgress.upsert({
		where: { userId_contentId: { userId, contentId } },
		update: {},
		create: { userId, contentId },
		select: { contentId: true, completedAt: true },
	});

	const newBadges = await awardBadges(userId);

	return { progress, newBadges };
};

export { completeContent };