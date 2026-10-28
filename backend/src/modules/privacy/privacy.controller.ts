import type { FastifyReply, FastifyRequest } from "fastify";
import { deleteAccountSchema } from "./privacy.schemas";
import { deleteAccount, exportUserData } from "./privacy.service";

const exportData = async (request: FastifyRequest, reply: FastifyReply) => {
	const data = await exportUserData(request.user.sub);

	return reply
		.header("Content-Disposition", 'attachment; filename="meus-dados-econchego.json"')
		.send(data);
};

const removeAccount = async (request: FastifyRequest, reply: FastifyReply) => {
	const body = deleteAccountSchema.parse(request.body);
	await deleteAccount(request.user.sub, body.password);

	return reply.code(204).send();
};

export { exportData, removeAccount };
