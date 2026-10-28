import { toCsv, type CsvValue } from "../../lib/csv";
import { prisma } from "../../lib/prisma";
import type { BugMonth, MetricGoal } from "./admin.types";

const TIME_ZONE = "America/Sao_Paulo";

// Grupos com menos usuárias que isso não saem na exportação (anonimato, LGPD).
const MIN_GROUP_SIZE = 5;
const NOT_INFORMED_LABEL = "Não informada";
const OTHERS_LABEL = "Demais regiões (agrupadas)";

const round = (value: number, digits = 3) => {
	const factor = 10 ** digits;

	return Math.round(value * factor) / factor;
};

// ---------- Meses (para bugs por mês) ----------
const monthKey = (date: Date) => {
	const parts = new Intl.DateTimeFormat("en-CA", {
		timeZone: TIME_ZONE,
		year: "numeric",
		month: "2-digit",
	}).formatToParts(date);
	const year = parts.find((part) => part.type === "year")?.value;
	const month = parts.find((part) => part.type === "month")?.value;

	return `${year}-${month}`;
};

const nextMonthKey = (key: string) => {
	const [year, month] = key.split("-").map(Number) as [number, number];

	return month === 12 ? `${year + 1}-01` : `${year}-${String(month + 1).padStart(2, "0")}`;
};

const increment = (map: Map<string, number>, key: string) => {
	map.set(key, (map.get(key) ?? 0) + 1);
};

// Série mensal sem buracos: meses sem relato aparecem com zero.
const buildBugsByMonth = (bugs: { createdAt: Date; resolvedAt: Date | null }[]): BugMonth[] => {
	const opened = new Map<string, number>();
	const resolved = new Map<string, number>();

	for (const bug of bugs) {
		increment(opened, monthKey(bug.createdAt));
		if (bug.resolvedAt) {
			increment(resolved, monthKey(bug.resolvedAt));
		}
	}

	const keys = [...opened.keys(), ...resolved.keys()].sort();
	const first = keys[0];

	if (!first) {
		return [];
	}

	const last = [keys[keys.length - 1] ?? first, monthKey(new Date())].sort().pop() ?? first;
	const series: BugMonth[] = [];

	for (let key = first; key <= last; key = nextMonthKey(key)) {
		series.push({ month: key, opened: opened.get(key) ?? 0, resolved: resolved.get(key) ?? 0 });
	}

	return series;
};

// ---------- Painel de métricas (/admin/metrics) ----------
const getMetrics = async () => {
	const [
		users,
		pregnant,
		withBaby,
		publishedContents,
		validatedContents,
		completions,
		ratings,
		pendingQuestions,
		answeredQuestions,
		bugs,
	] = await Promise.all([
		prisma.user.count({ where: { role: "USER" } }),
		prisma.user.count({ where: { role: "USER", dueDate: { not: null } } }),
		prisma.user.count({ where: { role: "USER", birthDate: { not: null } } }),
		prisma.content.count({ where: { published: true } }),
		prisma.content.count({ where: { published: true, validated: true } }),
		prisma.contentProgress.count({
			where: { user: { role: "USER" }, content: { published: true } },
		}),
		prisma.feedback.aggregate({
			where: { user: { role: "USER" } },
			_avg: { rating: true },
			_count: { _all: true },
		}),
		prisma.question.count({ where: { status: "PENDING" } }),
		prisma.question.count({ where: { status: "ANSWERED" } }),
		prisma.bugReport.findMany({ select: { createdAt: true, resolvedAt: true } }),
	]);

	// Meta: conclusão = conteúdos concluídos / (usuárias x conteúdos publicados)
	const possible = users * publishedContents;
	const completionRate = possible > 0 ? completions / possible : 0;

	const averageRating = ratings._avg.rating;
	const validatedRate = publishedContents > 0 ? validatedContents / publishedContents : 0;

	// Compara os dois últimos meses COMPLETOS (o mês corrente ainda está em andamento).
	const bugsByMonth = buildBugsByMonth(bugs);
	const currentMonth = monthKey(new Date());
	const [previous, latest] = bugsByMonth.filter((m) => m.month < currentMonth).slice(-2);
	const bugVariation = previous && latest ? latest.opened - previous.opened : null;

	const goals: MetricGoal[] = [
		{
			key: "completionRate",
			label: "Taxa de conclusão das atividades do MVP",
			target: 0.8,
			unit: "ratio",
			value: round(completionRate),
			met: completionRate >= 0.8,
		},
		{
			key: "satisfaction",
			label: "Satisfação média (1 a 5)",
			target: 4,
			unit: "stars",
			value: averageRating === null ? null : round(averageRating, 2),
			met: averageRating === null ? null : averageRating >= 4,
		},
		{
			key: "validatedContents",
			label: "Conteúdos publicados que foram validados",
			target: 0.8,
			unit: "ratio",
			value: round(validatedRate),
			met: publishedContents > 0 ? validatedRate >= 0.8 : null,
		},
		{
			key: "users",
			label: "Usuárias no teste do MVP",
			target: 20,
			unit: "count",
			value: users,
			met: users >= 20,
		},
		{
			// Não existe no banco: a equipe registra à mão
			key: "listeningSessions",
			label: "Sessões de escuta ou validação por ciclo",
			target: 20,
			unit: "count",
			value: null,
			met: null,
			manual: true,
		},
		{
			key: "bugsReduction",
			label: "Variação mensal de não conformidades (meta: redução)",
			target: 0,
			unit: "variation",
			value: bugVariation,
			met: bugVariation === null ? null : bugVariation <= 0,
		},
	];

	return {
		generatedAt: new Date().toISOString(),
		goals,
		details: {
			users: { total: users, pregnant, withBaby },
			contents: { published: publishedContents, validated: validatedContents, completions },
			ratings: {
				average: averageRating === null ? null : round(averageRating, 2),
				count: ratings._count._all,
			},
			questions: { pending: pendingQuestions, answered: answeredQuestions },
			bugsByMonth,
		},
	};
};

