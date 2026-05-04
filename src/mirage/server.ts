// @ts-nocheck
// ============================================================
// TaleGrid — MirageJS Server (Frontend-First API Mock)
// ============================================================
import { createServer, Model, Response } from 'miragejs';
import { SEED_USERS, SEED_STORIES, SEED_CHAPTERS } from './fixtures';

// ── Helper ──────────────────────────────────────────────────
function randomDelay(min = 120, max = 380) {
  return new Promise<void>((r) => setTimeout(r, Math.random() * (max - min) + min));
}

function makeToken(userId: string) {
  return btoa(JSON.stringify({ userId, exp: Date.now() + 3600_000 }));
}

function parseToken(token: string): { userId: string } | null {
  try {
    return JSON.parse(atob(token));
  } catch {
    return null;
  }
}

function getCurrentUser(request: any, schema: any) {
  const auth = request.requestHeaders['Authorization'] ?? request.requestHeaders['authorization'] ?? '';
  const token = auth.replace('Bearer ', '');
  if (!token) return null;
  const payload = parseToken(token);
  if (!payload) return null;
  return schema.find('user', payload.userId);
}

function requireAuth(request: any, schema: any) {
  const user = getCurrentUser(request, schema);
  if (!user) return [new Response(401, {}, { message: 'Não autenticado.' }), null] as const;
  return [null, user] as const;
}

