# Econchego: frontend

Interface web instalável (PWA) do Econchego, voltada a gestantes e mães de bebês de até 1 ano. Consome a API do backend (Fastify + Prisma) e foi pensada para o celular.

> Este README cobre só o frontend. O projeto completo, o modelo de dados e o roadmap estão no README da raiz do repositório.

## Requisitos

- Node.js 20.19 ou superior (ou 22.12+), exigência do Vite
- npm
- Backend rodando (por padrão em `http://localhost:3333`). Veja o README do backend

## Como rodar

```bash
cd frontend
npm install
cp .env.example .env     # no PowerShell: Copy-Item .env.example .env
npm run dev              # http://localhost:5173
```

O backend precisa estar de pé e o `CORS_ORIGIN` dele deve incluir `http://localhost:5173`.

### Variáveis de ambiente

| Variável | Para que serve | Exemplo |
|---|---|---|
| `VITE_API_URL` | URL base da API, **já com o prefixo `/api`** | `http://localhost:3333/api` |

Em produção, aponte para a URL do backend no Render (por exemplo `https://seu-backend.onrender.com/api`) e inclua o domínio do Vercel no `CORS_ORIGIN` do backend.

### Testar no celular

```bash
npm run dev -- --host
```

Abra `http://IP-DO-SEU-PC:5173` no celular, com os dois na mesma rede Wi-Fi. Inclua esse endereço no `CORS_ORIGIN` do backend (separado por vírgula) e use o IP do PC também no `VITE_API_URL`.

## Scripts

| Comando | O que faz |
|---|---|
| `npm run dev` | Servidor de desenvolvimento com recarga automática |
| `npm run build` | Verifica os tipos (`tsc -b`) e gera a versão de produção em `dist/` |
| `npm run preview` | Serve o `dist/` localmente para conferir o build |
| `npm run lint` | Roda o ESLint |

## Dependências

### Instaladas por `npm install`

| Pacote | Uso |
|---|---|
| `react`, `react-dom` | Biblioteca de interface |
| `react-router-dom` | Rotas e rotas protegidas |
| `@tanstack/react-query` | Busca de dados da API e cache |
| `tailwindcss`, `@tailwindcss/vite`, `tw-animate-css` | Estilos |
| `shadcn`, `radix-ui`, `class-variance-authority`, `clsx`, `tailwind-merge` | Base dos componentes de `components/ui` |
| `lucide-react` | Ícones |
| `sonner`, `next-themes` | Avisos (toasts). O `next-themes` é exigido pelo componente `sonner` do shadcn |
| `@fontsource-variable/nunito` | Fonte do app |

Ferramentas de desenvolvimento: `vite`, `@vitejs/plugin-react`, `typescript`, `eslint` (com `typescript-eslint` e os plugins de React) e `@types/*`.

Se o projeto herdou o `@fontsource-variable/geist` do front antigo e nada mais o importa, pode removê-lo: `npm uninstall @fontsource-variable/geist`.

### Instalação do zero (se montar o projeto sem o `package.json` antigo)

```bash
npm install @tanstack/react-query @fontsource-variable/nunito
npx shadcn@latest add button card input label skeleton sonner tooltip separator \
  tabs checkbox badge textarea select progress dialog accordion --overwrite
```

### Componentes do shadcn

Os componentes ficam em `src/components/ui` e são código do próprio projeto. Para adicionar outro:

```bash
npx shadcn@latest add nome-do-componente
```

## Se o projeto veio do front antigo

Alguns componentes de `src/components/ui` copiados do projeto antigo estão incompletos ou desatualizados. Para garantir as versões oficiais, reinstale os que as telas usam:

```bash
npx shadcn@latest add button card input label skeleton sonner tooltip dialog checkbox --overwrite
```

Se o `--overwrite` regravar algum componente que você tenha personalizado, o Git mostra a diferença antes do commit. Como o front antigo era um projeto à parte, não deve haver edição manual nos arquivos do `ui`.

No `tsconfig.app.json` (e no `tsconfig.json` da raiz), mantenha apenas `paths` e não use `baseUrl`, que o TypeScript 6 marca como obsoleto:

```jsonc
"paths": { "@/*": ["./src/*"] }
```

## Estrutura de pastas

```
frontend/
├── index.html
├── .env.example
└── src/
    ├── main.tsx            # providers: React Query, Router e Auth
    ├── App.tsx             # rotas + avisos (Toaster)
    ├── index.css           # tema (cores da marca) e fonte
    ├── routes/             # AppRoutes e ProtectedRoute
    ├── layouts/            # PublicLayout (login/cadastro) e AppLayout (navegação inferior)
    ├── pages/              # uma página por tela
    ├── components/         # componentes próprios; ui/ é do shadcn
    ├── context/            # AuthContext (sessão da usuária)
    ├── hooks/              # useAuth e hooks de dados
    ├── services/           # api.ts (cliente HTTP) e um serviço por módulo do backend
    ├── lib/                # utils.ts, dates.ts, phase.ts
    └── types/              # tipos das respostas da API
```

