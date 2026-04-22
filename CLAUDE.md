# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This repository contains a web-based resume generation tool inspired by the [posquit0/Awesome-CV](https://github.com/posquit0/Awesome-CV) LaTeX template. The goal is to create a user-friendly web application that allows users to create professional resumes, CVs, and cover letters with the same visual quality and formatting as the original Awesome-CV LaTeX template, but through a modern web interface.

**Core Requirements:**
1. Web-based interface for easy resume creation (no LaTeX knowledge required)
2. Generate LaTeX source code matching Awesome-CV format
3. Compile LaTeX to PDF server-side
4. Provide download links for both LaTeX source and PDF output
5. Support all Awesome-CV components: Résumé, CV (Curriculum Vitae), and Cover Letter
6. Maintain the original typography (Roboto, Source Sans Pro) and iconography (Font Awesome 6)

## Technical Architecture

### Proposed Stack
- **Frontend**: React/Vue.js with TypeScript for responsive UI
- **Backend**: Node.js/Express or Python/FastAPI for API endpoints  
- **LaTeX Processing**: Docker container with full TeX Live distribution
- **Database**: PostgreSQL/SQLite for user templates and saved resumes (optional)
- **Deployment**: Docker Compose for local development, cloud-ready

### Key Components
1. **Template Engine**: Converts user form data to valid Awesome-CV LaTeX `.cls` and `.tex` files
2. **LaTeX Compiler Service**: Secure sandboxed environment for `xelatex` compilation
3. **PDF Preview**: Server-side rendering or client-side PDF viewer
4. **Template Management**: Save, load, and customize resume templates

## Development Tasks

### Phase 1: Foundation
1. **Project Setup**
   - Initialize frontend and backend projects
   - Configure Docker for LaTeX environment
   - Set up development tooling (ESLint, Prettier, TypeScript)

2. **LaTeX Pipeline**
   - Create Docker image with TeX Live and required fonts
   - Build API endpoint that accepts LaTeX source and returns PDF
   - Implement error handling for LaTeX compilation failures

3. **Template Analysis**
   - Parse Awesome-CV `.cls` file to understand structure
   - Identify customizable sections (personal info, education, experience, skills, etc.)
   - Create JSON schema for resume data

### Phase 2: Frontend Development
4. **Form Interface**
   - Create responsive form for all resume sections
   - Implement real-time LaTeX preview (simplified rendering)
   - Add validation and help text

5. **Template Customization**
   - Color scheme selector
   - Font size/weight controls
   - Section ordering toggle

6. **Export Features**
   - Download LaTeX source button
   - One-click PDF generation
   - Shareable links (optional)

### Phase 3: Backend Services
7. **User Management** (optional)
   - Authentication system
   - Save/load resumes
   - Template library

8. **Performance Optimization**
   - LaTeX compilation caching
   - Queue system for concurrent requests
   - CDN for generated PDFs

### Phase 4: Polish
9. **Testing**
   - Unit tests for template generation
   - Integration tests for LaTeX compilation
   - End-to-end UI tests

10. **Documentation**
    - User guide for resume creation
    - Developer setup instructions
    - API documentation

## Getting Started

### Prerequisites
- Docker and Docker Compose
- Node.js 18+ or Python 3.10+
- Git

### Initial Setup
```bash
# Clone the repository
git clone <repo-url>
cd web-resume

# Start development environment
docker-compose up -d

# Install frontend dependencies
cd frontend && npm install

# Install backend dependencies  
cd ../backend && npm install  # or pip install -r requirements.txt
```

### Running Services
- **Frontend**: `cd frontend && npm run dev` (typically http://localhost:3000)
- **Backend**: `cd backend && npm run dev` (typically http://localhost:5000)
- **LaTeX Service**: Managed via Docker Compose

### Testing LaTeX Compilation
```bash
# Test the LaTeX service directly
curl -X POST http://localhost:5050/compile \
  -H "Content-Type: application/json" \
  -d '{"latex": "\\documentclass{article}\\begin{document}Test\\end{document}"}' \
  --output test.pdf
```

## Project Structure
```
web-resume/
├── frontend/                 # React/Vue.js application
│   ├── public/
│   ├── src/
│   │   ├── components/       # Form components, preview, etc.
│   │   ├── services/         # API client
│   │   └── templates/        # JSON schemas for resume types
│   └── package.json
├── backend/                  # Node.js/Python API server
│   ├── src/
│   │   ├── routes/          # API endpoints
│   │   ├── services/        # LaTeX generation, compilation
│   │   └── templates/       # LaTeX template files
│   └── package.json/requirements.txt
├── latex-service/            # Dockerized LaTeX compiler
│   ├── Dockerfile
│   └── compile.sh           # Entry point for compilation
├── docker-compose.yml
├── .env.example
└── CLAUDE.md                # This file
```

## Important Files

### Template Files
- `backend/src/templates/awesome-cv.cls` - Modified Awesome-CV class file
- `backend/src/templates/resume.tex.j2` - Jinja2 template for resume generation
- `frontend/src/templates/resume-schema.json` - JSON schema for form validation

### Configuration
- `docker-compose.yml` - Defines all services (frontend, backend, latex, db)
- `.env` - Environment variables (API keys, database URLs)
- `latex-service/Dockerfile` - TeX Live with required fonts

## Development Guidelines

### LaTeX Generation
- Always escape user input to prevent LaTeX injection
- Use template engines (Jinja2, Handlebars) for variable substitution
- Preserve original Awesome-CV formatting defaults unless explicitly changed

### Security Considerations
- LaTeX compilation must run in isolated Docker containers
- Sanitize all user inputs before template rendering
- Implement rate limiting for PDF generation
- Never expose LaTeX compilation service directly to internet

### Performance Tips
- Cache frequently generated PDFs (hash-based)
- Use background jobs for PDF generation
- Consider client-side PDF rendering for previews

## References
- [Awesome-CV GitHub Repository](https://github.com/posquit0/Awesome-CV) - Original LaTeX template
- [XeLaTeX Documentation](https://www.overleaf.com/learn/latex/XeLaTeX)
- [Font Awesome 6 Icons](https://fontawesome.com/v6/icons)