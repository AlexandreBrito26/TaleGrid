# TaleGrid

> Plataforma de histórias de RPG, fantasia e ficção — **100% frontend**, sem backend.

![TaleGrid](https://img.shields.io/badge/React-18-61dafb?style=flat-square&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178c6?style=flat-square&logo=typescript)
![MirageJS](https://img.shields.io/badge/MirageJS-mock%20API-orange?style=flat-square)
![Vercel](https://img.shields.io/badge/Deploy-Vercel-black?style=flat-square&logo=vercel)

---

## Sobre

TaleGrid é uma plataforma para leitura e publicação de histórias literárias. Autores podem criar histórias, escrever capítulos e publicá-los. Leitores podem navegar pelo feed, filtrar por gênero e ler os capítulos com uma experiência limpa e imersiva.

O projeto é **frontend-only**: toda a API é simulada pelo [MirageJS](https://miragejs.com/) diretamente no browser, sem nenhum servidor real. Isso significa que pode ser hospedado em qualquer CDN/static host (Vercel, Netlify, GitHub Pages).

---

## Stack

| Camada | Tecnologia |
|---|---|
| UI | React 18 + TypeScript |
| Roteamento | React Router v6 |
| Estilização | SCSS com BEM + CSS Variables |
| Mock API | MirageJS |
| HTTP Client | Axios |
| Tipografia | Cinzel / Lora / DM Sans |
| Deploy | Vercel |

---

## Funcionalidades

### Leitura (público)
- Feed de histórias com busca por texto e filtro por gênero
- Página de detalhes da história com lista de capítulos
- Leitor de capítulos com barra de progresso de leitura
- Navegação entre capítulos (anterior / próximo)

### Autoria (requer login)
- Login e registro de conta
- Painel do autor com listagem de todas as histórias
- Criar / editar histórias (título, gênero, sinopse)
- Criar / editar capítulos com editor de texto e contador de palavras
- Publicar e despublicar histórias e capítulos
- Deletar histórias

---

## Dados de seed

O MirageJS carrega automaticamente dados de demonstração:

**Contas disponíveis** (todas com senha `senha123`):

| E-mail | Autor |
|---|---|
| `demo@talegrid.com` | Demo Autor |
| `elara@talegrid.com` | Elara Nightwhisper |
| `viktor@talegrid.com` | Viktor Solen |
| `mara@talegrid.com` | Mara Stonehaven |

**Histórias pré-carregadas:** 8 histórias em gêneros variados (Fantasia, Ficção Científica, RPG, Terror, Aventura, Mistério) com capítulos completos e conteúdo original.

---

## Estrutura do projeto

```
src/
├── App.tsx                        # Roteamento + lazy loading
├── index.tsx                      # Entry point + boot do MirageJS
│
├── components/
│   ├── Navbar/                    # Navbar sticky com auth
│   ├── Spinner/                   # Loading indicator
│   └── StoryCard/                 # Card do feed
│
├── context/
│   └── AuthProvider.tsx           # Context global de autenticação
│
├── hooks/
│   ├── useAuth.ts                 # Hook de acesso ao AuthContext
│   └── useReadingProgress.ts      # Progresso de leitura por scroll
│
├── mirage/
│   ├── server.ts                  # Rotas e lógica da API mock
│   └── fixtures.ts                # Dados de seed (usuários, histórias, capítulos)
│
├── pages/
│   ├── Feed/                      # Página inicial — listagem pública
│   ├── Login/                     # Login + registro
│   ├── StoryDetail/               # Detalhes + lista de capítulos
│   ├── Chapter/                   # Leitor de capítulo
│   ├── Dashboard/                 # Painel do autor
│   ├── StoryEditor/               # Criar / editar história
│   └── ChapterEditor/             # Criar / editar capítulo
│
├── services/
│   ├── api.ts                     # Instância Axios + interceptors JWT
│   ├── authService.ts             # Login, registro, me()
│   └── storyService.ts            # Feed, histórias, capítulos (autor e público)
│
├── styles/
│   ├── _variables.scss            # Tokens: cores, tipografia, espaçamento
│   └── global.scss                # Reset, base, animações globais
│
└── types/
    └── index.ts                   # Tipos compartilhados (User, Story, Chapter…)
```

---

## Rodando localmente

```bash
# 1. Instalar dependências
npm install

# 2. Iniciar em modo desenvolvimento
npm start
```

O app abre em `http://localhost:3000`. O MirageJS é ativado automaticamente em `development` e intercepta todas as chamadas `/api/*`.

---

## Deploy no Vercel

1. Suba a pasta do projeto em um repositório GitHub
2. Importe o repositório no [vercel.com](https://vercel.com)
3. As configurações são detectadas automaticamente (Create React App):
   - **Build Command:** `react-scripts build`
   - **Output Directory:** `build`
4. Clique em **Deploy**

O arquivo `vercel.json` já está configurado para redirecionar todas as rotas para `index.html`, garantindo que o React Router funcione corretamente ao recarregar a página ou acessar uma URL diretamente.

```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

---

## API mock (MirageJS)

Todas as rotas estão em `src/mirage/server.ts`. As rotas disponíveis são:

```
POST   /api/auth/login
POST   /api/auth/register
GET    /api/auth/me

GET    /api/stories               ?q=&genre=
GET    /api/stories/:id
GET    /api/stories/:id/chapters
GET    /api/stories/:id/chapters/:chapterId

GET    /api/author/stories
POST   /api/author/stories
PATCH  /api/author/stories/:id
DELETE /api/author/stories/:id
POST   /api/author/stories/:id/publish

GET    /api/author/stories/:id/chapters
POST   /api/author/stories/:id/chapters
PATCH  /api/author/stories/:id/chapters/:chapterId
DELETE /api/author/stories/:id/chapters/:chapterId
```

Autenticação via JWT simulado em Base64. O token é armazenado no `localStorage` e injetado automaticamente pelo interceptor do Axios.

---

## Próximos passos

Para evoluir o projeto com um backend real:

- Substituir o MirageJS por chamadas para uma API REST (Spring Boot, Node.js, etc.)
- Remover `src/mirage/` e ajustar o `baseURL` em `src/services/api.ts`
- Adicionar upload de capa para as histórias
- Implementar sistema de comentários e favoritos
- Paginação no feed

---

## Licença

MIT
