# API Documentation

This document describes the REST API provided by the Web Resume Generator backend.

**Base URL**: `http://localhost:5001/api/v1`

**General Response Format**:
```json
{
  "status": "success | error",
  "message": "Optional description",
  "data": { ... }
}
```

---

## Health Check

### `GET /health`

Returns the service health status.

**Example Response**:
```json
{
  "status": "healthy",
  "timestamp": "2026-04-23T02:30:45.805Z",
  "service": "web-resume-api",
  "version": "1.0.0",
  "environment": "development"
}
```

---

## Resume Management

### `GET /api/v1/resumes`

Paginated query of the current user's resume list.

**Query Parameters**:
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| page | int | No | Page number, defaults to 1, minimum 1. |
| limit | int | No | Page size, defaults to 20, maximum 100. |
| search | string | No | Search keywords. |

**Example Response**:
```json
{
  "status": "success",
  "data": {
    "resumes": [...],
    "pagination": { "page": 1, "limit": 20, "total": 5, "pages": 1 }
  }
}
```

### `POST /api/v1/resumes`

Creates a new resume.

**Request Body**:
```json
{
  "title": "My Resume",
  "content": { "personal": { ... }, "education": [...], "sections": [...], "skills": [...] },
  "templateId": "uuid-string",
  "settings": { "colorScheme": "awesome-red" }
}
```

### `GET /api/v1/resumes/:id`

Gets details of a specific resume.

### `PUT /api/v1/resumes/:id`

Updates a resume.

**Request Body** (Optional fields):
```json
{
  "title": "Updated Title",
  "content": { ... },
  "settings": { ... },
  "isPublic": true
}
```

### `DELETE /api/v1/resumes/:id`

Deletes a resume.

### `POST /api/v1/resumes/:id/duplicate`

Duplicates a resume.

**Request Body** (Optional):
```json
{
  "title": "Copy of My Resume"
}
```

### `GET /api/v1/resumes/sample`

Gets sample resume data.

---

## Job Application Tracking

### `GET /api/v1/applications`

Queries the job application list.

**Query Parameters**:
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| status | string | No | Filter by status. |
| company | string | No | Filter by company name. |
| page | int | No | Page number, defaults to 1. |
| limit | int | No | Page size, defaults to 50, maximum 100. |

**Example Response**:
```json
{
  "status": "success",
  "data": {
    "applications": [
      {
        "id": "bf579f24-d4d6-4b14-86d6-a52c255b5bdc",
        "userId": "user-id-mock",
        "company": "TestCorp",
        "jobTitle": "Software Engineer",
        "location": "Tokyo",
        "status": "applied",
        "stage": "Resume submitted",
        "appliedAt": "2026-04-23T02:36:08.289Z",
        "source": "LinkedIn",
        "notes": "First test application",
        "resumeId": null,
        "interviews": []
      }
    ]
  }
}
```

### `POST /api/v1/applications`

Creates a new job application.

**Request Body**:
```json
{
  "company": "TestCorp",
  "jobTitle": "Software Engineer",
  "location": "Tokyo",
  "status": "applied",
  "stage": "Resume submitted",
  "appliedAt": "2026-04-23T00:00:00Z",
  "source": "LinkedIn",
  "notes": "Optional notes",
  "resumeId": "uuid-or-null"
}
```

**Required Fields**: `company`, `jobTitle`

### `GET /api/v1/applications/:id`

Gets details of a single job application (including interview list).

### `PUT /api/v1/applications/:id`

Updates a job application.

### `DELETE /api/v1/applications/:id`

Deletes a job application.

### `GET /api/v1/applications/:id/interviews`

Queries the interview list for a specific application.

### `POST /api/v1/applications/:id/interviews`

Adds an interview record to a specific application.

**Request Body**:
```json
{
  "round": 1,
  "interviewType": "Phone",
  "interviewer": "Alice",
  "scheduledAt": "2026-04-25T10:00:00Z",
  "outcome": "pending",
  "feedback": "Good communication skills",
  "notes": "Initial phone screen"
}
```

---

## PDF / Typst Compilation

### `POST /api/v1/pdf/generate`

Directly submits Typst source and compiles it to PDF.

**Request Body**:
```json
{
  "typst": "#import \"awesome-cv.typ\": *\n...",
  "cacheKey": "optional-cache-key"
}
```

### `POST /api/v1/pdf/generate-from-resume/:id`

Generates PDF from an existing resume (currently a placeholder implementation).

### `GET /api/v1/pdf/preview-template/:templateName`

Generates a preview PDF for a specific template.

### `GET /api/v1/pdf/download/:cacheKey`

Downloads a generated PDF.

### `GET /api/v1/pdf/preview/:cacheKey`

In-browser inline preview of a PDF.

### `GET /api/v1/pdf/refresh-all-previews`

Refreshes all template previews (management endpoint).

---

## Template Management

### `GET /api/v1/templates`

Gets the list of templates (currently mock data).

### `GET /api/v1/templates/:id`

Gets details of a specific template.

---

## Authentication (Placeholder)

### `POST /api/v1/auth/register`

User registration (currently returns 503).

### `POST /api/v1/auth/login`

User login (currently returns 503).

---

## Error Codes

| HTTP Status Code | Description |
|------------------|-------------|
| 200 | Request successful |
| 201 | Creation successful |
| 400 | Request parameter validation failed |
| 404 | Resource does not exist |
| 500 | Internal server error |
| 502 | External service (Typst compilation) unavailable |
| 503 | Feature not yet enabled |
