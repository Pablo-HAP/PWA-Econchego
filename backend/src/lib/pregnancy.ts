import { AppError } from "./errors";
import { prisma } from "./prisma";

const DAY_MS = 86_400_000;
const DAYS_PER_MONTH = 30.44;

type PhaseInput = {
	dueDate: Date | null;
	birthDate: Date | null;
};

type UserPhase =
	| { kind: "PREGNANT"; week: number; pastDue: boolean }
	| { kind: "BABY"; months: number }
	| { kind: "UNKNOWN" };

// A fase nunca é guardada: é calculada das datas a cada acesso, então não fica desatualizada.
// - Grávida: semana de gestação (1 a 42). pastDue = true quando passou da semana 42
//   sem data de nascimento (o front pode perguntar "Seu bebê já nasceu?").
// - Mãe de bebê: meses de vida do bebê (0 = recém-nascido).
const getUserPhase = (user: PhaseInput, today = new Date()): UserPhase => {
	if (user.birthDate) {
		const months = Math.floor(
			(today.getTime() - user.birthDate.getTime()) / (DAY_MS * DAYS_PER_MONTH),
		);

		return { kind: "BABY", months: Math.max(0, months) };
	}

	if (user.dueDate) {
		const weeksLeft = Math.ceil((user.dueDate.getTime() - today.getTime()) / (DAY_MS * 7));
		const rawWeek = 40 - weeksLeft;

		return {
			kind: "PREGNANT",
			week: Math.min(42, Math.max(1, rawWeek)),
			pastDue: rawWeek > 42,
		};
	}

	return { kind: "UNKNOWN" };
};

// Atalho usado pelos services: busca as datas da usuária e calcula a fase.
const getPhaseForUser = async (userId: string): Promise<UserPhase> => {
	const user = await prisma.user.findUnique({
		where: { id: userId },
		select: { dueDate: true, birthDate: true },
	});

	// Token válido, mas a conta foi excluída
	if (!user) {
		throw new AppError("Sessão inválida. Entre novamente.", 401);
	}

	return getUserPhase(user);
};

export { getUserPhase, getPhaseForUser };
export type { UserPhase };