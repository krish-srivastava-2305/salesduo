# SalesDuo Assignment

A small full‑stack app that scrapes an Amazon listing by ASIN, sends the content to Gemini for SEO‑focused optimization, and stores both the original and AI‑optimized versions in MySQL. A Reports page lets you browse/search past analyses, and an Optimized Listing page lets you edit and persist updates back to the database.

## How to set up locally

Prerequisites
- Node.js 18+ and npm
- Docker Desktop (for MySQL + Adminer)

1) Start the database (from repo root)

```powershell
# MySQL 8 + Adminer (UI at http://localhost:8080)
docker compose -f backend/mysql/docker-compose.yaml up -d
```

2) Configure backend environment

```powershell
use .env.example to create backend/.env and fill in your 
    1. GEMINI_API_KEY
    2. DB_URI
    3. PORT (if needed)
```

3) Install and run the backend

```powershell
cd backend
npm install
npm run dev
```

4) Configure backend environment

```powershell
use .env.example to create frontend/.env and fill in your 
    1. NEXT_PUBLIC_API_URL
```

5) Install and run the frontend

```powershell
cd frontend
npm install
npm run dev
# App runs on http://localhost:3000
```

Optional: Inspect DB via Adminer
- Open http://localhost:8080
- System: MySQL, Server: localhost, Username: myapp_user, Password: myapp_pass, Database: myapp_db

## Solution overview

- Scraper: Fetches https://www.amazon.in/dp/{ASIN} and extracts title, bullet points, and description using axios + cheerio.
- LLM Optimization: Sends the scraped content to Google Gemini (gemini-2.5-flash-lite) with a strict JSON schema to receive improved title, 5 rewritten bullets, enhanced HTML description, and keyword suggestions.
- Persistence: Saves one row per ASIN in MySQL (originalDocument and analyzedData stored as JSON strings). ASIN is unique to avoid duplicates.
- API:
  - POST /api/scrape-analyzer { asin }: scrape → optimize → save → return both original and optimized.
  - GET /api/reports: list all saved analyses.
  - PATCH /api/update-listing { asin, updatedData }: persist edited optimized content.
- Frontend:
  - Reports page: loads all reports and provides a fast, client-side search across ASIN, original text, and optimized text.
  - Optimized Listing page: lets you refine the AI output and save changes back to the database.

## Why Gemini + key optimizations

- Schema‑guided, JSON‑only responses:
  - We use responseMimeType=application/json and a responseSchema to enforce a predictable, parseable shape (exactly 5 bullets, title length guidance, HTML description, keywords). This avoids brittle prompt parsing and simplifies UI binding.
- Model choice: gemini-2.5-flash-lite prioritizes speed and cost for interactive UX while remaining high quality for copy rewriting.
- Early exit on known ASIN:
  - Before scraping/LLM, the backend checks if the ASIN already exists in the DB. If yes, it returns the stored result immediately—reducing latency, API cost, and external calls.
- Search in Reports:
  - Client-side filtering over ASIN, original text, and optimized text enables instant discovery and reuse of prior work.
- Human-in-the-loop updates:
  - The Optimized Listing page lets users edit the LLM output (title/bullets/description/keywords) and PATCH /api/update-listing persists those edits so the DB always reflects the latest, curated version.

## Notes

- The backend auto-syncs the Sequelize model on startup (Report.sync({ alter: true })), creating/updating the table as needed.
- Endpoints are currently CORS-enabled for local Next.js dev on :3000.
