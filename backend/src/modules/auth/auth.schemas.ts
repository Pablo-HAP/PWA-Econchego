import { z } from "zod";

const DAY_MS = 86_400_000;
const daysFromNow = (days: number) => new Date(Date.now() + days * DAY_MS);

// Limites de sanidade das datas (ajuste se quiser)
const DUE_DATE_MAX_DAYS_AHEAD = 300;
const DUE_DATE_MAX_DAYS_PAST = 60;
const BABY_MAX_AGE_DAYS = 366;

const email = z
	.string({ error: "Informe o e-mail." })
	.trim()
	.toLowerCase()
	.pipe(z.email("Informe um e-mail válido."));

const loginSchema = z.object({
	email,
	password: z.string({ error: "Informe a senha." }).min(1, "Informe a senha."),
});

const registerSchema = z
	.object({
		name: z
			.string({ error: "Informe o nome." })
			.trim()
			.min(2, "O nome deve ter no mínimo 2 caracteres.")
			.max(100, "O nome deve ter no máximo 100 caracteres."),
		email,
		password: z
			.string({ error: "Informe a senha." })
			.min(8, "A senha deve ter no mínimo 8 caracteres.")
			.max(72, "A senha deve ter no máximo 72 caracteres."),
		consent: z.literal(true, {
			error: "É necessário aceitar o termo de consentimento para criar a conta.",
		}),
		phase: z.enum(["PREGNANT", "BABY"], {
			error: "Informe se você está grávida ou se o bebê já nasceu.",
		}),
		dueDate: z.coerce.date({ error: "Informe uma data prevista do parto válida." }).optional(),
		birthDate: z.coerce.date({ error: "Informe uma data de nascimento válida." }).optional(),
		ubsReference: z
			.string()
			.trim()
			.max(120, "A UBS de referência deve ter no máximo 120 caracteres.")
			.optional(),
	})
	.superRefine((data, ctx) => {
		if (data.phase === "PREGNANT") {
			if (!data.dueDate) {
				ctx.addIssue({
					code: "custom",
					path: ["dueDate"],
					message: "Informe a data prevista do parto.",
				});
				return;
			}

			if (
				data.dueDate < daysFromNow(-DUE_DATE_MAX_DAYS_PAST) ||
				data.dueDate > daysFromNow(DUE_DATE_MAX_DAYS_AHEAD)
			) {
				ctx.addIssue({
					code: "custom",
					path: ["dueDate"],
					message: "A data prevista do parto não parece correta. Confira e tente de novo.",
				});
			}
		}

		if (data.phase === "BABY") {
			if (!data.birthDate) {
				ctx.addIssue({
					code: "custom",
					path: ["birthDate"],
					message: "Informe a data de nascimento do bebê.",
				});
				return;
			}

			if (data.birthDate > new Date() || data.birthDate < daysFromNow(-BABY_MAX_AGE_DAYS)) {
				ctx.addIssue({
					code: "custom",
					path: ["birthDate"],
					message: "A data de nascimento não parece correta. Confira e tente de novo.",
				});
			}
		}
	});

export { loginSchema, registerSchema };