## Como o front conversa com a API

- Todas as chamadas passam por `src/services/api.ts` (`api.get`, `api.post`, `api.patch`...). Ele já envia o token (`Authorization: Bearer`), converte os erros e avisa o `AuthContext` quando a sessão expira (401).
- Erros de validação do backend chegam como `{ message, issues: [{ field, message }] }`. Use `getFieldErrors(error)` para mostrar cada mensagem no campo certo e `getErrorMessage(error)` para a mensagem geral.
- A sessão (token e dados da usuária) fica no `localStorage`, na chave `econchego:auth-session`. Ao abrir o app, ela é confirmada com `GET /auth/me`.
- A fase da usuária (semana de gestação ou meses do bebê) **vem calculada do backend** no campo `phase`. O front não recalcula nada.
- Datas chegam como texto ISO (por exemplo `2027-02-25T00:00:00.000Z`).

### Convenção para novas telas

1. Tipos da resposta em `src/types/`.
2. Funções de chamada em `src/services/<modulo>Service.ts`.
3. Busca com `useQuery` (leitura) ou `useMutation` (escrita), de preferência dentro de um hook em `src/hooks/`.
4. Página em `src/pages/` e rota em `src/routes/AppRoutes.tsx`.

Os imports usam o alias `@/` (aponta para `src/`), por exemplo `import { api } from '@/services/api'`.

## Rotas atuais

| Rota | Acesso | Tela |
|---|---|---|
| `/login` | pública | Entrar |
| `/cadastro` | pública | Criar conta, com termo de consentimento (LGPD) |
| `/home` | logada | Início (provisória: mostra a fase e a contagem de conteúdos) |
| `/biblioteca`, `/checklist`, `/duvidas`, `/perfil` | logada | Em construção |

Quem já está logada e abre `/login` ou `/cadastro` é levada para `/home`. Quem não está logada e abre uma rota privada vai para `/login` e volta para a rota original depois de entrar.

## Identidade visual

O tema fica em `src/index.css`. As cores da marca estão disponíveis como classes do Tailwind (`bg-brand-olive`, `text-brand-coral` etc.):

| Token | Cor |
|---|---|
| `brand-olive` | `#7d8b4e` |
| `brand-orange` | `#ee8434` |
| `brand-coral` | `#e5726e` |
| `brand-blue` | `#0b5a7e` (cor dos botões principais) |
| `brand-brown` | `#bf7b30` |
| `background` | `#fffbf1` |

Os valores são aproximados a partir dos slides do projeto. Confirme com o arquivo da logo.

O logotipo (`components/Logo.tsx`) e as formas decorativas (`components/Decoration.tsx`) são provisórios e devem ser trocados pelos arquivos oficiais.

## Problemas comuns

| Sintoma | Causa provável |
|---|---|
| "Sem conexão com o servidor" ao entrar | Backend desligado, ou `VITE_API_URL` errada (falta o `/api` no final) |
| Erro de CORS no console do navegador | O endereço do front não está no `CORS_ORIGIN` do backend |
| Volta para o login sozinho depois de um tempo | Token expirado (dura 7 dias). Comportamento esperado |
| Erro ao importar `@/components/ui/...` | Componente do shadcn ainda não instalado: `npx shadcn@latest add <nome>` |
| `npm run build` falha com import não encontrado | Sobrou arquivo do projeto antigo. O erro do `tsc` indica qual |
| `Module '@/components/ui/card' has no exported member 'CardContent'` (ou outro componente do `ui`) | O componente veio do front antigo em versão reduzida. Reinstale: `npx shadcn@latest add card --overwrite` |
| `'React' is declared but never read` em `components/ui/*` | Import de `React` sem uso. Apague a linha `import * as React from 'react'` do arquivo |

## Roadmap do frontend

- [x] Base do projeto, tema, cliente da API e autenticação
- [x] Login e cadastro com consentimento
- [ ] Home completa ("Sua semana")
- [ ] Biblioteca e tela de conteúdo
- [ ] Checklist (consultas, exames e vacinas)
- [ ] Dúvidas e avaliação
- [ ] Perfil, selos, exportar dados e excluir conta
- [ ] Painel admin
- [ ] PWA (`vite-plugin-pwa`, manifest e ícones) e deploy na Vercel