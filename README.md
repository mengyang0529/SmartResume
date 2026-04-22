# Web Resume Generator

A modern, web-based resume generator that uses [Typst](https://typst.app/) for professional typesetting.

## Features

- **Real-time Preview**: See your changes instantly as you type.
- **Typst Engine**: High-performance, professional-grade PDF generation.
- **Modern Templates**: Beautiful, clean templates based on `modern-cv`.
- **Customizable**: Change colors, fonts, and layout settings.
- **Privacy-focused**: Your data stays under your control.

## Tech Stack

- **Frontend**: React, TypeScript, Tailwind CSS, Vite.
- **Backend**: Node.js, Express, Prisma (PostgreSQL).
- **Typesetting**: Typst Compilation Service (Python/Flask).

## Getting Started

### Prerequisites

- Docker and Docker Compose
- Node.js (v18+)

### Running with Docker (Recommended)

1. Clone the repository.
2. Run `docker-compose up --build`.
3. Access the frontend at `http://localhost:3000`.

### Local Development

1. **Typst Service**:
   ```bash
   cd typst-service
   # Recommended to run via Docker as it needs specific fonts and Typst CLI
   docker build -t typst-service .
   docker run -p 5050:5050 typst-service
   ```

2. **Backend**:
   ```bash
   cd backend
   npm install
   # Set up your .env file
   npx prisma generate
   npx prisma migrate dev
   npm run dev
   ```

3. **Frontend**:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

## Migration Note: LaTeX to Typst

The project has recently migrated from LaTeX to Typst to improve compilation speed and template flexibility.

- **Old**: `latex-service` (XeLaTeX based)
- **New**: `typst-service` (Typst CLI based)

See [dev_log.md](./dev_log.md) for detailed migration history.

## License

MIT
