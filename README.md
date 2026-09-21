# AI Capsule

A private prompt library for saving, reviewing, and improving AI prompts used for coding, writing, debugging, and study.

## Live Deployment

- **Public URL:** https://ai-caplsule.onrender.com
- **Cloud platform:** Render (free tier Web Service)

## Installation & Local Setup

This project has two parts: `backend/` (Express API) and `frontend/` (React app).

### Backend

```bash
cd backend
npm install
```

Create a `.env` file in `backend/` with the following variables (see Environment Variables section below).

```bash
npm run dev
```

This starts the Express server on `http://localhost:3001` with auto-restart on file changes.

### Frontend (local development)

```bash
cd frontend
npm install
npm run dev
```

This starts the Vite dev server on `http://localhost:5173`, which proxies any `/api/*` request to the backend on port 3001.

### Running the production build locally

The deployed app serves the built React frontend directly from Express (not the Vite dev server). To test this locally:

```bash
cd frontend
npm run build
cd ../backend
npm run dev
```

Then visit `http://localhost:3001` — Express serves the built frontend and handles all API routes from the same origin.

## API Routes

| Route | Access | Purpose |
|---|---|---|
| `GET /` | Public | Landing page explaining AI Capsule |
| `GET /login` | Public | Starts Google OAuth login |
| `GET /dashboard` | Protected | Shows the authenticated user's saved capsules |
| `GET /api/health` | Public | Returns `{ "status": "ok" }` |
| `GET /api/capsules` | Protected | Returns the authenticated user's own capsule records |
| `POST /api/capsules` | Protected | Creates a new capsule owned by the authenticated user |
| `PUT /api/capsules/:id` | Protected | Updates a capsule, only if owned by the authenticated user |
| `DELETE /api/capsules/:id` | Protected | Deletes a capsule, only if owned by the authenticated user |

The React frontend has no separate backend URL to configure: in local development, Vite's dev server proxies `/api/*` requests to `http://localhost:3001` (configured in `frontend/vite.config.js`); in production, the frontend is built to static files and served directly by the same Express server that exposes the API, so all requests are same-origin.

## Authentication (OAuth + JWT)

- **OAuth provider used:** Google OAuth (see note below on why GitHub was not used).
- **Flow:**
  1. `GET /api/auth/google` redirects the user to Google's OAuth consent screen.
  2. Google redirects back to `GET /api/auth/google/callback` with an authorization code.
  3. The Express backend exchanges that code for a Google access token, then fetches the user's Google profile (id, email, name).
  4. The backend signs its own application JWT (using the `jsonwebtoken` package and `JWT_SECRET`), embedding the Google user id as `userId`.
  5. That JWT is set in a cookie named `token`, with `httpOnly: true`, `sameSite: 'lax'`, and `secure: true` in production (HTTPS) / `false` in local development (HTTP).
  6. The user is redirected to `/dashboard`.
- **Verification:** All `/api/capsules` routes are protected by a `requireAuth` Express middleware that reads the `token` cookie, verifies it with `jwt.verify()` against `JWT_SECRET`, and rejects the request with `401 Unauthorized` if the cookie is missing or the token is invalid/expired. On success, the decoded `userId` is attached to `req.user` and used for all ownership checks — it is never accepted from the request body or query string.

**Why Google instead of GitHub:** GitHub OAuth was implemented first, matching the brief's primary recommendation. However, GitHub's `/login/oauth/authorize` endpoint consistently returned a generic 404 error when attempting to authorize the registered OAuth App, even for a newly created app with correct configuration. This was tested across two browsers (Firefox, Chrome), multiple networks (home network, mobile hotspot), and even a second, unrelated GitHub account — all producing the identical failure, ruling out account-, browser-, and network-specific causes. Since the assignment brief explicitly permits switching to Google OAuth in this situation, that path was taken instead.

## Database

- **Engine:** SQLite via Node's built-in `node:sqlite` module (`DatabaseSync`), no third-party driver.
- **Schema:** defined in `backend/db.js`, created automatically via `CREATE TABLE IF NOT EXISTS` on server startup if it doesn't already exist.
- **Ownership:** every capsule record stores a `user_id` column, set from the verified JWT's `userId` at creation time — never supplied by the client. All read, update, and delete queries filter by `user_id`, so a user can only ever see or modify their own records.
- **Persistence:** On Render's free tier, the filesystem is ephemeral — the SQLite database file is stored locally on the running instance and **will be reset if the service restarts or redeploys**. This is the honest limitation for this submission (see below).

## Required cURL Security Tests

Run against the deployed backend:

```bash
# Test 1 - no authentication
curl -i https://ai-caplsule.onrender.com/api/capsules
```
Result: `HTTP/2 401`, body `{"error":"Unauthorized"}`

```bash
# Test 2 - fake / invalid JWT
curl -i -H "Cookie: token=fake-token-123" https://ai-caplsule.onrender.com/api/capsules
```
Result: `HTTP/2 401`, body `{"error":"Unauthorized"}`

Both confirm the backend requires a valid, verified JWT before returning any capsule data — a missing cookie and a tampered/invalid cookie are both correctly rejected.

## Environment Variables

Set in Render's dashboard (Environment tab), not committed to the repository:

- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `JWT_SECRET`
- `APP_URL`
- `NODE_ENV`

## Known Limitation

SQLite storage on Render's free tier is **ephemeral** — the database file lives on the instance's local disk, which is wiped whenever the service restarts, redeploys, or spins down after inactivity and later spins back up. Data entered during a session may not persist indefinitely. For this assignment's scope, SQLite meets the stated minimum requirement, but a production version of this app would use Render's managed PostgreSQL (or similar) for durable storage.

## AI-Assisted Development

- **AI tool used:** Claude (Anthropic), used for project setup, Express route design, SQLite queries, debugging, Render deployment configuration.

- **Problem found and corrected in AI-generated code:** When wiring Express to serve the built React frontend, the initially suggested catch-all route used the syntax `app.get('*', ...)`, which is valid in Express 4 but not Express 5 (used in this project). This threw a `path-to-regexp` error (`Missing parameter name at index 1`) that crashed the server on startup. It was corrected by changing the route to Express 5's required syntax: `app.get('/{*splat}', ...)`.

- **How OAuth login, JWT verification, and protected API behaviour were verified:** The full login flow was tested manually in the browser (Google consent screen → callback → dashboard redirect), and the resulting `token` cookie was inspected directly in browser DevTools to confirm it was set with `HttpOnly: true` and the correct `SameSite` value. Protected routes were tested with `curl`, both without any cookie and with a fabricated invalid cookie, confirming `401 Unauthorized` in both cases; a request with a real, valid cookie was then confirmed to succeed and return the correct decoded user identity.

- **How CRUD behaviour and user data ownership were verified:** Each of the four CRUD operations was tested individually via `curl` against the live authenticated session before being tested again through the actual React UI. Ownership enforcement was verified by confirming that `PUT`/`DELETE` requests for a non-existent (or not-owned) capsule id return `404 Not Found` rather than succeeding, and that the `user_id` stored on each created record always matched the authenticated user's verified JWT id, never a client-supplied value.

- **Implementation/deployment decision made independently:** GitHub OAuth was fully implemented first per the brief's primary recommendation, but its authorize endpoint returned a persistent 404 across multiple browsers, devices, and networks, with the cause not resolvable through available diagnostics. Rather than remain blocked, the decision was made to switch to Google OAuth, which the brief explicitly permits as a fallback. This required re-implementing the OAuth authorize URL, token exchange, and profile-fetch logic against Google's endpoints instead of GitHub's.
