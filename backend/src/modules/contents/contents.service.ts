import type { Prisma } from "../../../generated/prisma/client";
import { AppError } from "../../lib/errors";
import { getPhaseForUser, type UserPhase } from "../../lib/pregnancy";
import { prisma } from "../../lib/prisma";
import type { ListContentsQuery } from "./contents.types";

type ActivePhase = Exclude<UserPhase, { kind: "UNKNOWN" }>;

// Campos da listagem (sem o texto completo, para a lista ficar leve).
// "progress" traz só o registro da própria usuária, para saber se ela já concluiu.
const listSelect = (userId: string) =>
	({
		id: true,
		title: true,
		summary: true,
		type: true,
		stage: true,
		weekStart: true,
		weekEnd: true,
		monthStart: true,
		monthEnd: true,
		validated: true,
		category: { select: { name: true, slug: true } },
		progress: { where: { userId }, select: { id: true } },
	}) satisfies Prisma.ContentSelect;

const contentOrder: Prisma.ContentOrderByWithRelationInput[] = [
	{ weekStart: "asc" },
	{ monthStart: "asc" },
	{ title: "asc" },
];

// Conteúdo publicado que vale para a fase da usuária.
// Também é usado pelo selo "Semana em dia".
const buildPhaseContentWhere = (phase: ActivePhase): Prisma.ContentWhereInput =>
	phase.kind === "PREGNANT"
		? {
				published: true,
				stage: { in: ["PRENATAL", "PARTO"] },
				weekStart: { lte: phase.week },
				weekEnd: { gte: phase.week },
			}
		: {
				published: true,
				stage: { in: ["POSPARTO", "PRIMEIRO_ANO"] },
				monthStart: { lte: phase.months },
				monthEnd: { gte: phase.months },
			};

// Troca a lista "progress" por um simples completed: true/false
const toItem = <T extends { progress: { id: string }[] }>(row: T) => {
	const { progress, ...rest } = row;

	return { ...rest, completed: progress.length > 0 };
};

// Biblioteca: só conteúdo publicado, com filtros opcionais
const listContents = async (userId: string, query: ListContentsQuery) => {
	const where: Prisma.ContentWhereInput = { published: true };

	if (query.stage) {
		where.stage = query.stage;
	}
	if (query.category) {
		where.category = { slug: query.category };
	}
	if (query.week !== undefined) {
		where.weekStart = { lte: query.week };
		where.weekEnd = { gte: query.week };
	}
	if (query.month !== undefined) {
		where.monthStart = { lte: query.month };
		where.monthEnd = { gte: query.month };
	}

	const rows = await prisma.content.findMany({
		where,
		select: listSelect(userId),
		orderBy: contentOrder,
	});

	return rows.map(toItem);
};

// Conteúdo da fase atual da usuária (semana de gestação ou mês de vida do bebê)
const listContentsForUser = async (userId: string) => {
	const phase = await getPhaseForUser(userId);

	if (phase.kind === "UNKNOWN") {
		return { phase, contents: [] };
	}

	const rows = await prisma.content.findMany({
		where: buildPhaseContentWhere(phase),
		select: listSelect(userId),
		orderBy: contentOrder,
	});

	return { phase, contents: rows.map(toItem) };
};

const getContentById = async (userId: string, id: string) => {
	const row = await prisma.content.findFirst({
		where: { id, published: true },
		select: {
			...listSelect(userId),
			body: true,
			videoUrl: true,
			validatedBy: true,
		},
	});

	if (!row) {
		throw new AppError("Conteúdo não encontrado.", 404);
	}

	return toItem(row);
};

export { buildPhaseContentWhere, getContentById, listContents, listContentsForUser };