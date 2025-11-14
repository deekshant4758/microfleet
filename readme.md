# Microfleet — Fleet Management API & CLI

> A lightweight fleet management API and CLI built with Node.js, Express and Prisma (MySQL). Includes REST endpoints for drivers, vehicles and trips, plus an interactive CLI for quick management tasks.

---

**Contents**
- **Project Summary**: what this repo provides
- **Prerequisites**: tools and env vars needed
- **Quick Start**: run the API and CLI locally
- **API Reference**: endpoints, request/response examples
- **CLI**: commands and how to use the interactive CLI
- **Database & Prisma**: schema & dev commands
- **Docker**: how to run with Docker (if present)
- **Troubleshooting**: common errors and fixes
- **Development notes**: file layout and conventions

---

**Project Summary**

Microfleet is a small API that models Drivers, Vehicles and Trips. It provides endpoints to create/read/update/delete these resources and a simple interactive CLI (`cli.js`) to manage them from the terminal.

- API: Express app in `src/app.js` using a Prisma client in `src/prismaClient.js` (or `src/app.js` exports `prisma`).
- Controllers: `src/controllers/*` — implement endpoints for drivers, vehicles and trips.
- Routes: `src/routes/*` — mount controllers under `/api/*`.
- CLI: `cli.js` — an interactive command-line UI to list/create/update/delete resources.

---

**Prerequisites**

- Node.js 18+ (project was tested on Node.js v22.x)
- npm
- MySQL database (or another DB supported by Prisma; `DATABASE_URL` must be set)
- (Optional) Docker / Docker Compose if you prefer containerized setup

Environment variables (minimum):
- `DATABASE_URL` — your database connection string used by Prisma

Put environment variables in a `.env` file at the project root (example):

```env
DATABASE_URL=mysql://user:password@localhost:3306/microfleet
```

---

**Quick Start — Local (Windows cmd examples)**

1. Install dependencies:

```cmd
cd microfleet
npm install
```

2. Generate Prisma client and run migrations (if you use migrations):

```cmd
npx prisma generate
npx prisma migrate dev --name init
```

If you prefer `prisma db push` to sync schema without migrations:

```cmd
npx prisma db push
```

3. Start the API server:

```cmd
npm run start
```

Server will listen on `http://localhost:8080` by default. Health check endpoint:

```cmd
curl http://localhost:8080/health
```

4. (Optional) Start the interactive CLI locally:

```cmd
npm run cli
```

The CLI is also registered as a `bin` in `package.json` (name: `microfleet`).

---

**API Reference**

Base URL: `http://localhost:8080/api`

Common patterns:
- Use JSON body for POST/PUT
- IDs are integers (controllers parse with `parseInt(..., 10)`)

1) Vehicles

- GET /api/vehicles
  - Returns list of vehicles with `driver` relation and recent `trips`.

- POST /api/vehicles
  - Create a vehicle.
  - Example request body:

```json
{
  "model": "Freightliner Cascadia",
  "regNumber": "FL-7788",
  "capacity": 22
}
```

- GET /api/vehicles/:id
  - Get a single vehicle (includes `driver` and `trips`).

- PUT /api/vehicles/:id
  - Update vehicle fields: `model`, `regNumber`, `capacity`, `status`.

- DELETE /api/vehicles/:id
  - Deletes the vehicle (may fail if DB constraints exist).

2) Drivers

- GET /api/drivers
- POST /api/drivers
  - Body: `{ "name": "Alice", "license": "L-123", "phone": "..." }`
- GET /api/drivers/:id
- PUT /api/drivers/:id
- POST /api/drivers/:id/assign-vehicle  (body: `{ "vehicleId": <id> }`)
- POST /api/drivers/:id/unassign-vehicle
- DELETE /api/drivers/:id

3) Trips

- GET /api/trips
- POST /api/trips
  - Example request body (controller expects numeric ids):

```json
{
  "origin": "City A",
  "destination": "City B",
  "driverId": 1,
  "vehicleId": 2,
  "distanceKm": 120.5
}
```

- GET /api/trips/:id
- PUT /api/trips/:id  (update fields like status / endTime)
- DELETE /api/trips/:id

Notes:
- Controllers parse `id`, `driverId`, `vehicleId` with `parseInt(..., 10)` and validate.
- `createTrip` uses `driverId` and `vehicleId` as scalar integer FKs.

---

**CLI (interactive)**

Start the CLI:

```cmd
npm run cli
```

The CLI provides interactive menus:
- Drivers: list, create, get, update, assign/unassign vehicle, delete
- Vehicles: list, create, get, update, delete
- Trips: list, create, get, end/cancel (update), delete

