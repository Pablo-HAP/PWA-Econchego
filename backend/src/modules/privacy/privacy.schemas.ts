import { z } from "zod";

const deleteAccountSchema = z.object({
	password: z.string({ error: "Informe sua senha para excluir a conta." }).min(1, "Informe sua senha para excluir a conta."),
});

export { deleteAccountSchema };
