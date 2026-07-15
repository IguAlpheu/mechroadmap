---
name: backend_development
description: "Guidelines and conventions for writing backend code in the Lumeo project, including Express, TypeScript, routing, and API designs."
---

# Backend Development Skill

Use this skill when designing, building, or refactoring the backend/server-side code for the Lumeo application.

## Key Technologies
- **Node.js** & **TypeScript**
- **Express.js** (web framework)
- **esbuild** (production bundler)
- **Supabase JS Client** (database integration, if database is required)

## Coding Standards & Guidelines

### 1. Project Structure
- All backend files reside in the [server](file:///c:/Users/Igu/OneDrive/Documentos/Lumeo/server) directory.
- The entry point is [server/index.ts](file:///c:/Users/Igu/OneDrive/Documentos/Lumeo/server/index.ts).
- For API routes or custom middleware, separate them into appropriate modules (e.g., `server/routes.ts`, `server/middleware/`) instead of cluttering `index.ts`.

### 2. Request Handling & Validation
- Parse JSON requests using `express.json()` middleware.
- Use **Zod** schema validation to validate incoming request bodies or query params.
- Always implement proper try-catch blocks and error-handling middleware to avoid crashing the server.

### 3. Routing Conventions
- Group related API endpoints under `/api` prefixes (e.g., `/api/goals`, `/api/user`).
- Return JSON responses with appropriate HTTP status codes:
  - `200 OK` or `201 Created` for success.
  - `400 Bad Request` for validation failures.
  - `401 Unauthorized` / `403 Forbidden` for auth failures.
  - `404 Not Found` when a resource is missing.
  - `500 Internal Server Error` for server-side exceptions.
