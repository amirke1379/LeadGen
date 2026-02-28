# LeadHunter — Agent Implementation Instructions

## How To Use This File

You are an AI agent implementing the LeadHunter app. Follow these rules strictly:

1. **Check for a `TODO.md` file first** in the project root before doing anything else
   - If it does **not** exist → create it using the Todo Template at the bottom of this file, then begin Phase 1
   - If it **does** exist → read it, find the first unchecked phase, and continue from there
2. **Never skip a phase** or work on multiple phases at once
3. **After completing a phase** → check it off in `TODO.md`, write a short "Phase X complete" summary, then **stop and wait for the user to test and approve** before moving on
4. **If something is unclear** → stop and ask. Do not make assumptions that affect architecture or functionality
5. **Never modify a completed (checked) phase's code** unless the user explicitly asks you to

---

## Project Overview

A local lead generation tool that finds small businesses with no website via Google Places API, displays them in a dashboard, lets you send AI-generated outreach messages via SMS or email, and tracks responses.

**Runs entirely on the developer's local machine.**

---

## Folder Structure

> [!NOTE]
> The `client/` and `server/` directories have already been initialized.
> - **Client**: Created with `npx create-react-router@latest` inside `client/lead-gen-ui/` (React Router v7, TypeScript, Tailwind CSS v4, Vite)
> - **Server**: Created with `python3 -m venv .venv` inside `server/`, Flask installed in the venv

```
LeadGen/
├── server/                          # Flask backend
│   ├── .venv/                       # ✅ Already created (python3 -m venv)
│   ├── app.py
│   ├── config.py
│   ├── database.py
│   ├── models/
│   │   ├── __init__.py
│   │   ├── lead.py
│   │   └── outreach.py
│   ├── repositories/
│   │   ├── __init__.py
│   │   ├── lead_repository.py
│   │   └── outreach_repository.py
│   ├── services/
│   │   ├── __init__.py
│   │   ├── places_service.py
│   │   ├── lead_service.py
│   │   ├── message_service.py
│   │   ├── sms_service.py
│   │   └── email_service.py
│   ├── routes/
│   │   ├── __init__.py
│   │   ├── leads_routes.py
│   │   ├── outreach_routes.py
│   │   └── webhook_routes.py
│   └── requirements.txt
│
├── client/
│   └── lead-gen-ui/                 # ✅ Already scaffolded (React Router v7)
│       ├── app/                     # Main application directory
│       │   ├── app.css
│       │   ├── root.tsx             # Root layout (replaces App.jsx)
│       │   ├── routes.ts            # Route definitions
│       │   ├── routes/              # File-based route modules
│       │   │   └── home.tsx         # Default home route
│       │   ├── api/
│       │   │   ├── leadsApi.ts
│       │   │   └── outreachApi.ts
│       │   ├── components/
│       │   │   ├── ui/
│       │   │   │   ├── Badge.tsx
│       │   │   │   ├── Button.tsx
│       │   │   │   ├── Modal.tsx
│       │   │   │   └── Input.tsx
│       │   │   ├── leads/
│       │   │   │   ├── LeadsTable.tsx
│       │   │   │   ├── LeadRow.tsx
│       │   │   │   └── LeadStatusBadge.tsx
│       │   │   ├── scan/
│       │   │   │   └── ScanConfigPanel.tsx
│       │   │   └── outreach/
│       │   │       ├── OutreachPanel.tsx
│       │   │       └── MessagePreview.tsx
│       │   ├── hooks/
│       │   │   ├── useLeads.ts
│       │   │   └── useOutreach.ts
│       │   ├── store/
│       │   │   ├── leadsStore.ts
│       │   │   └── outreachStore.ts
│       │   └── utils/
│       │       ├── formatters.ts
│       │       └── constants.ts
│       ├── public/
│       ├── package.json
│       ├── vite.config.ts
│       ├── tsconfig.json
│       └── react-router.config.ts
│
├── .env.example
├── INSTRUCTIONS.md
├── TODO.md
└── README.md
```

---

## Architecture Rules (Never Break These)

