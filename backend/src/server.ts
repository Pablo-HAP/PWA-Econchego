import { app } from "./app";
import { env } from "./config/env";

const start = async () => {
	try {
		await app.listen({ port: env.PORT, host: "0.0.0.0" });
	} catch (error) {
		app.log.error(error);
		process.exit(1);
	}
};

let isShuttingDown = false;

const shutdown = async (signal: NodeJS.Signals) => {
	if (isShuttingDown) {
		return;
	}

	isShuttingDown = true;
	app.log.info({ signal }, "Shutting down server");

	await app.close();
	process.exit(0);
};

process.on("SIGINT", () => {
	void shutdown("SIGINT");
});

process.on("SIGTERM", () => {
	void shutdown("SIGTERM");
});

void start();