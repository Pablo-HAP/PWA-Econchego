import type { Prisma } from "../../../generated/prisma/client";
import { AppError } from "../../lib/errors";
import { prisma } from "../../lib/prisma";
import type { ContentInput, ListAdminContentsQuery, ValidateContentInput } from "./admin.types";

// Diferente da biblioteca da usuária, o admin vê também os rascunhos (published = false).
const listSelect = {
	id: true,
	title: true,
	summary: true,
	type: true,
	stage: true,
	weekStart: true,
	weekEnd: true,
	monthStart: true,
	monthEnd: true,
	published: true,
	validated: true,
	validatedBy: true,
	validatedAt: true,
	createdAt: true,
	category: { select: { id: true, name: true, slug: true } },
} satisfies Prisma.ContentSelect;

const detailSelect = { ...listSelect, body: true, videoUrl: true } satisfies Prisma.ContentSelect;

const listCategories = () =>
	prisma.category.findMany({
		select: { id: true, name: true, slug: true },
		orderBy: { name: "asc" },
	});

const listAdminContents = (query: ListAdminContentsQuery) => {
	const where: Prisma.ContentWhereInput = {};

	if (query.stage) {
		where.stage = query.stage;
	}
	if (query.published !== undefined) {
		where.published = query.published;
	}
	if (query.validated !== undefined) {
		where.validated = query.validated;
	}

	return prisma.content.findMany({
		where,
		select: listSelect,
		orderBy: { createdAt: "desc" },
	});
};

const getAdminContent = async (id: string) => {
	const content = await prisma.content.findUnique({ where: { id }, select: detailSelect });

	if (!content) {
		throw new AppError("Conteúdo não encontrado.", 404);
	}

	return content;
};

const assertCategoryExists = async (categoryId: string) => {
	const category = await prisma.category.findUnique({
		where: { id: categoryId },
		select: { id: true },
	});

	if (!category) {
		throw new AppError("Categoria não encontrada.", 400);
	}
};

// Guarda só a janela que faz sentido para a etapa e só o campo do tipo (texto ou vídeo),
// para não ficar lixo de uma edição anterior.
const buildContentData = (input: ContentInput) => {
	const byWeek = input.stage === "PRENATAL" || input.stage === "PARTO";

	return {
		title: input.title,
		summary: input.summary,
		body: input.body || null,
		videoUrl: input.type === "VIDEO" ? input.videoUrl || null : null,
		type: input.type,
		stage: input.stage,
		weekStart: byWeek ? (input.weekStart ?? null) : null,
		weekEnd: byWeek ? (input.weekEnd ?? null) : null,
		monthStart: byWeek ? null : (input.monthStart ?? null),
		monthEnd: byWeek ? null : (input.monthEnd ?? null),
		published: input.published,
		categoryId: input.categoryId,
	};
};

const createContent = async (input: ContentInput) => {
	await assertCategoryExists(input.categoryId);

	// Todo conteúdo novo começa não validado
	return prisma.content.create({
		data: { ...buildContentData(input), validated: false },
		select: detailSelect,
	});
};

// PUT: o corpo substitui os campos editáveis. Se o texto mudar num conteúdo já validado,
// a validação é desfeita, porque o profissional aprovou outra versão.
const updateContent = async (id: string, input: ContentInput) => {
	const existing = await prisma.content.findUnique({
		where: { id },
		select: { title: true, summary: true, body: true, videoUrl: true, validated: true },
	});

	if (!existing) {
		throw new AppError("Conteúdo não encontrado.", 404);
	}

	await assertCategoryExists(input.categoryId);

	const data = buildContentData(input);
	const textChanged =
		existing.title !== data.title ||
		existing.summary !== data.summary ||
		existing.body !== data.body ||
		existing.videoUrl !== data.videoUrl;

	const resetValidation = existing.validated && textChanged;

	return prisma.content.update({
		where: { id },
		data: resetValidation
			? { ...data, validated: false, validatedBy: null, validatedAt: null }
			: data,
		select: detailSelect,
	});
};

const setContentValidation = async (id: string, input: ValidateContentInput) => {
	const existing = await prisma.content.findUnique({ where: { id }, select: { id: true } });

	if (!existing) {
		throw new AppError("Conteúdo não encontrado.", 404);
	}

	return prisma.content.update({
		where: { id },
		data: input.validated
			? { validated: true, validatedBy: input.validatedBy ?? null, validatedAt: new Date() }
			: { validated: false, validatedBy: null, validatedAt: null },
		select: listSelect,
	});
};

export {
	createContent,
	getAdminContent,
	listAdminContents,
	listCategories,
	setContentValidation,
	updateContent,
};