### Backend
- `routes/` — HTTP only. Parse request, call a service, return JSON. Zero business logic here.
- `services/` — All logic lives here. API calls, filtering, orchestration, AI generation.
- `repositories/` — Database only. Raw SQL queries, inserts, updates. No business rules.
- `models/` — Plain Python dataclasses shared across all layers. No methods or logic.
- Every route file is a Flask Blueprint registered in `app.py`
- All config (API keys, DB path, ports) lives in `config.py` loaded from `.env`
- Never hardcode secrets anywhere

### Frontend
- All frontend code lives inside `client/lead-gen-ui/app/`
- `api/` — The only place that calls the backend. Uses fetch with the base URL from an env variable.
- `hooks/` — The only place that calls `api/`. Components never fetch directly.
- `components/` — Pure UI. Receive props, emit events. No direct API calls.
- `routes/` — Route modules (React Router v7 file-based routing). Each route module can export `loader`, `action`, and a default component. These replace the old `pages/` concept.
- `store/` — Zustand for global state shared across routes.
- Routing is handled by React Router v7's file-based routing via `app/routes.ts`.
- All files use TypeScript (`.ts` / `.tsx`).

---

## Tech Stack

| Layer | Technology |
|---|---|
| Backend framework | Flask (Python, inside `server/.venv`) |
| Database | SQLite via Python's built-in `sqlite3` |
| Frontend framework | React Router v7 (Vite, TypeScript) |
| Global state | Zustand |
| Places data | Google Places API (Nearby Search + Geocoding) |
| AI messages | OpenAI API (`gpt-4o-mini`) |
| SMS | Twilio |
| Email | Brevo (sib-api-v3-sdk) |
| Webhook tunnel | ngrok |
| Styling | Tailwind CSS v4 (already installed via `@tailwindcss/vite`) |

---

## Environment Variables

Create `.env.example` at the root with these keys (no values). The user fills in their own `.env`:

```
GOOGLE_PLACES_API_KEY=
OPENAI_API_KEY=
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_PHONE_NUMBER=
BREVO_API_KEY=
BREVO_SENDER_EMAIL=
BREVO_SENDER_NAME=
NGROK_URL=
FLASK_PORT=8000
VITE_API_BASE_URL=http://localhost:8000
```

---

## Phases

---

### Phase 1 — Project Scaffold & Database

**Goal:** Repo structure exists, backend starts, database initializes with correct tables.

> [!NOTE]
> **Already done:**
> - Client scaffolded via `npx create-react-router@latest` at `client/lead-gen-ui/` (React Router v7, TypeScript, Tailwind CSS v4)
> - Server venv created via `python3 -m venv .venv` at `server/.venv`
> - Flask installed in the venv via `pip install Flask`
>
> **To activate the server venv:** `cd server && . .venv/bin/activate`

