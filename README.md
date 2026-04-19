# TaleGrid v1.0 — Guia de Deploy

## Stack de produção

| Serviço | Plataforma | Custo |
|---------|-----------|-------|
| Front-end React | **Vercel** | Grátis |
| Back-end Spring Boot | **Railway** | ~$5/mês ou grátis no trial |
| Banco PostgreSQL | **Railway** add-on | Incluso |

---

## PASSO 1 — Suba o código no GitHub

```bash
# Na raiz talegrid-final/
git init
git add .
git commit -m "feat: TaleGrid v1.0"
git remote add origin https://github.com/SEU_USUARIO/talegrid.git
git push -u origin main
```

---

## PASSO 2 — Back-end no Railway

### 2.1 Crie o projeto
1. [railway.app](https://railway.app) → login com GitHub
2. **New Project → Deploy from GitHub repo** → selecione `talegrid`
3. Railway detecta `railway.json` automaticamente

### 2.2 Adicione o banco PostgreSQL
1. No projeto → **+ New → Database → PostgreSQL**
2. Railway injeta `DATABASE_URL` automaticamente

### 2.3 Variáveis de ambiente (Railway → Variables)

```
JWT_SECRET     = <rode: openssl rand -base64 64>
GEMINI_API_KEY = <sua chave do Google AI Studio>
FRONTEND_URL   = https://talegrid.vercel.app   ← atualize depois do Passo 3
DDL_AUTO       = update
LOG_LEVEL      = INFO
```

### 2.4 Anote a URL gerada
Algo como: `https://talegrid-backend-production.up.railway.app`

---

## PASSO 3 — Front-end no Vercel

### 3.1 Importe o projeto
1. [vercel.com](https://vercel.com) → login com GitHub
2. **Add New → Project** → selecione `talegrid`
3. Vercel detecta `vercel.json` automaticamente

### 3.2 Variáveis de ambiente (Vercel → Environment Variables)
```
REACT_APP_API_URL = https://talegrid-backend-production.up.railway.app
```
> Cole a URL do Railway do Passo 2.4.

### 3.3 Clique em Deploy

### 3.4 Copie a URL do Vercel
Algo como: `https://talegrid-abc123.vercel.app`

Volte ao Railway → Variables e atualize:
```
FRONTEND_URL = https://talegrid-abc123.vercel.app
```
Depois **Deployments → Redeploy** para o CORS reconhecer o domínio do Vercel.

---

## PASSO 4 — Teste tudo

```bash
# Healthcheck do back-end
curl https://talegrid-backend-production.up.railway.app/actuator/health
# → {"status":"UP"}

# Criar conta
curl -X POST https://talegrid-backend-production.up.railway.app/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Autor Teste","email":"teste@email.com","password":"senha123"}'
# → {"token":"eyJ...","user":{...}}
```

Abra `https://talegrid-abc123.vercel.app` — tela de login deve aparecer.

---

## Rodando localmente

### Pré-requisitos: Node 18+, Java 17+, PostgreSQL

```bash
# Banco
createdb talegrid

# Variáveis do back-end
export DATABASE_URL=jdbc:postgresql://localhost:5432/talegrid
export DB_USER=postgres
export DB_PASS=sua_senha
export JWT_SECRET=$(openssl rand -base64 64)
export FRONTEND_URL=http://localhost:3000

# Back-end
cd backend && ./mvnw spring-boot:run
# → http://localhost:8080

# Front-end (outro terminal)
cp frontend/.env.example frontend/.env.local
# Confirme: REACT_APP_API_URL=http://localhost:8080
cd frontend && npm install && npm start
# → http://localhost:3000
```

---

## Solução de problemas

| Erro | Causa | Solução |
|------|-------|---------|
| `CORS error` no browser | `FRONTEND_URL` errado no Railway | Atualize e faça Redeploy |
| `401` em toda rota | `JWT_SECRET` diferente entre builds | Use o mesmo secret fixo |
| Build falha no Vercel | `REACT_APP_API_URL` não configurado | Adicione antes do deploy |
| Banco não conecta | `DATABASE_URL` não injetada | PostgreSQL add-on no mesmo projeto |
| `404` ao recarregar página | Rewrites não aplicados | Verifique `vercel.json` na raiz |

---

## Estrutura final

```
talegrid/
├── vercel.json              ← SPA rewrites
├── railway.json             ← build + start do back-end
├── Procfile                 ← fallback
├── .gitignore
├── frontend/
│   ├── public/index.html
│   ├── src/
│   │   ├── index.tsx
│   │   ├── App.tsx
│   │   ├── pages/           Login, Feed, Reader, Dashboard
│   │   ├── components/      ImageGeneratorPanel
│   │   ├── services/        authService, storyService, aiService
│   │   ├── hooks/           useReadingProgress
│   │   └── styles/          _variables.scss, global.scss
│   ├── package.json
│   ├── tsconfig.json
│   └── .env.example
└── backend/
    ├── pom.xml
    └── src/main/
        ├── java/com/talegrid/
        │   ├── TaleGridApplication.java
        │   ├── config/      Security, App, GlobalExceptionHandler
        │   ├── controller/  Auth, Story, Chapter, Image
        │   ├── dto/         Auth, Story, Chapter
        │   ├── model/       User, Story, Chapter, ImageGenerationLog
        │   ├── repository/  User, Story, Chapter, ImageGenerationLog
        │   ├── security/    JwtService
        │   └── service/     Auth, Story, Chapter, PdfExtraction, Gemini
        └── resources/
            └── application.properties
```
