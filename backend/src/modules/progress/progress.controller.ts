import type { FastifyReply, FastifyRequest } from "fastify";
import { idParamsSchema } from "./progress.schemas";
import { completeContent } from "./progress.service";

const complete = async (request: FastifyRequest, reply: FastifyReply) => {
	const { id } = idParamsSchema.parse(request.params);
	const { progress, newBadges } = await completeContent(request.user.sub, id);

	return reply.send({ progress, newBadges });
};

export { complete };