**Remaining Tasks:**
- Create the backend folder structure inside `server/` (models/, repositories/, services/, routes/ — all files can be empty stubs except what's listed below)
- Set up `server/requirements.txt` with: `flask`, `flask-cors`, `python-dotenv`, `requests`, `anthropic`, `twilio`, `sib-api-v3-sdk`
- Implement `server/config.py` — loads all env vars from `.env` using python-dotenv
- Implement `server/database.py` — creates SQLite DB file and runs `CREATE TABLE IF NOT EXISTS` for:
  - `leads` table: `id`, `place_id` (unique), `name`, `category`, `rating`, `review_count`, `phone`, `address`, `lat`, `lng`, `distance`, `google_url`, `status`, `contacted_at`, `contact_method`, `found_at`
  - `outreach_log` table: `id`, `lead_id` (FK), `method`, `message_sent`, `response_received`, `sent_at`, `responded_at`
- Implement `server/app.py` — creates Flask app, enables CORS, calls `init_db()` on startup, starts on port from config
- Create `.env.example` at the project root
- Create `README.md` with instructions on how to install and run both server and client
- Install remaining client dependencies: `cd client/lead-gen-ui && npm install zustand`

**How to test:**
- Activate the venv: `cd server && . .venv/bin/activate`
- Run `python app.py` from the `server/` folder
- Server should start with no errors
- SQLite `.db` file should be created in the server folder
- Hitting `http://localhost:8000/` should return a simple `{"status": "ok"}` health check response
- Run `cd client/lead-gen-ui && npm run dev` — React Router app should start with no errors

---

### Phase 2 — Google Places Scan (Backend)

**Goal:** Hitting the scan endpoint returns real businesses with no website from Google Places.

**Tasks:**
- Implement `models/lead.py` — `Lead` dataclass with all fields matching the DB schema
- Implement `repositories/lead_repository.py`:
  - `insert_lead(lead)` — inserts, skips if `place_id` already exists
  - `get_all_leads()` — returns all leads ordered by `found_at` desc
  - `get_lead_by_id(id)`
  - `update_lead_status(id, status, contact_method)`
- Implement `services/places_service.py`:
  - `geocode_location(address)` → returns `(lat, lng)` using Google Geocoding API
  - `search_businesses(lat, lng, radius_m, min_rating, max_rating, category)` → calls Google Places Nearby Search, returns raw results
  - `filter_no_website(results)` → returns only businesses where website field is absent
  - `map_to_lead(place, user_lat, user_lng)` → maps a Places API result to a `Lead` dataclass, calculates distance
- Implement `services/lead_service.py`:
  - `run_scan(location, radius_km, min_rating, max_rating, category)` → orchestrates geocode → search → filter → dedup → save → return new leads count and all leads
- Implement `routes/leads_routes.py` as a Flask Blueprint:
  - `POST /api/leads/scan` — body: `{ location, radius_km, min_rating, max_rating, category }` → calls `lead_service.run_scan()`
  - `GET /api/leads` — returns all leads from DB
  - `GET /api/leads/<id>` — returns single lead
- Register blueprint in `app.py`

**How to test:**
- Use Postman or curl to `POST /api/leads/scan` with a real location and radius
- Response should include `new_leads_found` count and a `leads` array
- Each lead should have no `website` field from Google
- Run scan twice — second scan should return `new_leads_found: 0` for the same businesses (dedup working)
- `GET /api/leads` should return the saved leads

---

### Phase 3 — Dashboard UI (Frontend, Read Only)

**Goal:** React app runs, shows all leads from the backend, scan config works, scan button works.

> [!NOTE]
> The React Router app is already scaffolded at `client/lead-gen-ui/` with Tailwind CSS v4 pre-configured.
> All new frontend files go inside `client/lead-gen-ui/app/`.
> Use TypeScript (`.ts` / `.tsx`) for all files.

**Tasks:**
- Install: `zustand` (React Router and Tailwind are already installed)
- Implement `app/utils/constants.ts` — status options, category options, default config values
- Implement `app/utils/formatters.ts` — date formatter, distance formatter, rating display
- Implement `app/api/leadsApi.ts`:
  - `scanLeads(config)` — POST to `/api/leads/scan`
  - `getLeads()` — GET `/api/leads`
- Implement `app/store/leadsStore.ts` (Zustand) — stores `leads[]`, `lastScanned`, `isScanning`, `scanConfig`
- Implement `app/hooks/useLeads.ts` — calls `leadsApi`, updates store
- Implement UI components:
  - `app/components/ui/Badge.tsx`, `Button.tsx`, `Input.tsx`
  - `app/components/leads/LeadStatusBadge.tsx` — color-coded badge per status
  - `app/components/leads/LeadRow.tsx` — one row with name, category, rating, phone, address, distance, google link, status badge
  - `app/components/leads/LeadsTable.tsx` — table with column headers, maps rows, shows empty state
  - `app/components/scan/ScanConfigPanel.tsx` — location input, radius slider, min/max rating inputs, category dropdown, Scan Now button, last scanned time, new leads count
- Create a dashboard route module at `app/routes/dashboard.tsx` — composes `ScanConfigPanel` + `LeadsTable`
- Update `app/routes.ts` to register the dashboard route at `/`

**How to test:**
- Run `npm run dev` from `client/lead-gen-ui/`
- Dashboard loads with no errors
- Scan config panel is visible with all input fields
- Clicking "Scan Now" calls the backend, shows a loading state, then populates the table
- Each lead row shows all fields correctly
- "Last scanned" updates after each scan
- Google Maps link on each row opens the correct business in a new tab
- Status badge shows "New" for all fresh leads

---

### Phase 4 — AI Message Generation (Backend)

**Goal:** Calling the message endpoint returns a personalized outreach message for a given lead.

**Tasks:**
- Implement `services/message_service.py`:
  - `generate_message(lead, method)` — calls OpenAI API with a prompt built from the lead's name, category, address, and rating. `method` is either `"sms"` or `"email"`. SMS messages should be under 160 characters. Email messages should have a subject line and a short friendly body (under 150 words). Returns `{ subject (email only), body }`
  - Prompt must: address the business by name, mention their category, reference their rating, offer to build them a website, and include a clear CTA to reply
- Add to `routes/leads_routes.py`:
  - `POST /api/leads/<id>/generate-message` — body: `{ method: "sms" | "email" }` → returns generated message

**How to test:**
- Use Postman or curl to `POST /api/leads/<id>/generate-message` with `{ "method": "sms" }` and `{ "method": "email" }`
- SMS response should be a single short string under 160 characters
- Email response should have a `subject` and `body` field
- Message should clearly reference the business name and category
- Run it twice for the same lead — messages should be slightly different each time (not cached)

---

### Phase 5 — Outreach Panel UI

**Goal:** Clicking a lead opens a panel where you can generate and review a message before sending.

**Tasks:**
- Implement `app/api/outreachApi.ts`:
  - `generateMessage(leadId, method)` — POST to `/api/leads/:id/generate-message`
  - `sendMessage(leadId, method, message)` — POST to `/api/outreach/send`
- Implement `app/store/outreachStore.ts` — stores `selectedLead`, `generatedMessage`, `isSending`, `isGenerating`
- Implement `app/hooks/useOutreach.ts` — calls outreach API, updates store
- Implement UI components:
  - `app/components/outreach/MessagePreview.tsx` — shows the generated message in an editable textarea, subject field for email, regenerate button
  - `app/components/outreach/OutreachPanel.tsx` — slide-in side panel. Shows lead details at top. Method selector (SMS / Email). Email field input (for email method). Message preview below. Send button. Disabled states while loading.
- Wire up `LeadRow.tsx` to open `OutreachPanel` on click
- Create a lead detail route module at `app/routes/lead-detail.tsx` — shows full lead info + full outreach history (placeholder for now)
- Register the lead detail route in `app/routes.ts`

**How to test:**
- Click any lead row in the dashboard
- Outreach panel slides in from the right
- Selecting SMS vs Email updates the UI (shows/hides subject and email input fields)
- Clicking "Generate Message" calls the backend and populates the message preview
- Message is editable in the textarea
- "Regenerate" button fetches a fresh message
- Send button is visible but can show "Not yet connected" until Phase 6

---

### Phase 6 — SMS Sending via Twilio

**Goal:** Clicking Send on a SMS outreach actually sends the message to the business phone number via Twilio and logs it.

**Tasks:**
- Implement `models/outreach.py` — `OutreachLog` dataclass
- Implement `repositories/outreach_repository.py`:
  - `insert_outreach_log(log)` — inserts a new outreach log
  - `get_logs_by_lead(lead_id)` — returns all logs for a lead
- Implement `services/sms_service.py`:
  - `send_sms(to_phone, message)` — sends via Twilio, returns message SID or raises on failure
- Implement `routes/outreach_routes.py` as a Flask Blueprint:
  - `POST /api/outreach/send` — body: `{ lead_id, method, message, email (optional) }` → calls the right service based on method, inserts outreach log, updates lead status to `contacted`
  - `GET /api/outreach/<lead_id>` — returns all outreach logs for a lead
- Register outreach blueprint in `app.py`
- Update `lead_repository.py` to set `contacted_at` and `contact_method` when status changes

**How to test:**
- Use a real phone number you own as a test lead
- Click the lead, generate an SMS message, click Send
- You should receive the SMS on your phone within seconds
- Lead status in the dashboard should update to "Contacted"
- `GET /api/outreach/<lead_id>` should return the logged message and timestamp

---

### Phase 7 — Email Sending via Brevo

**Goal:** Clicking Send on an email outreach sends the message via Brevo and logs it.

**Tasks:**
- Implement `services/email_service.py`:
  - `send_email(to_email, to_name, subject, body)` — sends via Brevo `sib-api-v3-sdk`, returns message id or raises on failure
- Update `routes/outreach_routes.py` to route email method to `email_service.send_email()`

**How to test:**
- Use a real email address you own as a test lead
- Add the email manually to the lead in the outreach panel
- Generate an email message, click Send
- You should receive the email in your inbox
- Lead status should update to "Contacted" in the dashboard
- Check that Brevo dashboard shows the sent email

---

### Phase 8 — Webhook Response Tracking

**Goal:** When a business replies to your SMS or email, the lead status automatically updates to "Responded" in your dashboard.

**Tasks:**
- Install ngrok and document how to run it in `README.md`
- Implement `routes/webhook_routes.py` as a Flask Blueprint:
  - `POST /api/webhooks/twilio` — Twilio sends this when a business replies to your SMS. Parse the `From` phone number and `Body` from the form data. Find the lead by phone number. Update outreach log with `response_received` and `responded_at`. Update lead status to `responded`.
  - `POST /api/webhooks/sendgrid` — Brevo inbound parse webhook. Parse the sender email and message body. Match to lead. Update log and status the same way.
- Register webhook blueprint in `app.py`
- Add to `lead_repository.py`:
  - `get_lead_by_phone(phone)` — find lead by phone
  - `get_lead_by_email(email)` — find lead by email
- Add to `outreach_repository.py`:
  - `update_response(lead_id, response_text, responded_at)` — update the latest log for a lead

**How to test:**
- Start ngrok: `ngrok http 8000`, copy the public URL
- Paste `<ngrok_url>/api/webhooks/twilio` into Twilio's SMS webhook setting
- Reply to the SMS you sent in Phase 6 from the business phone
- Refresh the dashboard — lead status should change to "Responded"
- The reply message should appear in the outreach log

---

### Phase 9 — Outreach History & Status UI Polish

**Goal:** Full outreach history is visible per lead. Dashboard statuses are live. Manual status override available.

**Tasks:**
- Complete `app/routes/lead-detail.tsx`:
  - Show full lead info card at top
  - Timeline of outreach logs below — each entry shows method, message sent, date, and response received (if any)
  - Manual status override buttons: "Mark as Not Interested", "Mark as Responded", "Mark as Won"
- Add route in `routes/leads_routes.py` (backend):
  - `PATCH /api/leads/<id>/status` — body: `{ status }` → updates lead status manually
- Update `LeadsTable.tsx` to poll for updated leads every 30 seconds (so webhook-triggered status changes appear without a manual refresh)
- Add a simple stats bar at the top of the dashboard:
  - Total leads | New | Contacted | Responded | Won

**How to test:**
- Open a lead that has been contacted
- Full outreach timeline should show the message sent and the reply received
- Manually mark a lead as "Not Interested" — status badge should update immediately
- Stats bar should accurately reflect counts
- Wait 30 seconds without interacting — if a webhook fires, status should update automatically

---

## TODO Template

When creating `TODO.md` for the first time, use exactly this:

```markdown
# LeadHunter — Build Progress

## Phases

- [ ] Phase 1 — Project Scaffold & Database
- [ ] Phase 2 — Google Places Scan (Backend)
- [ ] Phase 3 — Dashboard UI (Read Only)
- [ ] Phase 4 — AI Message Generation (Backend)
- [ ] Phase 5 — Outreach Panel UI
- [ ] Phase 6 — SMS Sending via Twilio
- [ ] Phase 7 — Email Sending via Brevo
- [ ] Phase 8 — Webhook Response Tracking
- [ ] Phase 9 — Outreach History & Status UI Polish

## Log

(Agent adds a one-line completion note here after each phase)
```

---

## Safeguards

- **Never delete or overwrite the `.env` file** if it already exists. Only create `.env.example`.
- **Never commit secrets.** `.env` must be in `.gitignore`.
- **Never run database migrations that drop tables.** Only use `CREATE TABLE IF NOT EXISTS`.
- **Never call live Twilio or Brevo APIs during development** without confirming with the user that they want to send real messages.
- **Always validate request bodies** in routes before passing to services. Return a clear `400` error if required fields are missing.
- **Always wrap external API calls** (Google, Claude, Twilio, Brevo) in try/except and return meaningful error messages to the client.
- **CORS** must be enabled on the Flask backend so the React frontend can call it.
- **Never assume an API key works.** If an external call fails, surface the error clearly rather than silently continuing.
- **Check the TODO.md phase status before starting work.** If a phase is already checked off, do not redo it unless explicitly asked.