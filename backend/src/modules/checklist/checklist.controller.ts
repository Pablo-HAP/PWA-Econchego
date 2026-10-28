import type { FastifyReply, FastifyRequest } from "fastify";
import { itemParamsSchema, updateChecklistSchema } from "./checklist.schemas";
import { listChecklist, updateChecklistItem } from "./checklist.service";

const list = async (request: FastifyRequest, reply: FastifyReply) => {
	return reply.send(await listChecklist(request.user.sub));
};

const update = async (request: FastifyRequest, reply: FastifyReply) => {
	const { itemId } = itemParamsSchema.parse(request.params);
	const body = updateChecklistSchema.parse(request.body);
	const { item, newBadges } = await updateChecklistItem(request.user.sub, itemId, body);

	return reply.send({ item, newBadges });
};

export { list, update };