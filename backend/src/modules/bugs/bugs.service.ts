import { AppError } from "../../lib/errors";
import { prisma } from "../../lib/prisma";

type BugStatusName = "OPEN" | "IN_PROGRESS" | "RESOLVED";

const bugSelect = {
	id: true,
	title: true,
	description: true,
	status: true,
	createdAt: true,
	resolvedAt: true,
} as const;

// O relato não guarda quem enviou (sem dado pessoal). O texto não deve conter dados de saúde.
const createBug = (input: { title: string; description: string }) =>
	prisma.bugReport.create({
		data: { title: input.title, description: input.description },
		select: bugSelect,
	});

const listBugs = (status?: BugStatusName) =>
	prisma.bugReport.findMany({
		where: status ? { status } : {},
		select: bugSelect,
		orderBy: { createdAt: "desc" },
	});

// Ao resolver, grava a data; se reabrir, apaga. A data alimenta a métrica "bugs por mês".
const updateBugStatus = async (id: string, status: BugStatusName) => {
	const existing = await prisma.bugReport.findUnique({
		where: { id },
		select: { id: true },
	});

	if (!existing) {
		throw new AppError("Relato não encontrado.", 404);
	}

	return prisma.bugReport.update({
		where: { id },
		data: { status, resolvedAt: status === "RESOLVED" ? new Date() : null },
		select: bugSelect,
	});
};

export { createBug, listBugs, updateBugStatus };