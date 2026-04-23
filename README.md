# Web Resume Generator

A Typst-based Web Resume Generator that supports editable resume content, online PDF generation, and modern resume templates.

## Highlights

- **Typst PDF Generation**: Uses Typst as the typesetting engine, providing faster and more stable PDF output.
- **React Editing Interface**: Built with React + Vite + Tailwind for easy extension and fast iteration.
- **Modern Resume Templates**: Based on the `awesome-cv` style template and inspired by [modern-cv](https://github.com/ptsouchlos/modern-cv), supporting various resume content modules.
- **Developer Friendly**: Supports one-click start with Docker Compose, suitable for local development and debugging.

## Project Architecture

- `frontend/`: React + TypeScript + Tailwind frontend application
- `backend/`: Node.js + Express + TypeScript API service
- `typst-service/`: Flask Typst compilation service, responsible for Typst to PDF conversion
- `data/`: Example resume data
- `docker-compose.yml`: Local development environment orchestration

## Service Description

- Frontend: `http://localhost:3000`
- Backend API: `http://localhost:5001/api`
- Typst Service: `http://localhost:5050`
- Database: PostgreSQL (`db` container)

## Main Features

- Resume Data Editing: Personal information, education, work experience, skills, projects, languages, honors, etc.
- Job Application Tracking: Profile page provides job application and interview tracking functions, including application status, interview arrangements, statistics, and timeline.
- Backend Resume Management Interface: `GET /api/v1/resumes`, `POST /api/v1/resumes`, `GET /api/v1/resumes/:id`, `PUT /api/v1/resumes/:id`, `DELETE /api/v1/resumes/:id`
- Job Application Management Interface: `GET /api/v1/applications`, `POST /api/v1/applications`, `GET /api/v1/applications/:id`, `PUT /api/v1/applications/:id`, `DELETE /api/v1/applications/:id`
- Interview Management Interface: `GET /api/v1/applications/:id/interviews`, `POST /api/v1/applications/:id/interviews`
- Typst PDF Compilation: `typst-service` provides `/compile` API
- Health Check: `/health`
- Docker Compose one-click start for all services

## Quick Start

### Using Docker Compose (Recommended)

```bash
docker-compose up --build
```

Open your browser and visit `http://localhost:3000`.

### Local Development

#### 1. Typst Service

```bash
cd typst-service
docker build -t typst-service .
docker run -p 5050:5050 typst-service
```

#### 2. Backend

```bash
cd backend
npm install
cp .env.example .env
# Ensure NODE_ENV=development in .env, otherwise the backend will not start the port listener
npm run db:generate
npx prisma migrate dev
npm run dev
```

The backend listens on `http://localhost:5001` by default.

> **Note**: Local development requires starting PostgreSQL first. macOS users can start it via `brew services start postgresql@18`, or refer to the official PostgreSQL documentation.

#### 3. Frontend

```bash
cd frontend
npm install
npm run dev
```

The frontend listens on `http://localhost:3000` by default, forwarding `/api` to `localhost:5001` via Vite proxy.

## Migration Notes

This project has completed the migration from LaTeX to Typst:

- `latex-service/` has been removed
- Backend generation logic has switched to `backend/src/services/typst.service.ts`
- Typst compilation is provided by `typst-service/server.py`
- Frontend has been updated for Typst content generation and backend integration

For more migration details, please check `dev_log.md`.

## Local Environment Variables

`docker-compose.yml` contains the following main environment variables:

- `REACT_APP_API_URL=http://localhost:5001/api`
- `NODE_ENV=development`
- `DATABASE_URL=postgresql://postgres:password@db:5432/resume_db`
- `TYPST_SERVICE_URL=http://typst:5050`
- `MAX_COMPILE_TIME=30`
- `CACHE_ENABLED=true`

## Database Migration

For local development, migrations need to be run after the first start or schema changes:

```bash
cd backend
# Generate Prisma Client
npm run db:generate

# Create and apply migrations (development environment)
npx prisma migrate dev

# Apply existing migrations only (production environment)
npm run db:migrate
```

## Running Tests and Build

### Backend

```bash
cd backend
npm run type-check   # TypeScript type checking
npm run build        # Compile to dist/
npm test             # Run unit tests
```

### Frontend

```bash
cd frontend
npm run type-check   # TypeScript type checking
npm run build        # Vite production build
npm test             # Run unit tests
```

## API Documentation

See [`backend/API.md`](backend/API.md) for details, including request/response descriptions for all endpoints.

## Notes

The current project has completed the Typst migration and Profile page refactoring into a job application tracker. Core features include resume generation and job application management. Database migrations have been verified, backend routes have been tested, and both frontend and backend builds are error-free.

## License

MIT
