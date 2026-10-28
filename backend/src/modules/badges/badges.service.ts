import { getPhaseForUser } from "../../lib/pregnancy";
import { prisma } from "../../lib/prisma";
import { buildPhaseContentWhere } from "../contents/contents.service";

type AwardedBadge = {
	code: string;
	title: string;
	description: string;
	icon: string;
};

type ChecklistKindName = "CONSULTA" | "EXAME" | "VACINA";

const hasDoneChecklistOfKind = async (userId: string, kind: ChecklistKindName) => {
	const count = await prisma.userChecklist.count({
		where: { userId, done: true, item: { kind } },
	});

	return count > 0;
};

// Regra de cada selo, pelo "code" cadastrado no seed.
// Para criar um selo novo: adicione no seed e uma regra aqui com o mesmo code.
const badgeRules: Record<string, (userId: string) => Promise<boolean>> = {
	// Concluiu pelo menos um conteúdo
	FIRST_CONTENT: async (userId) => {
		const count = await prisma.contentProgress.count({ where: { userId } });
		return count > 0;
	},

	// Concluiu todos os conteúdos da fase atual (e há pelo menos um)
	WEEK_ON_TRACK: async (userId) => {
		const phase = await getPhaseForUser(userId);

		if (phase.kind === "UNKNOWN") {
			return false;
		}

		const where = buildPhaseContentWhere(phase);
		const [total, completed] = await Promise.all([
			prisma.content.count({ where }),
			prisma.content.count({ where: { ...where, progress: { some: { userId } } } }),
		]);

		return total > 0 && completed === total;
	},

	CONSULT_DONE: (userId) => hasDoneChecklistOfKind(userId, "CONSULTA"),
	EXAM_DONE: (userId) => hasDoneChecklistOfKind(userId, "EXAME"),
	VACCINE_DONE: (userId) => hasDoneChecklistOfKind(userId, "VACINA"),

	// Enviou pelo menos uma dúvida
	FIRST_QUESTION: async (userId) => {
		const count = await prisma.question.count({ where: { userId } });
		return count > 0;
	},
};

// Confere os selos que a usuária ainda não tem e concede os que ela merece.
// Devolve só os selos NOVOS, para o front poder comemorar.
// Um erro aqui não pode derrubar a ação principal (ex.: concluir o conteúdo,
// que já foi salvo), então é registrado e a lista volta vazia.
const awardBadges = async (userId: string): Promise<AwardedBadge[]> => {
	try {
		const pending = await prisma.badge.findMany({
			where: { users: { none: { userId } } },
			select: { id: true, code: true, title: true, description: true, icon: true },
		});

		const earned: typeof pending = [];

		for (const badge of pending) {
			const rule = badgeRules[badge.code];

			if (rule && (await rule(userId))) {
				earned.push(badge);
			}
		}

		if (earned.length === 0) {
			return [];
		}

		await prisma.userBadge.createMany({
			data: earned.map((badge) => ({ userId, badgeId: badge.id })),
			skipDuplicates: true,
		});

		return earned.map(({ code, title, description, icon }) => ({
			code,
			title,
			description,
			icon,
		}));
	} catch (error) {
		console.error("Erro ao conceder selos:", error instanceof Error ? error.message : error);
		return [];
	}
};

// Todos os selos, marcando os que a usuária já conquistou (tela de perfil)
const listBadgesForUser = async (userId: string) => {
	const rows = await prisma.badge.findMany({
		orderBy: { title: "asc" },
		select: {
			code: true,
			title: true,
			description: true,
			icon: true,
			users: { where: { userId }, select: { earnedAt: true } },
		},
	});

	return rows.map(({ users, ...badge }) => ({
		...badge,
		earned: users.length > 0,
		earnedAt: users[0]?.earnedAt ?? null,
	}));
};

export { awardBadges, listBadgesForUser };
export type { AwardedBadge };