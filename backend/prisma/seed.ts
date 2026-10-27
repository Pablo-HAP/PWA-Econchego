import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient, type Prisma } from "../generated/prisma/client";

// ---------- Variáveis de ambiente (o seed não usa src/config/env.ts de propósito) ----------
const databaseUrl = process.env["DATABASE_URL"];
const adminEmail = process.env["SEED_ADMIN_EMAIL"];
const adminPassword = process.env["SEED_ADMIN_PASSWORD"];

if (!databaseUrl) {
	throw new Error("DATABASE_URL não definida no .env.");
}
if (!adminEmail || !adminPassword || adminPassword.length < 8) {
	throw new Error(
		"Defina SEED_ADMIN_EMAIL e SEED_ADMIN_PASSWORD (mínimo 8 caracteres) no .env.",
	);
}

const adapter = new PrismaPg({ connectionString: databaseUrl });
const prisma = new PrismaClient({ adapter });

// ---------- Categorias ----------
const categories = [
	{ slug: "saude-da-gestante", name: "Saúde da gestante" },
	{ slug: "alimentacao", name: "Alimentação" },
	{ slug: "higiene-e-cuidados", name: "Higiene e cuidados" },
	{ slug: "bebe", name: "Cuidados com o bebê" },
	{ slug: "apoio", name: "Onde buscar apoio" },
];

// ---------- Selos (incentivo) ----------
const badges = [
	{
		code: "FIRST_CONTENT",
		title: "Primeiro passo",
		description: "Você concluiu seu primeiro conteúdo.",
		icon: "🌱",
	},
	{
		code: "WEEK_ON_TRACK",
		title: "Semana em dia",
		description: "Você concluiu os conteúdos da sua semana.",
		icon: "📅",
	},
	{
		code: "CONSULT_DONE",
		title: "Consulta feita",
		description: "Você marcou uma consulta como realizada.",
		icon: "🩺",
	},
	{
		code: "EXAM_DONE",
		title: "Exame feito",
		description: "Você marcou um exame como realizado.",
		icon: "🧪",
	},
	{
		code: "VACCINE_DONE",
		title: "Vacina em dia",
		description: "Você marcou uma vacina como realizada.",
		icon: "💉",
	},
	{
		code: "FIRST_QUESTION",
		title: "Curiosa",
		description: "Você enviou sua primeira dúvida.",
		icon: "💬",
	},
];

// ---------- Checklist ----------
// ATENÇÃO: itens de EXEMPLO. Os títulos, as janelas de semanas/meses e as
// descrições abaixo NÃO são o calendário oficial. Antes de ir ao ar, substitua
// pelos itens do calendário vigente do Ministério da Saúde (pré-natal e PNI)
// e peça validação de um profissional de saúde.
const checklistItems: Prisma.ChecklistItemUncheckedCreateInput[] = [
	{
		id: "chk-consulta-mae-1",
		title: "[EXEMPLO] Consulta de pré-natal",
		description: "Substituir pelo item oficial do calendário do Ministério da Saúde.",
		kind: "CONSULTA",
		target: "MAE",
		weekStart: 1,
		weekEnd: 13,
	},
	{
		id: "chk-exame-mae-1",
		title: "[EXEMPLO] Exames do pré-natal",
		description: "Substituir pelo item oficial do calendário do Ministério da Saúde.",
		kind: "EXAME",
		target: "MAE",
		weekStart: 1,
		weekEnd: 13,
	},
	{
		id: "chk-vacina-mae-1",
		title: "[EXEMPLO] Vacina da gestante",
		description: "Substituir pelo item oficial do calendário do Ministério da Saúde.",
		kind: "VACINA",
		target: "MAE",
		weekStart: 20,
		weekEnd: 36,
	},
	{
		id: "chk-consulta-bebe-1",
		title: "[EXEMPLO] Primeira consulta do bebê",
		description: "Substituir pelo item oficial do calendário do Ministério da Saúde.",
		kind: "CONSULTA",
		target: "BEBE",
		monthStart: 0,
		monthEnd: 1,
	},
	{
		id: "chk-vacina-bebe-1",
		title: "[EXEMPLO] Vacina do bebê",
		description: "Substituir pelo item oficial do calendário do Ministério da Saúde.",
		kind: "VACINA",
		target: "BEBE",
		monthStart: 0,
		monthEnd: 2,
	},
];

