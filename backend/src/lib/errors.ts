// Erro de negócio com código HTTP. Os services lançam, o handler do app.ts responde.
// Exemplo: throw new AppError("E-mail já cadastrado.", 409);
class AppError extends Error {
	readonly statusCode: number;

	constructor(message: string, statusCode = 400) {
		super(message);
		this.name = "AppError";
		this.statusCode = statusCode;
	}
}

export { AppError };