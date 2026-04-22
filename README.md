# TiketKAI Next.js + Express

This project has been migrated from Flask SSR to:

- Next.js Pages Router for the frontend pages
- Express mounted through `pages/api/[...path].js` for auth and CRUD endpoints
- Local SQLite for development fallback
- PostgreSQL support for persistent Vercel deployments
- Vercel Blob support for persistent image uploads on Vercel

## Local development

1. Install dependencies:

```bash
npm install
```

2. Create `.env.local` from `.env.example`.

3. Start the app:

```bash
npm run dev
```

4. Open `http://localhost:3000`.

## Admin login

- URL: `/admin`
- Password comes from `ADMIN_PASSWORD`

## Important Vercel notes

- The app can read/write `kereta.db` locally during development.
- For real Vercel persistence, set `DATABASE_URL` to a PostgreSQL database.
- For image uploads on Vercel, set `BLOB_READ_WRITE_TOKEN`.
- Leave `COOKIE_SECURE=0` locally; set `COOKIE_SECURE=1` only if you need secure cookies outside Vercel.
- If `DATABASE_URL` is not set, the app falls back to the bundled local SQLite file.
- If `BLOB_READ_WRITE_TOKEN` is not set on Vercel, new image uploads are blocked to avoid writing to non-persistent storage.

## Migrating existing SQLite data to PostgreSQL

After setting `DATABASE_URL`, run:

```bash
npm run migrate:postgres
```

## Main routes

- `/`
- `/kereta`
- `/jadwal`
- `/status`
- `/checkout/[id]`
- `/admin`
- `/admin/dashboard`
- `/admin/kereta`
- `/admin/tambah`
- `/admin/edit/[id]`

## API routes

- `POST /api/auth/login`
- `POST /api/auth/logout`
- `GET /api/trains`
- `GET /api/trains/:id`
- `POST /api/trains`
- `POST /api/trains/:id`
- `POST /api/trains/:id/delete`

## Legacy Flask files

The original Flask files are still in the repository as reference:

- `app.py`
- `templates/`
- `static/`
