import { z } from "zod";

const STAGES = ["PRENATAL", "PARTO", "POSPARTO", "PRIMEIRO_ANO"] as const;

const YOUTUBE_HOSTS = [
	"youtube.com",
	"www.youtube.com",
	"m.youtube.com",
	"youtu.be",
	"www.youtube-nocookie.com",
];

const isYoutubeUrl = (value: string) => {
	try {
		const url = new URL(value);

		return url.protocol === "https:" && YOUTUBE_HOSTS.includes(url.hostname);
	} catch {
		return false;
	}
};

// Janela de semanas ou meses. O intervalo certo depende da etapa e é conferido no superRefine.
const windowValue = z
	.number({ error: "Informe um número inteiro." })
	.int("Informe um número inteiro.")
	.min(0, "Valor inválido.")
	.max(42, "Valor inválido.")
	.nullish();

const contentInputSchema = z
	.object({
		title: z
			.string({ error: "Informe o título." })
			.trim()
			.min(3, "O título deve ter no mínimo 3 caracteres.")
			.max(150, "O título deve ter no máximo 150 caracteres."),
		summary: z
			.string({ error: "Informe o resumo." })
			.trim()
			.min(3, "O resumo deve ter no mínimo 3 caracteres.")
			.max(300, "O resumo deve ter no máximo 300 caracteres."),
		body: z.string().trim().max(50000, "O texto deve ter no máximo 50.000 caracteres.").nullish(),
		videoUrl: z
			.string()
			.trim()
			.max(500, "O link deve ter no máximo 500 caracteres.")
			.refine(isYoutubeUrl, "Use um link do YouTube (começando com https).")
			.nullish(),
		type: z.enum(["TEXT", "VIDEO"], { error: "Tipo de conteúdo inválido." }),
		stage: z.enum(STAGES, { error: "Etapa inválida." }),
		weekStart: windowValue,
		weekEnd: windowValue,
		monthStart: windowValue,
		monthEnd: windowValue,
		published: z.boolean({ error: "Informe se o conteúdo está publicado." }).default(false),
		categoryId: z.string({ error: "Escolha uma categoria." }).min(1, "Escolha uma categoria."),
	})
	.superRefine((data, ctx) => {
		const fail = (path: string, message: string) =>
			ctx.addIssue({ code: "custom", path: [path], message });

		if (data.type === "TEXT" && !data.body) {
			fail("body", "Conteúdo em texto precisa do corpo do texto.");
		}
		if (data.type === "VIDEO" && !data.videoUrl) {
			fail("videoUrl", "Conteúdo em vídeo precisa do link do vídeo.");
		}

		// PRENATAL e PARTO usam semanas (1 a 42); POSPARTO e PRIMEIRO_ANO usam meses (0 a 12)
		const byWeek = data.stage === "PRENATAL" || data.stage === "PARTO";
		const start = byWeek ? data.weekStart : data.monthStart;
		const end = byWeek ? data.weekEnd : data.monthEnd;
		const startField = byWeek ? "weekStart" : "monthStart";
		const endField = byWeek ? "weekEnd" : "monthEnd";
		const min = byWeek ? 1 : 0;
		const max = byWeek ? 42 : 12;
		const unit = byWeek ? "semanas" : "meses";

		if (start == null || end == null) {
			fail(startField, `Informe o início e o fim da janela em ${unit}.`);
			return;
		}
		if (start < min || start > max) {
			fail(startField, `O início deve estar entre ${min} e ${max} (${unit}).`);
		}
		if (end < min || end > max) {
			fail(endField, `O fim deve estar entre ${min} e ${max} (${unit}).`);
		}
		if (start > end) {
			fail(endField, "O fim não pode ser anterior ao início.");
		}
	});

const validateContentSchema = z
	.object({
		validated: z.boolean({ error: "Informe se o conteúdo está validado." }).default(true),
		// nome e registro do profissional (ex.: "Maria Souza, COREN-SP 123456")
		validatedBy: z
			.string()
			.trim()
			.min(3, "Informe o nome e o registro do profissional.")
			.max(150, "Máximo de 150 caracteres.")
			.optional(),
	})
	.superRefine((data, ctx) => {
		if (data.validated && !data.validatedBy) {
			ctx.addIssue({
				code: "custom",
				path: ["validatedBy"],
				message: "Informe o nome e o registro do profissional que validou.",
			});
		}
	});

const booleanFromQuery = z
	.enum(["true", "false"], { error: "Valor inválido." })
	.transform((value) => value === "true");

const listAdminContentsQuerySchema = z.object({
	stage: z.enum(STAGES, { error: "Etapa inválida." }).optional(),
	published: booleanFromQuery.optional(),
	validated: booleanFromQuery.optional(),
});

const contentParamsSchema = z.object({
	id: z.string().min(1, "Identificador inválido."),
});

export {
	contentInputSchema,
	contentParamsSchema,
	listAdminContentsQuerySchema,
	validateContentSchema,
};
