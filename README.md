# LeadHunter

A local lead generation tool that finds small businesses with no website via Google Places API, displays them in a dashboard, lets you send AI-generated outreach messages via SMS or email, and tracks responses.

## Prerequisites

- Python 3.10+
- Node.js 18+
- npm

## Setup

### 1. Environment Variables

Copy the example env file and fill in your API keys:

```bash
cp .env.example .env
```

### 2. Backend (Flask)

```bash
cd server
source .venv/bin/activate
pip install -r requirements.txt
python app.py
```

The server starts at `http://localhost:8000`.

### 3. Frontend (React Router v7)

```bash
cd client/lead-gen-ui
npm install
npm run dev
```

The client starts at `http://localhost:5173`.

## Project Structure

- `server/` — Flask backend (Python)
  - `routes/` — HTTP endpoints (Flask Blueprints)
  - `services/` — Business logic, API integrations
  - `repositories/` — Database access (SQLite)
  - `models/` — Data classes
- `client/lead-gen-ui/` — React Router v7 frontend (TypeScript)
  - `app/routes/` — Route modules
  - `app/components/` — UI components
  - `app/api/` — Backend API calls
  - `app/hooks/` — Custom hooks
  - `app/store/` — Zustand stores

## Tech Stack

| Layer | Technology |
|---|---|
| Backend | Flask, SQLite |
| Frontend | React Router v7, TypeScript, Tailwind CSS v4 |
| State | Zustand |
| Places Data | Google Places API |
| AI Messages | Claude API |
| SMS | Twilio |
| Email | Brevo |
| Webhooks | ngrok |
