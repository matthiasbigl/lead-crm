# 🎯 Lead CRM

A lead tracking and CRM system for freelance web developers. Built to discover, score, and manage potential clients — focused on Austrian businesses (Wien/Korneuburg area).

## Tech Stack

- **Framework:** SvelteKit (full stack, Svelte 5)
- **Architecture:** Service-repository pattern
- **Styling:** Tailwind CSS v4
- **ORM:** Drizzle ORM
- **Database:** PostgreSQL
- **Forms:** Superforms + Zod validation
- **Language:** TypeScript

## Getting Started

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment

```bash
cp .env.example .env
# Edit .env with your PostgreSQL connection string
```

Required:
- `DATABASE_URL` — PostgreSQL connection string

Optional:
- `GOOGLE_PLACES_API_KEY` — For automatic lead discovery via Google Places API

### 3. Set Up Database

```bash
# Push schema directly to database (development)
npm run db:push

# Or generate and run migrations (production)
npm run db:generate
npm run db:migrate
```

### 4. Run Development Server

```bash
npm run dev
```

Visit `http://localhost:5173`

## Features

### 📊 Dashboard
- Pipeline overview with status counts
- Total lead count and pipeline value
- Recent leads at a glance

### 👥 Lead Management
- Full CRUD for leads
- Filter by status, source, city, and free-text search
- Website quality scoring (0-10)
- Status pipeline: New → Contacted → Qualified → Proposal → Won/Lost

### 📝 Activity Tracking
- Log activities per lead (calls, emails, meetings, notes)
- Activity history timeline
- Automatic activity logging for status changes

### 🔍 Lead Discovery
- Google Places API integration
- Search by business type and location
- Automatic website quality assessment
- Bulk lead creation from search results

### 🔌 REST API

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/leads` | List leads (with filters) |
| POST | `/api/leads` | Create lead |
| GET | `/api/leads/:id` | Get lead + activities |
| PATCH | `/api/leads/:id` | Update lead |
| DELETE | `/api/leads/:id` | Delete lead |
| GET | `/api/leads/:id/activities` | Get activities |
| POST | `/api/leads/:id/activities` | Add activity |
| POST | `/api/leads/discover` | Run discovery |
| GET | `/api/stats` | Dashboard stats |

### Query Parameters (GET /api/leads)

- `search` — Full-text search across name, email, city, type
- `status` — Filter by status (new, contacted, qualified, proposal, won, lost)
- `source` — Filter by source (manual, scraped, referral, google_places, directory)
- `city` — Filter by city
- `sortBy` — Sort field (createdAt, updatedAt, businessName, websiteScore, estimatedValue)
- `sortOrder` — asc or desc
- `limit` — Results per page (1-100, default 50)
- `offset` — Pagination offset

## Project Structure

```
src/
├── lib/
│   ├── server/
│   │   ├── db/
│   │   │   ├── schema.ts          # Drizzle schema (leads, activities)
│   │   │   └── index.ts           # DB connection
│   │   ├── repositories/
│   │   │   └── lead.repository.ts # Data access layer
│   │   └── services/
│   │       ├── lead.service.ts    # Business logic
│   │       └── discovery.service.ts # Google Places integration
│   ├── schemas/
│   │   └── lead.schema.ts        # Zod validation schemas
│   ├── components/
│   │   └── StatusBadge.svelte     # Reusable status badge
│   └── utils/
│       └── format.ts             # Formatting helpers
├── routes/
│   ├── +layout.svelte            # App shell with sidebar
│   ├── +page.svelte              # Dashboard
│   ├── leads/
│   │   ├── +page.svelte          # Leads list with filters
│   │   ├── new/+page.svelte      # Create lead form
│   │   └── [id]/+page.svelte     # Lead detail + edit + activities
│   ├── discover/
│   │   └── +page.svelte          # Lead discovery UI
│   └── api/
│       ├── leads/+server.ts      # GET list, POST create
│       ├── leads/[id]/+server.ts # GET, PATCH, DELETE
│       ├── leads/[id]/activities/+server.ts
│       ├── leads/discover/+server.ts
│       └── stats/+server.ts
```

## External Services

### Google Places API (optional)
Used for automatic lead discovery. Get an API key from [Google Cloud Console](https://console.cloud.google.com/apis/credentials) with the Places API enabled.

**Required APIs:**
- Places API
- Places API (New) — for text search

**Estimated cost:** ~$17 per 1000 searches (text search + details)

## Database Scripts

```bash
npm run db:push      # Push schema to DB (dev)
npm run db:generate  # Generate migration files
npm run db:migrate   # Run migrations
npm run db:studio    # Open Drizzle Studio (DB browser)
```

## Lead Scoring Logic

Leads are automatically scored (1-10) based on:
- **Website quality** (inverted — worse website = better prospect)
- **No website** = +3 points
- **Austrian location** = +2 points (Wien, Korneuburg, etc.)
- **High-value business type** = +2 points (restaurants, lawyers, doctors, etc.)

Higher score = more promising lead for web development services.