// ---------- Exportação agregada e anônima (/admin/metrics/export) ----------
const normalizeRegion = (value: string | null) => {
	const label = value?.trim().replace(/\s+/g, " ") ?? "";

	return label
		? { key: label.toLocaleLowerCase("pt-BR"), label }
		: { key: "", label: NOT_INFORMED_LABEL };
};

const exportAggregatedCsv = async () => {
	const [users, doneChecklist, feedbacks] = await Promise.all([
		prisma.user.findMany({
			where: { role: "USER" },
			select: {
				id: true,
				ubsReference: true,
				_count: { select: { progress: { where: { content: { published: true } } } } },
			},
		}),
		prisma.userChecklist.findMany({
			where: { done: true, user: { role: "USER" } },
			select: { userId: true, item: { select: { kind: true } } },
		}),
		prisma.feedback.findMany({
			where: { user: { role: "USER" } },
			select: { userId: true, rating: true },
		}),
	]);

	// Índices por usuária, só em memória (nada individual sai daqui)
	const doneKinds = new Map<string, Set<string>>();
	for (const row of doneChecklist) {
		const kinds = doneKinds.get(row.userId) ?? new Set<string>();
		kinds.add(row.item.kind);
		doneKinds.set(row.userId, kinds);
	}

	const ratingsByUser = new Map<string, number[]>();
	for (const row of feedbacks) {
		ratingsByUser.set(row.userId, [...(ratingsByUser.get(row.userId) ?? []), row.rating]);
	}

	const completedByUser = new Map(users.map((u) => [u.id, u._count.progress]));

	const summarize = (label: string, userIds: string[]): CsvValue[] => {
		const total = userIds.length;
		let completed = 0;
		let consults = 0;
		let exams = 0;
		let vaccines = 0;
		let raters = 0;
		let ratingSum = 0;
		let ratingCount = 0;

		for (const id of userIds) {
			completed += completedByUser.get(id) ?? 0;

			const kinds = doneKinds.get(id);
			if (kinds?.has("CONSULTA")) consults += 1;
			if (kinds?.has("EXAME")) exams += 1;
			if (kinds?.has("VACINA")) vaccines += 1;

			const list = ratingsByUser.get(id);
			if (list) {
				raters += 1;
				ratingSum += list.reduce((sum, rating) => sum + rating, 0);
				ratingCount += list.length;
			}
		}

		const percent = (count: number) => round((count / total) * 100, 1);

		return [
			label,
			total,
			round(completed / total, 1),
			percent(consults),
			percent(exams),
			percent(vaccines),
			// a média de avaliação também respeita o mínimo de pessoas
			raters >= MIN_GROUP_SIZE ? round(ratingSum / ratingCount, 2) : null,
		];
	};

	// Agrupa por UBS/região (texto livre, normalizado para juntar variações de maiúscula e espaço)
	const groups = new Map<string, { label: string; userIds: string[] }>();
	for (const user of users) {
		const { key, label } = normalizeRegion(user.ubsReference);
		const group = groups.get(key) ?? { label, userIds: [] };
		group.userIds.push(user.id);
		groups.set(key, group);
	}

	// Grupo pequeno não sai. Os pequenos são somados num grupo "Demais", que só sai se também tiver 5+.
	const shown: { label: string; row: CsvValue[] }[] = [];
	const leftovers: string[] = [];

	for (const group of groups.values()) {
		if (group.userIds.length >= MIN_GROUP_SIZE) {
			shown.push({ label: group.label, row: summarize(group.label, group.userIds) });
		} else {
			leftovers.push(...group.userIds);
		}
	}

	shown.sort((a, b) => a.label.localeCompare(b.label, "pt-BR"));
	const rows = shown.map((item) => item.row);

	if (leftovers.length >= MIN_GROUP_SIZE) {
		rows.push(summarize(OTHERS_LABEL, leftovers));
	}

	return toCsv(
		[
			"regiao_ou_ubs",
			"usuarias",
			"media_conteudos_concluidos_por_usuaria",
			"pct_com_consulta_realizada",
			"pct_com_exame_realizado",
			"pct_com_vacina_realizada",
			"media_avaliacao",
		],
		rows,
	);
};

export { exportAggregatedCsv, getMetrics };
