import { z } from "zod";

const loginSchema = z.object({
	email: z.string().email("Informe um e-mail válido."),
	password: z.string().min(6, "A senha deve ter no mínimo 6 caracteres."),
});

const registerSchema = z.object({
	name: z.string().min(2, "O nome deve ter no mínimo 2 caracteres."),
	email: z.string().email("Informe um e-mail válido."),
	password: z.string().min(6, "A senha deve ter no mínimo 6 caracteres."),
	phone: z.string().min(8, "O telefone deve ter no mínimo 8 caracteres.").optional(),
});

const authUserSelect = {
	id: true,
	name: true,
	email: true,
	phone: true,
} as const;

export { authUserSelect, loginSchema, registerSchema };