# PhishLab

PhishLab is a controlled, classroom-only Instagram-style phishing awareness simulator. It demonstrates visual impersonation and the value of checking links without collecting credentials.

## Ethical limits

This project does not implement Instagram authentication. The password field accepts a dummy training value in the browser, but that value is never sent to the server, logged, hashed, or persisted. Events contain only anonymous session IDs, allowlisted event types, and timestamps. Do not deploy this application publicly or use it to collect real information.

## Run locally

Prerequisite: Node.js 20+ and npm 10+.

```bash
npm run install:all
copy server\\.env.example server\\.env
npm run dev
```

Open `http://localhost:5173` for the student simulation and `http://localhost:5173/admin` for the instructor dashboard. The development admin password is configured in `server/.env`.

## Configuration

`server/.env.example` contains safe local defaults for `PORT`, `CLIENT_ORIGIN`, `ADMIN_PASSWORD`, and `RATE_LIMIT_MAX`.

## API

- `POST /api/simulation/start` creates an anonymous session.
- `POST /api/simulation/event` records one allowlisted event.
- `POST /api/demo-login` stores only `demo_username`, `password_field_filled`, `timestamp`, and `session_id` for a fictional submission.
- `GET /api/admin/summary` returns aggregate counts (requires `x-admin-password`).
- `GET /api/admin/events` returns safe recent events (requires `x-admin-password`).
- `GET /api/admin/demo-logins` returns safe demonstration records (requires `x-admin-password`).
- `POST /api/admin/reset` clears demo data (requires `x-admin-password`).

Run `npm test` for API security and workflow tests. Submit fictional details at `http://localhost:5173/`, then open `http://localhost:5173/admin`, enter the configured admin password, and refresh the dashboard. No passwords, IP addresses, cookies, browser fingerprints, tokens, or personal identifiers are stored.