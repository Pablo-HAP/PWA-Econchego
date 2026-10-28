import type { FastifyReply, FastifyRequest } from "fastify";
import { createFeedbackSchema } from "./feedback.schemas";
import { saveFeedback } from "./feedback.service";

const create = async (request: FastifyRequest, reply: FastifyReply) => {
	const body = createFeedbackSchema.parse(request.body);
	const { feedback, created } = await saveFeedback(request.user.sub, body);

	return reply.code(created ? 201 : 200).send({ feedback });
};

export { create };