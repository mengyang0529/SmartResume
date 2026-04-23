# Web Resume Backend

The `backend` module is responsible for the Web Resume application's API, database access, Typst resume generation, and PDF compilation coordination.

## 1. Project Overview

- Framework: `Express` + `TypeScript`
- ORM: `Prisma` (PostgreSQL)
- Validation: `express-validator`, `zod`
- Security & Performance: `helmet`, `cors`, `compression`, `express-rate-limit`
- Typst Integration: Backend calls an external Typst compilation service to generate PDFs/previews.
- Run Mode: Development uses `tsx watch`, production uses `tsc` for compilation followed by execution.

## 2. Directory Structure

- `src/index.ts`: Express application entry point, registers middleware, routes, error handling, and health checks.
- `src/config/env.ts`: Environment variable loading and validation.
- `src/routes/`: Route module registration.
  - `auth.routes.ts`: Currently disables login/registration, returns `503`.
  - `resume.routes.ts`: Resume CRUD, sample data, duplication, deletion.
  - `application.routes.ts`: Job application and interview CRUD.
  - `template.routes.ts`: Template list, template details, template management interface (currently mock/placeholder implementation).
  - `pdf.routes.ts`: PDF generation, preview, refreshing preview cache.
  - `user.routes.ts`: User-related endpoints (extensible).
- `src/services/`: Business logic layer.
  - `resume.service.ts`: Business logic for resume creation, update, query, deletion, duplication, download counting, etc.
  - `application.service.ts`: Business logic for job application and interview creation, update, query, deletion, etc.
  - `typst.service.ts`: Converts structured resume data into Typst source code.
- `src/middleware/`: Common middleware.
  - `errorHandler.ts`: Unified exception handling, Zod/Prisma error conversion, stack output in development environment.
  - `rateLimiter.ts`: General rate limiting, PDF upload rate limiting, auth/API key rate limiting.
- `prisma/schema.prisma`: Database model definitions.

## 3. Core Execution Flow

1. `src/index.ts` initializes the Express application.
2. Load security middleware: `helmet`, `cors`, `compression`.
3. Use `express.json()` to parse request bodies.
4. Enable logging: `morgan`.
5. Enable rate limiting: Global `rateLimiter`, plus `pdfRateLimit` for PDF routes.
6. Register route modules: `/api/v1/*`.
7. Unmatched routes enter `notFoundHandler`.
8. Unified exceptions are handled by `errorHandler` and return standard JSON.

## 4. Important Configuration & Environment Variables

Must be set in `backend/.env` or the deployment environment:

- `NODE_ENV`: `development` / `production` / `test`
- `PORT`: Service port, defaults to `5000`.
- `DATABASE_URL`: PostgreSQL connection string.
- `JWT_SECRET`: JWT signing secret (currently auth not enabled, but still checked for existence).
- `SESSION_SECRET`: Session encryption secret.
- `CORS_ORIGIN`: Allowed origin for cross-origin requests, defaults to `http://localhost:3000`.
- `TYPST_SERVICE_URL`: Typst service address, defaults to `http://localhost:5050`.
- `REDIS_URL`: Optional Redis address for rate limiting persistence.
- `RATE_LIMIT_WINDOW_MS`: Rate limiting window, defaults to `900000` (15 min).
- `RATE_LIMIT_MAX_REQUESTS`: Rate limiting request limit, defaults to `100`.
- `API_KEY`: Optional API key for future external access authorization.

## 5. Main Dependencies

- `express`: HTTP service.
- `@prisma/client` / `prisma`: Database ORM.
- `zod`: Environment variable schema validation.
- `express-validator`: Request parameter and body validation.
- `axios`: Calls external Typst service.
- `helmet`: Security response headers.
- `cors`: CORS control.
- `express-rate-limit`: API rate limiting.
- `compression`: Response compression.
- `cookie-parser`: Cookie parsing.
- `morgan`: Request logging.

## 6. Database & Prisma

`prisma/schema.prisma` defines the following models:

- `User`
- `Resume`
- `Application`
- `Interview`
- `Template`
- `PdfJob`
- `Session`

The current backend core uses the `Resume` table to store:

- `content`: Resume JSON data.
- `typstSource`: Generated Typst text.
- `settings`: Template/color configuration.
- `downloadCount`, `isPublic`, `userId`, etc.

### Common Prisma Commands

- `npm run db:generate`: Generate Prisma Client.
- `npm run db:migrate`: Run migrations.
- `npm run db:studio`: Open Prisma Studio.

## 7. Typst Integration

The backend converts structured resume data into Typst source code via `TypstService`. Key points:

