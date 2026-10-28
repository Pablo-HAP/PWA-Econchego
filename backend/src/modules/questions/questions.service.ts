import { AppError } from "../../lib/errors";
import { prisma } from "../../lib/prisma";
import { awardBadges } from "../badges/badges.service";

const questionSelect = {
	id: true,
	text: true,
	answer: true,
	answeredAt: true,
	status: true,
	createdAt: true,
} as const;

const createQuestion = async (userId: string, text: string) => {
	const question = await prisma.question.create({
		data: { userId, text },
		select: questionSelect,
	});

	const newBadges = await awardBadges(userId);

	return { question, newBadges };
};

// Dúvidas da própria usuária, da mais recente para a mais antiga
const listMyQuestions = (userId: string) =>
	prisma.question.findMany({
		where: { userId },
		select: questionSelect,
		orderBy: { createdAt: "desc" },
	});

// Admin: as mais antigas primeiro, para responder na ordem.
// Não traz nome nem e-mail de quem perguntou (coleta mínima de dados, LGPD).
const listQuestions = (status?: "PENDING" | "ANSWERED") =>
	prisma.question.findMany({
		where: status ? { status } : {},
		select: questionSelect,
		orderBy: { createdAt: "asc" },
	});

const answerQuestion = async (id: string, answer: string) => {
	const existing = await prisma.question.findUnique({
		where: { id },
		select: { id: true },
	});

	if (!existing) {
		throw new AppError("Dúvida não encontrada.", 404);
	}

	return prisma.question.update({
		where: { id },
		data: { answer, answeredAt: new Date(), status: "ANSWERED" },
		select: questionSelect,
	});
};

export { answerQuestion, createQuestion, listMyQuestions, listQuestions };