// ── Boot ────────────────────────────────────────────────────
export function startMirage({ environment = 'development' } = {}) {
  return createServer({
    environment,

    models: {
      user: Model,
      story: Model,
      chapter: Model,
    },

    seeds(server) {
      SEED_USERS.forEach((u) => server.create('user', u as any));
      SEED_STORIES.forEach((s) => server.create('story', s as any));
      SEED_CHAPTERS.forEach((c) => server.create('chapter', c as any));
    },

    routes() {
      this.namespace = 'api';
      this.timing = 0; // We control timing manually

      // ══════════════════════════════════════════════════════
      // AUTH
      // ══════════════════════════════════════════════════════

      this.post('/auth/login', async (schema, request) => {
        await randomDelay();
        const { email, password } = JSON.parse(request.requestBody);
        const user = schema.all('user').models.find(
          (u: any) => u.email === email && u.password === password
        );
        if (!user) {
          return new Response(401, {}, { message: 'E-mail ou senha incorretos.' });
        }
        const token = makeToken(user.id!);
        return {
          token,
          user: {
            id: user.id,
            name: user.attrs.name,
            email: user.attrs.email,
            role: user.attrs.role,
            createdAt: user.attrs.createdAt,
          },
        };
      });

      this.post('/auth/register', async (schema, request) => {
        await randomDelay();
        const { name, email, password } = JSON.parse(request.requestBody);
        const existing = schema.all('user').models.find((u: any) => u.email === email);
        if (existing) {
          return new Response(409, {}, { message: 'Este e-mail já está em uso.' });
        }
        const user = schema.create('user', {
          name,
          email,
          password,
          role: 'AUTHOR',
          createdAt: new Date().toISOString(),
        } as any);
        const token = makeToken(user.id!);
        return {
          token,
          user: {
            id: user.id,
            name: user.attrs.name,
            email: user.attrs.email,
            role: user.attrs.role,
            createdAt: user.attrs.createdAt,
          },
        };
      });

      this.get('/auth/me', async (schema, request) => {
        await randomDelay(50, 150);
        const [err, user] = requireAuth(request, schema);
        if (err) return err;
        return {
          id: user!.id,
          name: user!.attrs.name,
          email: user!.attrs.email,
          role: user!.attrs.role,
          createdAt: user!.attrs.createdAt,
        };
      });

      // ══════════════════════════════════════════════════════
      // FEED — PUBLIC STORIES
      // ══════════════════════════════════════════════════════

      this.get('/stories', async (schema, request) => {
        await randomDelay();
        const q = (request.queryParams as any).q?.toLowerCase() ?? '';
        const genre = (request.queryParams as any).genre ?? '';

        let stories = schema.all('story').models.filter((s: any) => s.published);

        if (q) {
          stories = stories.filter(
            (s: any) =>
              s.title.toLowerCase().includes(q) ||
              s.attrs.authorName.toLowerCase().includes(q) ||
              s.attrs.description.toLowerCase().includes(q)
          );
        }

        if (genre && genre !== 'Todos') {
          stories = stories.filter((s: any) => s.genre === genre);
        }

        return stories.map((s: any) => ({
          id: s.id,
          title: s.attrs.title,
          description: s.attrs.description,
          genre: s.attrs.genre,
          coverImageUrl: s.attrs.coverImageUrl,
          authorName: s.attrs.authorName,
          chapterCount: s.attrs.chapterCount,
          viewCount: s.attrs.viewCount,
          updatedAt: s.attrs.updatedAt,
        }));
      });

      this.get('/stories/:id', async (schema, request) => {
        await randomDelay();
        const story = schema.find('story', request.params.id);
        if (!story || !story.attrs.published) {
          return new Response(404, {}, { message: 'História não encontrada.' });
        }
        // increment view count
        story.update({ viewCount: story.attrs.viewCount + 1 });
        return story.attrs;
      });

      // ══════════════════════════════════════════════════════
      // AUTHOR — MY STORIES
      // ══════════════════════════════════════════════════════

      this.get('/author/stories', async (schema, request) => {
        await randomDelay();
        const [err, user] = requireAuth(request, schema);
        if (err) return err;
        const stories = schema.all('story').models.filter((s: any) => s.attrs.authorId === user!.id);
        return stories.map((s: any) => s.attrs);
      });

      this.post('/author/stories', async (schema, request) => {
        await randomDelay();
        const [err, user] = requireAuth(request, schema);
        if (err) return err;
        const body = JSON.parse(request.requestBody);
        const story = schema.create('story', {
          ...body,
          authorId: user!.id,
          authorName: user!.attrs.name,
          published: false,
          chapterCount: 0,
          viewCount: 0,
          coverImageUrl: null,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        } as any);
        return story.attrs;
      });

      this.patch('/author/stories/:id', async (schema, request) => {
        await randomDelay();
        const [err, user] = requireAuth(request, schema);
        if (err) return err;
        const story = schema.find('story', request.params.id);
        if (!story || story.attrs.authorId !== user!.id) {
          return new Response(404, {}, { message: 'História não encontrada.' });
        }
        const body = JSON.parse(request.requestBody);
        story.update({ ...body, updatedAt: new Date().toISOString() });
        return story.attrs;
      });

      this.delete('/author/stories/:id', async (schema, request) => {
        await randomDelay();
        const [err, user] = requireAuth(request, schema);
        if (err) return err;
        const story = schema.find('story', request.params.id);
        if (!story || story.attrs.authorId !== user!.id) {
          return new Response(404, {}, { message: 'História não encontrada.' });
        }
        // also delete chapters
        schema
          .all('chapter')
          .models.filter((c: any) => c.attrs.storyId === request.params.id)
          .forEach((c: any) => c.destroy());
        story.destroy();
        return new Response(204);
      });

      this.post('/author/stories/:id/publish', async (schema, request) => {
        await randomDelay();
        const [err, user] = requireAuth(request, schema);
        if (err) return err;
        const story = schema.find('story', request.params.id);
        if (!story || story.attrs.authorId !== user!.id) {
          return new Response(404, {}, { message: 'História não encontrada.' });
        }
        story.update({ published: !story.attrs.published, updatedAt: new Date().toISOString() });
        return story.attrs;
      });

      // ══════════════════════════════════════════════════════
      // CHAPTERS — PUBLIC READ
      // ══════════════════════════════════════════════════════

      this.get('/stories/:storyId/chapters', async (schema, request) => {
        await randomDelay();
        const { storyId } = request.params;
        const chapters = schema
          .all('chapter')
          .models.filter(
            (c: any) => c.attrs.storyId === storyId && c.attrs.published
          )
          .sort((a: any, b: any) => a.attrs.orderIndex - b.attrs.orderIndex);

        return chapters.map((c: any) => ({
          id: c.id,
          storyId: c.attrs.storyId,
          title: c.attrs.title,
          orderIndex: c.attrs.orderIndex,
          wordCount: c.attrs.wordCount,
          readingTimeMinutes: c.attrs.readingTimeMinutes,
          published: c.attrs.published,
          createdAt: c.attrs.createdAt,
        }));
      });

      this.get('/stories/:storyId/chapters/:chapterId', async (schema, request) => {
        await randomDelay();
        const { storyId, chapterId } = request.params;
        const chapter = schema.find('chapter', chapterId);
        if (!chapter || chapter.attrs.storyId !== storyId) {
          return new Response(404, {}, { message: 'Capítulo não encontrado.' });
        }

        const allChapters = schema
          .all('chapter')
          .models.filter(
            (c: any) => c.attrs.storyId === storyId && c.attrs.published
          )
          .sort((a: any, b: any) => a.attrs.orderIndex - b.attrs.orderIndex);

        const idx = allChapters.findIndex((c: any) => c.id === chapterId);
        const prev = idx > 0 ? allChapters[idx - 1] : null;
        const next = idx < allChapters.length - 1 ? allChapters[idx + 1] : null;

        return {
          ...chapter.attrs,
          id: chapter.id,
          hasPrevious: !!prev,
          hasNext: !!next,
          previousChapterId: prev ? prev.id : null,
          nextChapterId: next ? next.id : null,
        };
      });

      // ══════════════════════════════════════════════════════
      // CHAPTERS — AUTHOR CRUD
      // ══════════════════════════════════════════════════════

      this.get('/author/stories/:storyId/chapters', async (schema, request) => {
        await randomDelay();
        const [err, user] = requireAuth(request, schema);
        if (err) return err;
        const story = schema.find('story', request.params.storyId);
        if (!story || story.attrs.authorId !== user!.id) {
          return new Response(404, {}, { message: 'História não encontrada.' });
        }
        const chapters = schema
          .all('chapter')
          .models.filter((c: any) => c.attrs.storyId === request.params.storyId)
          .sort((a: any, b: any) => a.attrs.orderIndex - b.attrs.orderIndex);
        return chapters.map((c: any) => ({ ...c.attrs, id: c.id }));
      });

      this.post('/author/stories/:storyId/chapters', async (schema, request) => {
        await randomDelay();
        const [err, user] = requireAuth(request, schema);
        if (err) return err;
        const story = schema.find('story', request.params.storyId);
        if (!story || story.attrs.authorId !== user!.id) {
          return new Response(404, {}, { message: 'História não encontrada.' });
        }
        const body = JSON.parse(request.requestBody);
        const existing = schema
          .all('chapter')
          .models.filter((c: any) => c.attrs.storyId === request.params.storyId);
        const orderIndex = existing.length + 1;
        const wordCount = body.content ? body.content.trim().split(/\s+/).length : 0;
        const chapter = schema.create('chapter', {
          storyId: request.params.storyId,
          title: body.title,
          content: body.content ?? '',
          orderIndex,
          wordCount,
          readingTimeMinutes: Math.max(1, Math.round(wordCount / 250)),
          published: false,
          aiImageUrls: [],
          createdAt: new Date().toISOString(),
        } as any);
        story.update({
          chapterCount: story.attrs.chapterCount + 1,
          updatedAt: new Date().toISOString(),
        });
        return { ...chapter.attrs, id: chapter.id };
      });

      this.patch('/author/stories/:storyId/chapters/:chapterId', async (schema, request) => {
        await randomDelay();
        const [err, user] = requireAuth(request, schema);
        if (err) return err;
        const chapter = schema.find('chapter', request.params.chapterId);
        if (!chapter || chapter.attrs.storyId !== request.params.storyId) {
          return new Response(404, {}, { message: 'Capítulo não encontrado.' });
        }
        const body = JSON.parse(request.requestBody);
        const wordCount = body.content
          ? body.content.trim().split(/\s+/).length
          : chapter.attrs.wordCount;
        chapter.update({
          ...body,
          wordCount,
          readingTimeMinutes: Math.max(1, Math.round(wordCount / 250)),
        });
        return { ...chapter.attrs, id: chapter.id };
      });

      this.delete('/author/stories/:storyId/chapters/:chapterId', async (schema, request) => {
        await randomDelay();
        const [err, user] = requireAuth(request, schema);
        if (err) return err;
        const chapter = schema.find('chapter', request.params.chapterId);
        if (!chapter) return new Response(404, {}, { message: 'Capítulo não encontrado.' });
        const story = schema.find('story', request.params.storyId);
        if (story) {
          story.update({ chapterCount: Math.max(0, story.attrs.chapterCount - 1) });
        }
        chapter.destroy();
        return new Response(204);
      });

      // ══════════════════════════════════════════════════════
      // PASSTHROUGH para assets externos
      // ══════════════════════════════════════════════════════
      this.passthrough('https://fonts.googleapis.com/**');
      this.passthrough('https://fonts.gstatic.com/**');
    },
  });
}