// ---------- Conteúdos de exemplo ----------
// Todos ficam com validated = false até um profissional revisar.
// O texto é apenas um marcador: substitua por conteúdo real e validado.
type SeedContent = Omit<Prisma.ContentUncheckedCreateInput, "categoryId"> & {
	categorySlug: string;
};

const placeholderBody =
	"## Conteúdo de exemplo\n\nEste texto é um marcador para testes. Substitua por conteúdo real e peça validação de um profissional de saúde antes de publicar.";

const contents: SeedContent[] = [
	{
		id: "content-exemplo-1",
		title: "[EXEMPLO] Primeiros passos do pré-natal",
		summary: "Resumo de exemplo para o começo da gestação.",
		body: placeholderBody,
		type: "TEXT",
		stage: "PRENATAL",
		weekStart: 1,
		weekEnd: 13,
		categorySlug: "saude-da-gestante",
	},
	{
		id: "content-exemplo-2",
		title: "[EXEMPLO] Alimentação na gestação",
		summary: "Resumo de exemplo sobre alimentação.",
		body: placeholderBody,
		type: "TEXT",
		stage: "PRENATAL",
		weekStart: 14,
		weekEnd: 27,
		categorySlug: "alimentacao",
	},
	{
		id: "content-exemplo-3",
		title: "[EXEMPLO] Preparando-se para o parto",
		summary: "Resumo de exemplo sobre o parto.",
		body: placeholderBody,
		type: "TEXT",
		stage: "PARTO",
		weekStart: 36,
		weekEnd: 42,
		categorySlug: "saude-da-gestante",
	},
	{
		id: "content-exemplo-4",
		title: "[EXEMPLO] Vídeo: cuidados no pós-parto",
		summary: "Exemplo de conteúdo em vídeo (troque o link).",
		videoUrl: "https://www.youtube.com/watch?v=SUBSTITUIR",
		type: "VIDEO",
		stage: "POSPARTO",
		monthStart: 0,
		monthEnd: 1,
		categorySlug: "higiene-e-cuidados",
	},
	{
		id: "content-exemplo-5",
		title: "[EXEMPLO] Cuidados com o bebê nos primeiros meses",
		summary: "Resumo de exemplo para o primeiro ano.",
		body: placeholderBody,
		type: "TEXT",
		stage: "PRIMEIRO_ANO",
		monthStart: 2,
		monthEnd: 6,
		categorySlug: "bebe",
	},
	{
		id: "content-exemplo-6",
		title: "[EXEMPLO] Onde buscar apoio na sua região",
		summary: "Exemplo de conteúdo sobre rede de apoio.",
		body: placeholderBody,
		type: "TEXT",
		stage: "PRENATAL",
		weekStart: 1,
		weekEnd: 42,
		categorySlug: "apoio",
	},
];

async function main() {
	// Admin: não sobrescreve a senha se já existir
	const passwordHash = await bcrypt.hash(adminPassword!, 10);
	await prisma.user.upsert({
		where: { email: adminEmail! },
		update: {},
		create: {
			name: "Administração Econchego",
			email: adminEmail!,
			passwordHash,
			role: "ADMIN",
			consentAt: new Date(),
			consentVersion: "seed",
		},
	});

	// Categorias
	for (const category of categories) {
		await prisma.category.upsert({
			where: { slug: category.slug },
			update: { name: category.name },
			create: category,
		});
	}

	// Selos
	for (const badge of badges) {
		await prisma.badge.upsert({
			where: { code: badge.code },
			update: {
				title: badge.title,
				description: badge.description,
				icon: badge.icon,
			},
			create: badge,
		});
	}

	// Checklist
	for (const item of checklistItems) {
		const { id, ...data } = item;
		await prisma.checklistItem.upsert({
			where: { id: id! },
			update: data,
			create: item,
		});
	}

	// Conteúdos: update vazio para não apagar validação nem edições feitas depois
	const categoryRows = await prisma.category.findMany();
	const categoryIdBySlug = new Map(categoryRows.map((c) => [c.slug, c.id]));

	for (const content of contents) {
		const { categorySlug, ...data } = content;
		const categoryId = categoryIdBySlug.get(categorySlug);
		if (!categoryId) {
			throw new Error(`Categoria não encontrada: ${categorySlug}`);
		}
		await prisma.content.upsert({
			where: { id: data.id! },
			update: {},
			create: { ...data, categoryId, published: true, validated: false },
		});
	}

	console.log("Seed concluído.");
}

main()
	.catch((error) => {
		console.error("Erro no seed:", error);
		process.exitCode = 1;
	})
	.finally(async () => {
		await prisma.$disconnect();
	});