import type { FastifyPluginAsync } from 'fastify';
import { login, me, register } from './auth.controller';

const authRoutes: FastifyPluginAsync = async (app) => {
	app.post('/auth/register', register);
	app.post('/auth/login', login);
	app.get('/auth/me', me);
};

export { authRoutes };