Examples (non-interactive usage via node):

```cmd
node cli.js drivers        # open drivers menu
node cli.js vehicles       # open vehicles menu
node cli.js trips          # open trips menu
```

Notes about CLI dependencies (common pitfalls):
- `chalk` and `inquirer` may be installed as ES modules in some environments. CLI handles both CommonJS and ESM by checking `.default` when required.
- If you see `inquirer.prompt is not a function`, ensure your installed `inquirer` version (check `package.json`) and Node version. The CLI uses `inquirer.createPromptModule()` fallback when appropriate.

---

**Database & Prisma**

The Prisma schema is in `prisma/schema.prisma`. Key model summary:
- `Driver` — has optional `assignedVehicle` (one-to-one), FK `vehicleId` stored on `Driver`.
- `Vehicle` — optional `driver` relation (holds the other side), `trips` array relation.
- `Trip` — references `driverId` and `vehicleId`; holds times, status, distance.

Important Prisma commands:

```cmd
npx prisma generate        # generate client
npx prisma migrate dev     # apply migrations (development)
npx prisma db push         # push schema without migrations
npx prisma studio          # open Prisma Studio (GUI)
```

Your controllers use `prisma.*` (for example `prisma.vehicle.create`), with `data:` objects and `include` to fetch relations.

---

**Docker (if present)**

This project contains `docker-compose.yaml` and a `dockerfile` in the repository root. If you prefer Docker:

```cmd
docker compose up --build
```

Make sure `DATABASE_URL` in `.env` is set or the docker compose file provides the database service and connection string.

---

**Troubleshooting & Common Errors**

1) Error: `Cannot read properties of undefined (reading 'vehicle')`
- Cause: A controller or client code attempted to access a relation on a null/undefined object. Often happens when a resource creation fails or controller returns an unexpected structure.
- Fix: Ensure your request body includes required fields (e.g. for `POST /api/vehicles` include `model`, `regNumber`, `capacity`). The server validates inputs and returns errors now.

Example (working `POST /api/vehicles`):

```cmd
curl -X POST http://localhost:8080/api/vehicles -H "Content-Type: application/json" -d "{ \"model\": \"Freightliner Cascadia\", \"regNumber\": \"FL-7788\", \"capacity\": 22 }"
```

If you still see `Cannot read properties of undefined (reading 'vehicle')`, check server logs — controllers now log errors (see `console.error`) and controllers validate IDs.

2) `inquirer.prompt is not a function` or `chalk.red is not a function`
- Cause: `inquirer` or `chalk` installed as ESM-only packages (newer major versions) while code uses `require()`.
- Fixes applied in `cli.js`:
  - `inquirer` loaded as `inquirerModule.default || inquirerModule.createPromptModule()` to support both shapes.
  - `chalk` loaded as `chalkModule.default || chalkModule`.
- If you still encounter issues: check installed versions in `package.json`. Recommended working versions from this project are:
  - `chalk`: ^4.1.2
  - `inquirer`: ^8.2.6

3) PowerShell `npm` execution policy error when running scripts (e.g. `npm start`):
- Issue: PowerShell execution policies may block `npm` scripts on Windows.
- Quick workaround: start the server directly with Node:

```powershell
node src/app.js
```

Or change execution policy (requires admin) in PowerShell:

```powershell
Set-ExecutionPolicy RemoteSigned
```

4) Database connection failures
- Ensure `DATABASE_URL` is correct and the DB server is reachable.
- See `src/app.js` logs — the server prints `Database connected successfully.` on success.

---

**File Layout (key files)**

- `src/app.js` — Express app, route mounting and Prisma client initialization
- `src/prismaClient.js` — exports prisma client (if present). In this repo `app.js` exports `prisma` as well.
- `src/routes/*.js` — route definitions
- `src/controllers/*.js` — controller implementations (drivers, vehicles, trips)
- `cli.js` — interactive command-line application
- `prisma/schema.prisma` — Prisma schema
- `.env` — local environment variables (not committed)

---

**Development tips**

- Use `node --check` to quickly detect syntax errors in individual files:

```cmd
node --check src/controllers/vehicles.js
```

- The controllers include input validation (ID parsing with `parseInt(..., 10)`), and more defensive error handling has been added.

- When changing Prisma models, run `npx prisma generate` so the client matches the schema.

---

**Contributing**

Happy to accept improvements. Follow these steps locally:

1. Fork & clone
2. Create a feature branch
3. Implement & add tests (if applicable)
4. Run `npx prisma migrate dev` if DB changes are added
5. Submit a PR with a clear description

---
