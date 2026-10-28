import type { FastifyReply, FastifyRequest } from "fastify";
import {
	answerQuestionSchema,
	createQuestionSchema,
	listQuestionsQuerySchema,
	questionParamsSchema,
} from "./questions.schemas";
import {
	answerQuestion,
	createQuestion,
	listMyQuestions,
	listQuestions,
} from "./questions.service";

const create = async (request: FastifyRequest, reply: FastifyReply) => {
	const body = createQuestionSchema.parse(request.body);
	const { question, newBadges } = await createQuestion(request.user.sub, body.text);

	return reply.code(201).send({ question, newBadges });
};

const listMine = async (request: FastifyRequest, reply: FastifyReply) => {
	const questions = await listMyQuestions(request.user.sub);

	return reply.send({ questions });
};

// Admin
const listAll = async (request: FastifyRequest, reply: FastifyReply) => {
	const query = listQuestionsQuerySchema.parse(request.query);
	const questions = await listQuestions(query.status);

	return reply.send({ questions });
};

// Admin
const answer = async (request: FastifyRequest, reply: FastifyReply) => {
	const { id } = questionParamsSchema.parse(request.params);
	const body = answerQuestionSchema.parse(request.body);
	const question = await answerQuestion(id, body.answer);

	return reply.send({ question });
};

export { answer, create, listAll, listMine };