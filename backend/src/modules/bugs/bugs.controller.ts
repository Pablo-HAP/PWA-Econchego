import type { FastifyReply, FastifyRequest } from "fastify";
import {
	bugParamsSchema,
	createBugSchema,
	listBugsQuerySchema,
	updateBugSchema,
} from "./bugs.schemas";
import { createBug, listBugs, updateBugStatus } from "./bugs.service";

const create = async (request: FastifyRequest, reply: FastifyReply) => {
	const body = createBugSchema.parse(request.body);
	const bug = await createBug(body);

	return reply.code(201).send({ bug });
};

// Admin
const list = async (request: FastifyRequest, reply: FastifyReply) => {
	const query = listBugsQuerySchema.parse(request.query);
	const bugs = await listBugs(query.status);

	return reply.send({ bugs });
};

// Admin
const update = async (request: FastifyRequest, reply: FastifyReply) => {
	const { id } = bugParamsSchema.parse(request.params);
	const body = updateBugSchema.parse(request.body);
	const bug = await updateBugStatus(id, body.status);

	return reply.send({ bug });
};

export { create, list, update };