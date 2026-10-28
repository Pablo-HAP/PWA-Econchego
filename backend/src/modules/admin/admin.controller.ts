import type { FastifyReply, FastifyRequest } from "fastify";
import {
	contentInputSchema,
	contentParamsSchema,
	listAdminContentsQuerySchema,
	validateContentSchema,
} from "./admin.schemas";
import {
	createContent,
	getAdminContent,
	listAdminContents,
	listCategories,
	setContentValidation,
	updateContent,
} from "./admin.contents.service";
import { exportAggregatedCsv, getMetrics } from "./admin.service";

const metrics = async (_request: FastifyRequest, reply: FastifyReply) => {
	const result = await getMetrics();

	return reply.send(result);
};

const exportMetrics = async (_request: FastifyRequest, reply: FastifyReply) => {
	const csv = await exportAggregatedCsv();
	const date = new Date().toISOString().slice(0, 10);

	return reply
		.header("Content-Type", "text/csv; charset=utf-8")
		.header("Content-Disposition", `attachment; filename="econchego-metricas-${date}.csv"`)
		.send(csv);
};

const categories = async (_request: FastifyRequest, reply: FastifyReply) => {
	const result = await listCategories();

	return reply.send({ categories: result });
};

const listContents = async (request: FastifyRequest, reply: FastifyReply) => {
	const query = listAdminContentsQuerySchema.parse(request.query);
	const contents = await listAdminContents(query);

	return reply.send({ contents });
};

const getContent = async (request: FastifyRequest, reply: FastifyReply) => {
	const { id } = contentParamsSchema.parse(request.params);
	const content = await getAdminContent(id);

	return reply.send({ content });
};

const create = async (request: FastifyRequest, reply: FastifyReply) => {
	const body = contentInputSchema.parse(request.body);
	const content = await createContent(body);

	return reply.code(201).send({ content });
};

const update = async (request: FastifyRequest, reply: FastifyReply) => {
	const { id } = contentParamsSchema.parse(request.params);
	const body = contentInputSchema.parse(request.body);
	const content = await updateContent(id, body);

	return reply.send({ content });
};

const validate = async (request: FastifyRequest, reply: FastifyReply) => {
	const { id } = contentParamsSchema.parse(request.params);
	const body = validateContentSchema.parse(request.body);
	const content = await setContentValidation(id, body);

	return reply.send({ content });
};

export { categories, create, exportMetrics, getContent, listContents, metrics, update, validate };
