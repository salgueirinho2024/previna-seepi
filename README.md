# Previna-Se · Gestão de EPI

Sistema multi-empresa (multi-tenant) de controle de entrega e estoque de EPIs, com
ficha de EPI imprimível, solicitações, aprovação/entrega e coleta de assinatura.

Stack: Next.js 14 (App Router) + Prisma + PostgreSQL (Neon) + NextAuth (login por
e-mail/senha) + Tailwind CSS.

## O que tem pronto neste pacote

- Cadastro de empresa/admin (`/register`) e login (`/login`)
- Painel (`/dashboard`) com indicadores e **avisos de troca periódica** (configurável
  em dias de antecedência)
- Inventário de EPIs com estoque (`/inventario`)
- Colaboradores (`/colaboradores`), vinculados a um **setor** (`/setores`) que define
  quais EPIs são obrigatórios
- Solicitações de EPI → aprovação → entrega → **assinatura manual/escrita**
  (`/solicitacoes`)
- **Devoluções** (`/devolucoes`) — registra devolução de EPI (desligamento, recolhimento
  etc). É só histórico: **não altera o estoque automaticamente**
- **Relatórios** (`/relatorios`) — EPIs entregues por projeto/unidade, com filtro de
  período e totais de custo
- **Configurações** (`/configuracoes`) — dias de antecedência do aviso de troca
- **Ficha de EPI imprimível/PDF por colaborador** (`/ficha-epi/[colaboradorId]`) — histórico
  completo de entregas, CA, datas, próxima troca e declaração de recebimento, pronta para
  imprimir (`Ctrl/Cmd+P` → Salvar como PDF)
- `prisma/seed.ts` com dados de exemplo (1 empresa, 3 setores, 3 colaboradores, 5 itens
  de EPI, 1 entrega já assinada manualmente, 1 devolução de exemplo, 1 solicitação
  pendente)

> ⚠️ Aviso importante: neste ambiente de geração de código eu não tenho acesso de rede
> ao CDN de binários do Prisma (`binaries.prisma.sh`), então **não consegui rodar
> `prisma generate` / `next build` de fato aqui**. Revisei manualmente todo o código
> (nomes de campos, relações e imports) contra o `schema.prisma`, e todos os imports
> `@/...` foram conferidos e existem — mas o primeiro `npm run build` no seu ambiente
> (Codespaces) é o teste real. Se algo passar batido, me manda o erro que eu corrijo.

## Passo a passo

### 1. Criar o banco no Neon

1. Crie uma conta em [neon.tech](https://neon.tech) (tem plano gratuito).
2. Crie um novo projeto → escolha uma região próxima (ex: US East).
3. No painel do projeto, copie a **Connection string** (formato
   `postgresql://usuario:senha@ep-xxxx.neon.tech/nome_do_banco?sslmode=require`).
   Guarde — você vai usar como `DATABASE_URL`.

### 2. Subir o projeto no GitHub

1. Crie um repositório novo (privado, se preferir) no GitHub.
2. No seu computador (ou direto pela interface do GitHub, "Upload files"):
   ```bash
   cd epi-manager
   git init
   git add .
   git commit -m "Primeira versão do sistema de gestão de EPI"
   git branch -M main
   git remote add origin https://github.com/SEU_USUARIO/SEU_REPO.git
   git push -u origin main
   ```

### 3. Abrir no GitHub Codespaces

1. No repositório, clique em **Code → Codespaces → Create codespace on main**.
2. Espere o ambiente carregar (já vem com Node.js).
3. No terminal do Codespaces:
   ```bash
   npm install
   ```
   O `postinstall` já roda `prisma generate` automaticamente.

### 4. Configurar as variáveis de ambiente

1. Copie o arquivo de exemplo:
   ```bash
   cp .env.example .env
   ```
2. Edite `.env` e preencha:
   - `DATABASE_URL` → a connection string do Neon (passo 1)
   - `NEXTAUTH_SECRET` → gere um valor aleatório, por exemplo rodando
     `openssl rand -base64 32` no terminal
   - `NEXTAUTH_URL` → `http://localhost:3000` no Codespaces (ou a URL pública que o
     Codespaces te dá quando você roda `npm run dev` e a porta 3000 abre)

### 5. Criar as tabelas e popular com dados de exemplo

```bash
npx prisma db push
npm run seed
```

Isso cria todas as tabelas no Neon e insere a empresa de demonstração. Login de teste
gerado pelo seed:

- **E-mail:** `admin@demo.com`
- **Senha:** `123456`

### 6. Rodar localmente / testar

```bash
npm run dev
```

Abra a URL que o Codespaces indicar (porta 3000), faça login com o usuário de teste e
navegue até um colaborador → **📄 Ficha de EPI** para ver a ficha pronta para impressão.

### 7. Importar no Vercel

1. Em [vercel.com](https://vercel.com), clique em **Add New → Project** e importe o
   mesmo repositório do GitHub.
2. Em **Environment Variables**, adicione as três mesmas variáveis do `.env`
   (`DATABASE_URL`, `NEXTAUTH_SECRET`, `NEXTAUTH_URL` — aqui `NEXTAUTH_URL` deve ser a
   URL final do Vercel, ex: `https://seu-projeto.vercel.app`).
3. Clique em **Deploy**.
4. Depois do primeiro deploy, se ainda não rodou `prisma db push`/`seed` contra o banco
   de produção, rode novamente esses dois comandos localmente (ou pelo Codespaces)
   apontando para o mesmo `DATABASE_URL` do Neon — o schema é o mesmo banco, então não
   precisa repetir por ambiente.

## Estrutura do projeto

```
app/
  login/, register/         → autenticação
  (app)/                    → área logada (com menu lateral)
    dashboard/               → painel + avisos de troca
    inventario/
    colaboradores/
    setores/                 → cadastro de setores e EPIs obrigatórios
    solicitacoes/
    devolucoes/               → registro de devolução (histórico, não mexe no estoque)
    relatorios/               → relatórios por projeto/unidade
    configuracoes/            → dias de antecedência do aviso de troca
  ficha-epi/[colaboradorId]/ → ficha imprimível (fora do menu lateral)
  api/auth/[...nextauth]/   → rota do NextAuth
components/                 → componentes de UI e formulários
lib/                        → prisma client, auth, sessão, utilitários
prisma/
  schema.prisma             → modelo de dados
  seed.ts                   → dados de exemplo
```

## Próximos passos sugeridos (não incluídos ainda)

- Alertas automáticos por e-mail/WhatsApp (hoje o aviso de troca só aparece no Painel)
- Alerta de validade do CA vencendo (hoje só existe o campo `validadeCA`, sem aviso)
- Exportar relatório geral (todos os colaboradores) em PDF, além da ficha individual
- Convite de novos usuários dentro da mesma empresa (hoje só o admin do cadastro existe)
