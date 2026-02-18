# Lead CRM — Deployment Guide (Coolify)

## Prerequisites

- Coolify instance at `https://coolify.bigls.net`
- GitHub access to `matthiasbigl/lead-crm` (via Bigl Bot)
- The repo is already production-ready with Dockerfile

## Quick Deploy via Coolify UI

### Step 1: Create a PostgreSQL Database

1. Go to **Projects** → Create new project **"Lead CRM"**
2. Inside the project, click **+ New** → **Database** → **PostgreSQL**
3. Settings:
   - Name: `lead-crm-db`
   - Database: `lead_crm`
   - User: `leadcrm`
   - Password: (auto-generated is fine)
4. Click **Deploy**
5. Copy the **Internal URL** (looks like `postgresql://leadcrm:xxx@lead-crm-db:5432/lead_crm`)

### Step 2: Create the Application

1. In the same project, click **+ New** → **Application**
2. Source: **GitHub** → Select `matthiasbigl/lead-crm` → Branch: `main`
3. Build Pack: **Dockerfile**
4. Dockerfile location: `/Dockerfile`
5. Exposed port: `3000`

### Step 3: Set Environment Variables

Go to the app's **Environment Variables** tab and add:

| Key | Value | Notes |
|-----|-------|-------|
| `DATABASE_URL` | `postgresql://leadcrm:xxx@lead-crm-db:5432/lead_crm` | Internal URL from Step 1 |
| `API_KEY` | `Rlv95iRtGDOe2FbShgdUBdU3oipwy9u8WlQo3iSA` | For API authentication |
| `GOOGLE_PLACES_API_KEY` | *(your key)* | Optional, for lead discovery |
| `PUBLIC_APP_NAME` | `Lead CRM` | App display name |
| `PUBLIC_APP_URL` | `https://crm.bigls.net` | Your chosen domain |

### Step 4: Configure Domain

1. Go to the app's **Settings** tab
2. Under **Domains**, add your domain (e.g., `crm.bigls.net`)
3. Coolify will auto-provision Let's Encrypt SSL

### Step 5: Deploy

Click **Deploy** and wait for the build to complete (~2-3 minutes).

The entrypoint script will automatically:
1. Run `drizzle-kit push` to create/migrate the database schema
2. Start the Node.js server on port 3000

## API Key for Scripts

```
API_KEY: Rlv95iRtGDOe2FbShgdUBdU3oipwy9u8WlQo3iSA
```

### Test the API

```bash
# List leads
curl https://crm.bigls.net/api/leads

# Create a lead (requires API key)
curl -X POST https://crm.bigls.net/api/leads \
  -H "Content-Type: application/json" \
  -H "x-api-key: Rlv95iRtGDOe2FbShgdUBdU3oipwy9u8WlQo3iSA" \
  -d '{"businessName": "Test Restaurant GmbH", "city": "Wien", "source": "manual"}'

# Get dashboard stats
curl https://crm.bigls.net/api/stats
```

## Automated Deploy (API Script)

If you want to use the Coolify API:

1. Go to Coolify → **Settings** → **API Tokens**
2. Create a new token with **`*` (all permissions)**
3. Run:

```bash
export COOLIFY_URL="https://coolify.bigls.net"
export COOLIFY_TOKEN="<your-full-access-token>"
bash deploy-coolify.sh
```

## Architecture

```
┌─────────────────────────────────────────┐
│  Coolify (Docker)                        │
│                                          │
│  ┌──────────────┐  ┌──────────────────┐ │
│  │  lead-crm    │──│  PostgreSQL       │ │
│  │  (Node.js)   │  │  (lead-crm-db)   │ │
│  │  :3000       │  │  :5432            │ │
│  └──────┬───────┘  └──────────────────┘ │
│         │                                │
│  ┌──────┴───────┐                        │
│  │  Traefik     │ ← SSL via Let's Encrypt│
│  │  (Proxy)     │                        │
│  └──────┬───────┘                        │
└─────────┼────────────────────────────────┘
          │
     https://crm.bigls.net
```

## Troubleshooting

- **Build fails**: Check that `Dockerfile` is in repo root, and `main` branch is selected
- **DB connection error**: Verify `DATABASE_URL` uses the internal hostname (not `localhost`)
- **Migrations fail**: Check logs in Coolify for `drizzle-kit push` output
- **API returns 401**: Make sure `API_KEY` env var is set and matches your `x-api-key` header
