 GlitrAI Mini Content Engine

Give it a product name and a description, and it does the rest: writes a smart image-generation prompt using an LLM, turns that into an actual product image, and keeps track of the whole job from start to finish — so you can watch it go from `pending` to a finished visual in real time.

Built as part of the GlitrAI SDE Intern assignment.

---
 Try it live

 **App**: [glitrai-content-engine-frontend.onrender.com](https://glitrai-content-engine-frontend.onrender.com)
 **API**: [glitrai-content-engine-4g4v.onrender.com](https://glitrai-content-engine-4g4v.onrender.com)
 **Code**: [github.com/vijayalaxmi8105/glitrai-content-engine](https://github.com/vijayalaxmi8105/glitrai-content-engine)

 Heads up — this runs on Render's free tier, so if nobody's used it in a while, the backend takes a little nap. First request after that might take 30–60 seconds to wake it up. Totally normal, just give it a moment.

---

 How it actually works

You type in a product name and description (an image URL is welcome too, but optional). Hit generate, and here's what happens behind the scenes:

1. **The request lands** on the Express backend, and a new job gets saved to Postgres with status `pending`
2. **Groq's LLM** (`llama-3.3-70b-versatile`) reads your product details and writes a genuinely good image-generation prompt — way better than just stuffing the description into an image model directly
3. **Pollinations.ai** takes that prompt and generates an actual image, no API key needed
4. **The job updates** to `completed` (or `failed`, with a reason, if something goes wrong along the way)
5. **The frontend polls** for updates and shows you the result as soon as it's ready

```
You  →  Frontend  →  Backend  →  Groq (writes the prompt)
                          │
                          └──▶  Pollinations.ai (makes the image)
                          │
                          └──▶  Postgres (remembers everything)
```

---

 Built with

| What | Used for |
|---|---|
| Node.js + Express | Backend API |
| Groq (`llama-3.3-70b-versatile`) | Turning product info into a good image prompt |
| Pollinations.ai | Actually generating the image |
| PostgreSQL (via Neon) | Keeping track of every job |
| Plain HTML + JS | The frontend — no framework, kept it simple |
| Render.com | Hosting both the API and the frontend, free tier |

---

 API Reference

### `GET /health`
Just a heartbeat check.
```json
{ "status": "ok", "timestamp": "2026-07-26T19:45:27.129Z" }
```

### `POST /generate`
Kicks off a new job.

```json
{
  "productName": "Ceramic Coffee Mug",
  "description": "A hand-glazed ceramic mug perfect for your morning coffee",
  "productImageUrl": "https://example.com/mug.jpg"
}
```
*(`productImageUrl` is optional — leave it out and the image gets generated purely from the text.)*

Returns right away with the new job's id, while the actual generation happens in the background:
```json
{ "id": 5, "status": "pending" }
```

### `GET /jobs/:id`
Check in on a specific job.

```json
{
  "id": 5,
  "product_name": "Ceramic Coffee Mug",
  "description": "...",
  "status": "completed",
  "prompt": "...",
  "result_url": "https://image.pollinations.ai/prompt/...",
  "error_message": null,
  "created_at": "...",
  "updated_at": "...",
  "product_image_url": "https://example.com/mug.jpg"
}
```

### `GET /jobs`
Every job that's ever been submitted, newest first. This is what powers the job list on the frontend.

---

The frontend

Nothing fancy — a form to submit a product, and a live-updating list below it showing every job that's been run, with the generated image once it's ready. It polls the backend automatically, so you just submit and watch.

---

 Running it on your own machine

**Backend:**
```bash
cd backend
npm install

# create a .env file with:
# DATABASE_URL=your_neon_connection_string
# GROQ_API_KEY=your_groq_api_key

node init-db.js     # sets up the jobs table, only needed once
node server.js       # starts at http://localhost:5000
```

**Frontend:**
```bash
cd frontend
npx serve -l 3000
```
*(Just make sure `API_BASE` in `index.html` points at `http://localhost:5000` for local testing.)*

---

 How it's deployed

Both pieces live on Render, deployed straight from this repo:

**Backend** — Web Service
- Root directory: `backend`
- Build: `npm install`
- Start: `node server.js`
- Env vars: `DATABASE_URL`, `GROQ_API_KEY`

**Frontend** — Static Site
- Root directory: `frontend`
- Build: *(none needed)*
- Publish directory: `.`

---

 Job lifecycle

```
pending  →  processing  →  completed
                        ↘
                          failed  (with an error_message explaining why)
```
 Database schema

`jobs` table:

| Column | Type | Notes |
|---|---|---|
| id | serial | primary key |
| product_name | text | |
| description | text | |
| status | text | pending / processing / completed / failed |
| prompt | text | the LLM-generated image prompt |
| result_url | text | link to the generated image |
| error_message | text | filled in only if something failed |
| product_image_url | text | optional, user-provided |
| created_at | timestamp | |
| updated_at | timestamp | |



Thanks for checking it out! 