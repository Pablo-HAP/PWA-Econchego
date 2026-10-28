import type { FastifyReply, FastifyRequest } from "fastify";
import { listBadgesForUser } from "./badges.service";

const list = async (request: FastifyRequest, reply: FastifyReply) => {
	const badges = await listBadgesForUser(request.user.sub);

	return reply.send({ badges });
};

export { list };