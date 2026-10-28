import type { FastifyReply, FastifyRequest } from "fastify";
import { idParamsSchema, listContentsQuerySchema } from "./contents.schemas";
import { getContentById, listContents, listContentsForUser } from "./contents.service";

const list = async (request: FastifyRequest, reply: FastifyReply) => {
	const query = listContentsQuerySchema.parse(request.query);
	const contents = await listContents(request.user.sub, query);

	return reply.send({ contents });
};

const forMe = async (request: FastifyRequest, reply: FastifyReply) => {
	return reply.send(await listContentsForUser(request.user.sub));
};

const getOne = async (request: FastifyRequest, reply: FastifyReply) => {
	const { id } = idParamsSchema.parse(request.params);
	const content = await getContentById(request.user.sub, id);

	return reply.send({ content });
};

export { forMe, getOne, list };