- Automatic escaping of Typst strings and content.
- Map colors, paper sizes, and header alignment based on `TemplateSettings`.
- Supports modules for personal information, introduction, work experience, education, skills, projects, languages, honors, certificates, publications, etc.
- Generated Typst is sent to `TYPST_SERVICE_URL/compile` via `pdf.routes.ts`.

### PDF Generation Routes

- `GET /api/v1/pdf/refresh-all-previews`: Refreshes preview cache for multiple templates.
- `GET /api/v1/pdf/preview-template/:templateName`: Generates/gets preview cache for a specific template.
- `POST /api/v1/pdf/generate`: Directly requests Typst compilation and returns a cache key.

## 8. API Design

### 8.1 General Route Registration

- `GET /health`: Health check.
- `GET /api/docs`: Simple API documentation route.
- `/api/v1/auth`: Authentication placeholder, currently returns `503`.
- `/api/v1/resumes`: Resume management endpoints.
- `/api/v1/applications`: Job application and interview management endpoints.
- `/api/v1/templates`: Template management endpoints (mock/stub implementation).
- `/api/v1/pdf`: PDF / Typst compilation endpoints.
- `/api/v1/users`: User endpoints placeholder.

### 8.2 Resume Route Highlights

- `GET /api/v1/resumes/sample`: Returns sample resume data.
- `GET /api/v1/resumes`: Paginated query for user resumes (currently using mock userId).
- `POST /api/v1/resumes`: Create new resume and generate Typst.
- `GET /api/v1/resumes/:id`: Read resume.
- `PUT /api/v1/resumes/:id`: Update resume and regenerate Typst as needed.
- `DELETE /api/v1/resumes/:id`: Delete resume.
- `POST /api/v1/resumes/:id/duplicate`: Duplicate resume.

### 8.3 Application Route Highlights

- `GET /api/v1/applications`: Paginated query for user job applications (currently using mock userId).
- `POST /api/v1/applications`: Create new job application.
- `GET /api/v1/applications/:id`: Read job application details.
- `PUT /api/v1/applications/:id`: Update job application.
- `DELETE /api/v1/applications/:id`: Delete job application.

## 9. Middleware & Security

### 9.1 `errorHandler`

- Captures `AppError`, `ValidationError`, `ZodError`, and Prisma errors.
- Returns detailed `stack` in development environment.
- Unified response format:
  - `status: error`
  - `message`
  - `errors` (optional)

### 9.2 `rateLimiter`

- Global request rate limiting.
- PDF generation requests use a higher threshold but separate rate limiting.
- Auth login requests also have reserved dedicated rate limiting.
- Supports Redis storage, falls back to memory storage if not configured.

### 9.3 `helmet` & `cors`

- `helmet` enabled with cross-origin and content security policies.
- `cors` limits origins to `CORS_ORIGIN`.

## 10. Development & Testing

### 10.1 Local Development

```bash
cd backend
npm install
npm run dev
```

### 10.2 Build & Release

```bash
npm run build
npm start
```

### 10.3 Type Checking & Formatting

```bash
npm run type-check
npm run lint
npm run format
```

### 10.4 Testing

```bash
npm run test
npm run test:coverage
```

## 11. Known TODOs / Iteration Points

- `auth.routes.ts` is currently a placeholder; actual user authentication is not yet enabled.
- `template.routes.ts` is still using mock data and simulated creation.
- `userId` is currently hardcoded as `user-id-mock` in `resume.routes.ts` and `application.routes.ts`.
- `user.routes.ts` has no complete user lifecycle implemented.
- Add JWT authentication middleware and parse the requesting user from the token into `req.user`.
- Strengthen database transaction and Typst generation failure rollback logic.
- Job application tracking functionality implemented, including Application and Interview models.

## 12. Details

- `src/config/env.ts` uses `zod` for strong typing validation of environment variables; failure to start will throw an error.
- `prisma/schema.prisma` uses `Json` type to store dynamic resume fields and template configurations.
- `TypstService.generateResumeTypst()` maps dynamic data to compilable Typst source.
- `pdf.routes.ts` uses `axios` to call `TYPST_SERVICE_URL/compile`, handling cache keys, cache hits, and exception returns.

## 13. Directory Navigation

- Backend Main Entry: `backend/src/index.ts`
- Route Registration: `backend/src/routes/index.ts`
- Business Logic: `backend/src/services/*.ts`
- Middleware: `backend/src/middleware/*.ts`
- Env Validation: `backend/src/config/env.ts`
- Data Model: `backend/prisma/prisma/schema.prisma`

---

This README is intended to help backend developers quickly understand the current implementation, run mode, and areas for upgrade. Feel free to extend this file with specific API examples or test cases.
