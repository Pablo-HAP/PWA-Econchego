# Econchego

Aplicativo web instalável (PWA) que acompanha gestantes e mães de bebês de até 1 ano com **conteúdo confiável, checklist de consultas, exames e vacinas, e incentivos simples para manter o cuidado em dia**.

Projeto de impacto social desenvolvido por universitários da UNESP (Bauru), com foco em gestantes em situação de vulnerabilidade em Bauru e no Centro-Oeste Paulista.

---

## Sumário

1. [O problema](#1-o-problema)
2. [O que o Econchego propõe](#2-o-que-o-econchego-propõe)
3. [Funcionalidades](#3-funcionalidades)
4. [Como funciona](#4-como-funciona)
5. [Tecnologias](#5-tecnologias)
6. [Arquitetura e estrutura de pastas](#6-arquitetura-e-estrutura-de-pastas)
7. [Modelo de dados](#7-modelo-de-dados)
8. [Metas e indicadores](#8-metas-e-indicadores)
9. [LGPD e privacidade](#9-lgpd-e-privacidade)
10. [Como rodar localmente](#10-como-rodar-localmente)
11. [Roadmap e status do projeto](#11-roadmap-e-status-do-projeto)
12. [Deploy](#12-deploy)
13. [Equipe e referências](#13-equipe-e-referências)

---

## 1. O problema

O pré-natal na rede pública costuma ser conduzido de forma protocolar, com pouco espaço para diálogo e para tirar dúvidas. Em áreas periféricas de Bauru, o acesso a serviços de saúde e a informação de qualidade é limitado. Isso leva a gestantes isoladas de informação, dúvidas sem resposta, baixa adesão a consultas e exames, e riscos à saúde da mãe e do bebê.

## 2. O que o Econchego propõe

Uma plataforma leve, acessível pelo celular, que:

- entrega **conteúdo educativo validado** (texto e vídeo) sobre pré-natal, parto, pós-parto e primeiro ano do bebê;
- mostra **o que fazer em cada fase**: consultas, exames e vacinas recomendados pelo Ministério da Saúde;
- **incentiva** a usuária a manter o acompanhamento com selos e uma meta semanal gentil;
- permite **enviar dúvidas** e receber resposta;
- gera **dados agregados e anônimos** para medir o impacto do projeto.

**Alinhamento com os ODS da ONU:** ODS 3 (Saúde e Bem-Estar), ODS 4 (Educação de Qualidade) e ODS 10 (Redução das Desigualdades).

**Público-alvo:** gestantes, mães e famílias de regiões periféricas de Bauru com acesso reduzido a serviços de saúde e a informação confiável.

**Por que PWA e não app de loja?** Um PWA é instalado direto do navegador, pesa poucos MB, atualiza sozinho, não depende de aprovação de loja e usa um único código. Se no futuro o projeto for para as lojas, o mesmo front pode ser empacotado com Capacitor.

## 3. Funcionalidades

### Para a usuária

| Funcionalidade | Descrição |
|---|---|
| Cadastro com consentimento | Aceite do termo LGPD, escolha entre "estou grávida" e "meu bebê já nasceu", com a data correspondente |
| Conteúdo da sua fase | A Home mostra o que é recomendado para a semana de gestação ou para o mês de vida do bebê |
| Biblioteca | Todos os conteúdos, com filtros por etapa, categoria e semana |
| Leitura e vídeo | Conteúdo em texto ou vídeo incorporado, com botão "Concluir" |
| Checklist | Consultas, exames e vacinas (da mãe e do bebê), com marcação de "feito" e data agendada |
| Incentivo | Selos por ações de saúde e card "Sua semana" na Home |
| Dúvidas | A usuária envia perguntas e acompanha as respostas |
| Avaliação | Nota de 1 a 5 e comentário opcional |
| Privacidade | Exportar os próprios dados e excluir a conta |

### Para a equipe (painel admin)

- cadastro, edição e **validação** de conteúdo por profissional;
- resposta às dúvidas das usuárias;
- lista de bugs (não conformidades);
- painel de métricas com as metas do projeto;
- exportação de dados **agregados e anônimos** para comparação com dados públicos de saúde.

### Mecânica de incentivo

Optamos por **selos e meta semanal**, e não por sequência diária. Uma sequência diária pune quem ficou sem internet ou sem tempo, o que pesa justamente sobre o público mais vulnerável.

Selos previstos: Primeiro passo, Semana em dia, Consulta feita, Exame feito, Vacina em dia e Curiosa (primeira dúvida enviada).

## 4. Como funciona

### Fase da usuária

O app não guarda "a semana atual". Guarda só a **data prevista do parto** (`dueDate`) ou a **data de nascimento do bebê** (`birthDate`) e calcula a fase a cada acesso, assim ela nunca fica desatualizada.

| Situação | Cálculo | Conteúdo filtrado por |
|---|---|---|
| Grávida | `40 - ceil((dueDate - hoje) / 7 dias)` | semana (`weekStart`/`weekEnd`) |
| Bebê já nasceu | `floor((hoje - birthDate) / 30,44 dias)` | mês de vida (`monthStart`/`monthEnd`) |

Se a gestação passa da semana 42 sem data de nascimento, o app pergunta "Seu bebê já nasceu?" e troca de fase.

### Fluxo de uma requisição no backend

```
Rota → Controller → Service → Prisma → PostgreSQL
```

| Camada | Responsabilidade |
|---|---|
| **routes** | Liga URL e método HTTP a um controller, com ou sem autenticação |
| **controller** | Lê a requisição, valida com Zod, chama o service e devolve a resposta |
| **service** | Regras de negócio e consultas ao banco |
| **schemas** | Validação de entrada (Zod), com mensagens em português |
| **types** | Tipos TypeScript do módulo |

Erros são tratados por um **handler único** (`AppError` e `ZodError`), sem `try/catch` repetido nos controllers.

### Autenticação e permissões

- Login devolve um **JWT**; o front envia `Authorization: Bearer <token>`.
- Senhas são guardadas com **bcrypt**.
- Rotas privadas usam um `preHandler` de autenticação; rotas do painel exigem `role === 'ADMIN'`.

### Selos

Uma função `awardBadges(userId)` roda depois de concluir um conteúdo ou marcar um item do checklist, verifica as condições e cria o selo se ainda não existir. Uma restrição única no banco impede selo duplicado.

### Lembretes

No MVP não há notificação push nem tarefa agendada. O front lista os itens do checklist cuja janela de semanas ou meses está aberta e que ainda não foram feitos, ou cuja data agendada está próxima.

## 5. Tecnologias

| Camada | Tecnologia |
|---|---|
| Linguagem | TypeScript |
| Runtime | Node.js 20+ |
| Backend | Fastify |
| Validação | Zod |
| Autenticação | @fastify/jwt e bcryptjs |
| Segurança | @fastify/cors, @fastify/helmet, @fastify/rate-limit |
| ORM | Prisma |
| Banco | PostgreSQL (Docker em desenvolvimento, Neon em produção) |
| Frontend | React, Vite e TypeScript |
| Interface | Tailwind CSS e shadcn/ui |
| Dados no front | TanStack Query e React Router |
| PWA | vite-plugin-pwa |
| Hospedagem | Render (back), Vercel (front) e Neon (banco) |

## 6. Arquitetura e estrutura de pastas

Monolito em camadas, escolhido por ser barato de hospedar e simples de manter.

```
econchego/
├── .github/
│   └── instructions/            # instruções de código (TypeScript, API)
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma        # modelo de dados
│   │   ├── migrations/
│   │   └── seed.ts              # admin, categorias, selos, checklist, conteúdos
│   ├── docker-compose.yml       # PostgreSQL local
│   └── src/
│       ├── app.ts               # cria o Fastify e registra plugins e erros
│       ├── server.ts            # inicia o servidor
│       ├── config/env.ts        # lê e valida o .env
│       ├── lib/                 # prisma.ts, errors.ts, pregnancy.ts
│       ├── routes/index.ts      # registra os módulos com prefixo /api
│       └── modules/
│           ├── auth/            # cadastro, login, perfil
│           ├── contents/        # biblioteca e conteúdo por fase
│           ├── progress/        # conclusão de conteúdos e selos
│           ├── checklist/       # consultas, exames e vacinas
│           ├── questions/       # dúvidas das usuárias
│           ├── feedback/        # avaliação de 1 a 5
│           ├── bugs/            # não conformidades
│           └── admin/           # métricas, validação e exportação
└── frontend/
    └── src/
        ├── pages/               # Home, Biblioteca, Conteúdo, Checklist, Dúvidas, Perfil, Admin
        ├── components/          # ui/ (shadcn) e componentes próprios
        ├── lib/                 # api.ts, auth.ts
        └── routes.tsx
```

Cada módulo do backend tem `x.routes.ts`, `x.controller.ts`, `x.service.ts`, `x.schemas.ts` e `x.types.ts`.

### Endpoints principais

| Módulo | Endpoints |
|---|---|
| auth | `POST /auth/register`, `POST /auth/login`, `GET /auth/me` |
| contents | `GET /contents`, `GET /contents/for-me`, `GET /contents/:id`; admin: `POST`, `PUT`, `PATCH /:id/validate` |
| progress | `POST /contents/:id/complete` |
| checklist | `GET /checklist`, `PATCH /checklist/:itemId` |
| questions | `POST /questions`, `GET /questions/mine`; admin: `GET /questions`, `PATCH /:id/answer` |
| feedback | `POST /feedback` |
| bugs | `POST /bugs`; admin: `GET /bugs`, `PATCH /:id` |
| admin | `GET /admin/metrics`, `GET /admin/metrics/export` |

## 7. Modelo de dados

Resumo das tabelas (o detalhe está em `backend/prisma/schema.prisma`):

| Tabela | Para que serve |
|---|---|
| `User` | Conta, papel (usuária ou admin), `dueDate`, `birthDate`, consentimento LGPD |
| `Category` | Categorias de conteúdo |
| `Content` | Conteúdo em texto ou vídeo, com etapa, janela de semanas ou meses, e validação |
| `ContentProgress` | Quais conteúdos cada usuária concluiu |
| `ChecklistItem` | Catálogo de consultas, exames e vacinas (para a mãe ou para o bebê) |
| `UserChecklist` | O que cada usuária já fez ou agendou |
| `Badge` e `UserBadge` | Selos e quem os conquistou |
| `Question` | Dúvidas e respostas |
| `Feedback` | Avaliações de 1 a 5 |
| `BugReport` | Não conformidades, com status |

Etapas de conteúdo: `PRENATAL`, `PARTO`, `POSPARTO` e `PRIMEIRO_ANO`. Itens do checklist têm alvo `MAE` ou `BEBE` e tipo `CONSULTA`, `EXAME` ou `VACINA`.

**Calendário de vacinas e consultas:** o seed segue o calendário vigente do Ministério da Saúde (PNI) e deve ser revisado por profissional de saúde antes de ir ao ar.

## 8. Metas e indicadores

| Meta do projeto | Como é medida |
|---|---|
| Taxa de conclusão de pelo menos 80% das atividades do MVP | `ContentProgress` em relação a usuárias × conteúdos publicados |
| Satisfação igual ou superior a 4 em 5 | Média de `Feedback.rating` |
| Pelo menos 80% dos conteúdos validados | `Content.validated` |
| Pelo menos 20 usuárias no teste do MVP | Contagem de `User` |
| Pelo menos 20 sessões de escuta ou validação por ciclo | Registro manual da equipe |
| Redução mensal das não conformidades | `BugReport` agrupado por mês |

Todas aparecem em `/admin/metrics`.

### Comparação com dados públicos

O cruzamento com dados da saúde é feito com **números agregados**, nunca com dados individuais:

1. o app exporta um CSV agregado e anônimo (por UBS de referência ou região), ocultando grupos com menos de 5 pessoas;
2. a equipe obtém dados públicos (DATASUS/TabNet, base SINASC, e dados da Secretaria Municipal de Saúde de Bauru, via Lei de Acesso à Informação);
3. os números são comparados numa planilha.

Com poucas usuárias no MVP, a comparação indica **tendência** e não tem valor de prova estatística.

## 9. LGPD e privacidade

- Consentimento registrado no cadastro (`consentAt` e `consentVersion`). Como o app trata dados de saúde, que são **dados pessoais sensíveis**, o termo explica quais dados são guardados e para quê.
- Coleta mínima de dados; localização (UBS ou bairro) é opcional.
- Senhas com hash (bcrypt) e rate limit no login.
- Direito de exportar os próprios dados e de excluir a conta (os dados da usuária são apagados em cascata).
- Logs sem dados sensíveis.
- Métricas exportadas são agregadas e anônimas.

## 10. Como rodar localmente

**Requisitos:** Node.js 20+, npm e, para o banco local, Docker Desktop (ou uma URL de banco Neon).

```bash
# 1. Backend
cd backend
cp .env.example .env          # preencha DATABASE_URL e JWT_SECRET
docker compose up -d          # sobe o PostgreSQL (pule se usar Neon)
npm install
npx prisma migrate dev --name init
npx prisma db seed
npm run dev                   # http://localhost:3333

# 2. Frontend (em outro terminal)
cd frontend
npm install
npm run dev                   # http://localhost:5173
```

Variáveis do `.env`:

```
DATABASE_URL="postgresql://econchego:econchego@localhost:5432/econchego"
JWT_SECRET="troque-por-uma-string-longa-e-aleatoria"
PORT=3333
CORS_ORIGIN="http://localhost:5173"
```

Para ver o banco no navegador: `npx prisma studio`.

> O Docker é usado **apenas para o banco em desenvolvimento**. A aplicação não precisa ser dockerizada.

## 11. Roadmap e status do projeto

Marque cada item ao concluir. O histórico de commits mostra quando cada fase foi feita.

### Fase 0: preparação
- [ ] Repositório criado com a estrutura de pastas
- [ ] Arquivos genéricos aproveitados do projeto anterior (config, lib, app, tsconfig, eslint)
- [ ] Código específico do projeto anterior removido
- [ ] `npm run dev` sobe o servidor vazio sem erro

### Fase 1: banco de dados
- [ ] PostgreSQL no ar (Docker ou Neon)
- [ ] `schema.prisma` completo
- [ ] Migration inicial aplicada
- [ ] `seed.ts` com admin, categorias, selos, checklist e conteúdos de exemplo
- [ ] Prisma Studio mostra as tabelas e os dados

### Fase 2: base do backend e autenticação
- [ ] `config/env.ts`, `lib/prisma.ts` e `lib/errors.ts`
- [ ] Handler de erros único
- [ ] Plugins: cors, helmet, jwt e rate-limit
- [ ] Módulo `auth` (cadastro com consentimento, login e perfil)
- [ ] Fluxo testado no Insomnia ou Bruno

### Fase 3: conteúdo, checklist e progresso
- [ ] `lib/pregnancy.ts` (cálculo da fase)
- [ ] Módulo `contents` com filtros e `for-me`
- [ ] Módulo `progress`
- [ ] Módulo `checklist` (consultas, exames e vacinas)
- [ ] Gestante e mãe de bebê recebem conteúdos e checklists diferentes

### Fase 4: incentivo e interação
- [ ] `awardBadges` ligado a progresso e checklist
- [ ] Módulos `questions`, `feedback` e `bugs`
- [ ] Concluir o primeiro conteúdo gera o selo

### Fase 5: frontend da usuária
- [ ] `lib/api.ts` e TanStack Query
- [ ] Cadastro e login
- [ ] Home ("Sua semana")
- [ ] Biblioteca e tela de conteúdo
- [ ] Checklist
- [ ] Dúvidas e avaliação
- [ ] Perfil e selos
- [ ] Testado no celular por alguém de fora do grupo

### Fase 6: admin, métricas e LGPD
- [ ] Painel admin (conteúdo, validação, dúvidas e bugs)
- [ ] `/admin/metrics` com as metas do projeto
- [ ] Exportação CSV agregada e anônima
- [ ] Política de privacidade
- [ ] Exportar dados e excluir conta

### Fase 7: PWA, deploy e validação
- [ ] `vite-plugin-pwa` com manifest e ícones
- [ ] Deploy (Neon, Render e Vercel)
- [ ] Conteúdos revisados por profissional de saúde
- [ ] Teste do MVP com pelo menos 20 gestantes

**Prioridade se o tempo apertar.** Cortar nesta ordem: exportar dados do usuário, exportação CSV, selos além dos três principais, bugs e modo offline do PWA. Não cortar: autenticação, conteúdo por fase, checklist com vacinas e consentimento.

## 12. Deploy

| Parte | Serviço | Observação |
|---|---|---|
| Banco | Neon | Use um banco separado do de desenvolvimento |
| Backend | Render ou Railway | Rode `npx prisma migrate deploy` no banco de produção |
| Frontend | Vercel | Configure a URL da API e o `CORS_ORIGIN` no backend |

## 13. Equipe e referências

**Equipe:** Erick Giulliano Barbosa, Laís Vieira Lavoura e Pablo Henrique Alves Pereira.

**Referência:** FABBRO, Márcia Regina Cangiani et al. *Percepções de gestantes sobre atenção pré-natal em município do interior paulista*. Cadernos Saúde Coletiva, Rio de Janeiro, v. 32, p. e32040107, 2024.

---

> Projeto acadêmico e social em desenvolvimento. O conteúdo de saúde do aplicativo é informativo e **não substitui** a consulta com profissionais de saúde.
