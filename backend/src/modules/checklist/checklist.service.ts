import type { Prisma } from "../../../generated/prisma/client";
import { AppError } from "../../lib/errors";
import { getPhaseForUser } from "../../lib/pregnancy";
import { prisma } from "../../lib/prisma";
import type { ChecklistStatus, UpdateChecklistInput } from "./checklist.types";

const computeStatus = (
	position: number,
	start: number,
	end: number,
	done: boolean,
): ChecklistStatus => {
	if (done) {
		return "DONE";
	}
	if (position < start) {
		return "UPCOMING";
	}
	if (position > end) {
		return "OVERDUE";
	}
	return "OPEN";
};

// Checklist da fase da usuária, já com o status de cada item calculado.
// Grávida: itens com janela em semanas. Mãe de bebê: itens com janela em meses
// (do bebê ou da própria mãe no pós-parto). O front usa o status para montar os lembretes.
const listChecklist = async (userId: string) => {
	const phase = await getPhaseForUser(userId);

	if (phase.kind === "UNKNOWN") {
		return { phase, items: [] };
	}

	const isPregnant = phase.kind === "PREGNANT";
	const unit = isPregnant ? "WEEK" : "MONTH";
	const position = phase.kind === "PREGNANT" ? phase.week : phase.months;

	const where: Prisma.ChecklistItemWhereInput = isPregnant
		? { weekStart: { not: null } }
		: { monthStart: { not: null } };

	const orderBy: Prisma.ChecklistItemOrderByWithRelationInput[] = isPregnant
		? [{ weekStart: "asc" }, { title: "asc" }]
		: [{ monthStart: "asc" }, { title: "asc" }];

	const rows = await prisma.checklistItem.findMany({
		where,
		orderBy,
		include: {
			users: { where: { userId }, select: { done: true, doneAt: true, scheduledAt: true } },
		},
	});

	const items = rows.map((row) => {
		const start = (isPregnant ? row.weekStart : row.monthStart) ?? 0;
		const end = (isPregnant ? row.weekEnd : row.monthEnd) ?? start;
		const state = row.users[0];
		const done = state?.done ?? false;

		return {
			id: row.id,
			title: row.title,
			description: row.description,
			kind: row.kind,
			target: row.target,
			unit,
			windowStart: start,
			windowEnd: end,
			done,
			doneAt: state?.doneAt ?? null,
			scheduledAt: state?.scheduledAt ?? null,
			status: computeStatus(position, start, end, done),
		};
	});

	return { phase, items };
};

// Marca como feito e/ou agenda. Só altera o que veio no corpo da requisição.
// Na Fase 4, é aqui que entra a chamada de awardBadges(userId).
const updateChecklistItem = async (
	userId: string,
	itemId: string,
	input: UpdateChecklistInput,
) => {
	const item = await prisma.checklistItem.findUnique({
		where: { id: itemId },
		select: { id: true },
	});

	if (!item) {
		throw new AppError("Item do checklist não encontrado.", 404);
	}

	const data: { done?: boolean; doneAt?: Date | null; scheduledAt?: Date | null } = {};

	if (input.done !== undefined) {
		data.done = input.done;
		data.doneAt = input.done ? new Date() : null;
	}
	if (input.scheduledAt !== undefined) {
		data.scheduledAt = input.scheduledAt;
	}

	return prisma.userChecklist.upsert({
		where: { userId_itemId: { userId, itemId } },
		update: data,
		create: { userId, itemId, ...data },
		select: { itemId: true, done: true, doneAt: true, scheduledAt: true },
	});
};

export { listChecklist, updateChecklistItem };