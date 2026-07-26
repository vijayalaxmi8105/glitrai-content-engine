\# GlitrAI Mini Content Engine



A mini content generation engine that takes a product name, description, and optional image URL, uses an LLM to craft an image-generation prompt, generates a product visual, and tracks the job status end-to-end.



\## 🔗 Live URLs



\- \*\*Frontend\*\*: https://glitrai-content-engine-frontend.onrender.com

\- \*\*Backend API\*\*: https://glitrai-content-engine-4g4v.onrender.com

\- \*\*GitHub Repo\*\*: https://github.com/vijayalaxmi8105/glitrai-content-engine



> Note: Both services are hosted on Render's free tier. The backend may take 30–60 seconds to wake up if it has been idle.



\## 🏗️ Architecture



```

User (Browser)

&#x20;  │

&#x20;  ▼

Frontend (Static HTML/JS, Render Static Site)

&#x20;  │  fetch() calls

&#x20;  ▼

Backend (Node.js + Express, Render Web Service)

&#x20;  │

&#x20;  ├──▶ Groq API (llama-3.3-70b-versatile) — generates an image prompt from product name/description

&#x20;  ├──▶ Pollinations.ai — generates the image from that prompt (no API key required)

&#x20;  └──▶ PostgreSQL (Neon) — persists job state (pending → processing → completed/failed)

```



\## 🛠️ Tech Stack



| Layer | Technology |

|---|---|

| Backend | Node.js + Express |

| LLM (prompt generation) | Groq API — `llama-3.3-70b-versatile` |

| Image generation | Pollinations.ai (free, no API key) |

| Database | PostgreSQL (Neon, free tier) |

| Frontend | Plain HTML + vanilla JS |

| Hosting | Render.com (free tier, both backend and frontend) |



\## 📡 API Endpoints



\### `GET /health`

Health check.

```json

{ "status": "ok", "timestamp": "2026-07-26T19:45:27.129Z" }

```



\### `POST /generate`

Creates a new content generation job.



\*\*Request body:\*\*

```json

{

&#x20; "productName": "Ceramic Coffee Mug",

&#x20; "description": "A hand-glazed ceramic mug perfect for your morning coffee",

&#x20; "productImageUrl": "https://example.com/mug.jpg"

}

```

`productImageUrl` is optional.



\*\*Response:\*\*

```json

{ "id": 5, "status": "pending" }

```



The job is processed asynchronously:

1\. Groq generates an image-generation prompt from the product name + description

2\. Pollinations.ai generates the image from that prompt

3\. Job status is updated to `completed` (or `failed` with an `error\_message`)



\### `GET /jobs/:id`

Returns a single job's status and result.



```json

{

&#x20; "id": 5,

&#x20; "product\_name": "Ceramic Coffee Mug",

&#x20; "description": "...",

&#x20; "status": "completed",

&#x20; "prompt": "...",

&#x20; "result\_url": "https://image.pollinations.ai/prompt/...",

&#x20; "error\_message": null,

&#x20; "created\_at": "...",

&#x20; "updated\_at": "...",

&#x20; "product\_image\_url": "https://example.com/mug.jpg"

}

```



\### `GET /jobs`

Returns all jobs, most recent first.



\## 🖥️ Frontend



A single-page form + job list:

\- Submit product name, description, and optional image URL

\- Job list polls the backend and shows live status (`pending` → `processing` → `completed`/`failed`)

\- Renders the generated image once a job completes



\## 🚀 Running Locally



\### Backend

```bash

cd backend

npm install

\# create a .env file with:

\#   DATABASE\_URL=your\_neon\_connection\_string

\#   GROQ\_API\_KEY=your\_groq\_api\_key

node init-db.js      # creates the jobs table (first time only)

node server.js        # starts on http://localhost:5000

```



\### Frontend

```bash

cd frontend

npx serve -l 3000

```

Update `API\_BASE` in `index.html` to `http://localhost:5000` for local testing.



\## 📦 Deployment



Both services are deployed on Render.com:



\- \*\*Backend\*\*: Web Service

&#x20; - Root directory: `backend`

&#x20; - Build command: `npm install`

&#x20; - Start command: `node server.js`

&#x20; - Env vars: `DATABASE\_URL`, `GROQ\_API\_KEY`

\- \*\*Frontend\*\*: Static Site

&#x20; - Root directory: `frontend`

&#x20; - Build command: \*(none)\*

&#x20; - Publish directory: `.`



\## 📋 Job Status Lifecycle



```

pending → processing → completed

&#x20;                    └→ failed (with error\_message)

```



\## 🗄️ Database Schema (`jobs` table)



| Column | Type |

|---|---|

| id | serial primary key |

| product\_name | text |

| description | text |

| status | text |

| prompt | text |

| result\_url | text |

| error\_message | text |

| product\_image\_url | text |

| created\_at | timestamp |

| updated\_at | timestamp |

