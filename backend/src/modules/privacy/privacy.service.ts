import bcrypt from "bcryptjs";
import { AppError } from "../../lib/errors";
import { prisma } from "../../lib/prisma";

// Direito de acesso (LGPD): tudo que o app guarda sobre a usuária, menos o hash da senha.
// Relatos de bug não entram porque não guardam quem enviou.
const exportUserData = async (userId: string) => {
	const user = await prisma.user.findUnique({
		where: { id: userId },
		select: {
			id: true,
			name: true,
			email: true,
			role: true,
			dueDate: true,
			birthDate: true,
			ubsReference: true,
			consentAt: true,
			consentVersion: true,
			createdAt: true,
			progress: {
				select: { completedAt: true, content: { select: { id: true, title: true } } },
				orderBy: { completedAt: "asc" },
			},
			checklist: {
				select: {
					done: true,
					doneAt: true,
					scheduledAt: true,
					item: { select: { title: true, kind: true, target: true } },
				},
			},
			badges: {
				select: { earnedAt: true, badge: { select: { code: true, title: true } } },
				orderBy: { earnedAt: "asc" },
			},
			questions: {
				select: {
					text: true,
					answer: true,
					answeredAt: true,
					status: true,
					createdAt: true,
				},
				orderBy: { createdAt: "asc" },
			},
			feedbacks: {
				select: {
					rating: true,
					comment: true,
					createdAt: true,
					content: { select: { id: true, title: true } },
				},
				orderBy: { createdAt: "asc" },
			},
		},
	});

	// Token válido, mas a conta já foi excluída
	if (!user) {
		throw new AppError("Sessão inválida. Entre novamente.", 401);
	}

	return { exportedAt: new Date().toISOString(), user };
};

// Direito de eliminação (LGPD): apaga a conta e, em cascata, progresso, checklist,
// selos, dúvidas e avaliações (onDelete: Cascade no schema).
// Pede a senha para evitar exclusão por engano ou por quem pegou o celular desbloqueado.
const deleteAccount = async (userId: string, password: string) => {
	const user = await prisma.user.findUnique({
		where: { id: userId },
		select: { id: true, role: true, passwordHash: true },
	});

	if (!user) {
		throw new AppError("Sessão inválida. Entre novamente.", 401);
	}

	// Evita ficar sem nenhum administrador por engano
	if (user.role === "ADMIN") {
		throw new AppError("Contas de administração não podem ser excluídas por aqui.", 403);
	}

	const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

	// 403 (e não 401) para o front não confundir com sessão expirada e deslogar
	if (!isPasswordValid) {
		throw new AppError("Senha incorreta.", 403);
	}

	await prisma.user.delete({ where: { id: userId } });
};

export { deleteAccount, exportUserData };
