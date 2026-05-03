# Smart Resume Markdown Schema (English Version)

Use this guide for standard Western-style resumes.

---

## 1. Metadata (YAML Frontmatter)
```yaml
---
firstName: "John"
lastName: "Doe"
position: "Senior Software Engineer"
email: "john.doe@example.com"
mobile: "+1-123-456-7890"
address: "New York, USA"
homepage: "https://github.com/johndoe"
---
```

## 2. Structure Rules
- **Personal Info**: Split full names into `firstName` and `lastName`. Do not use a single `name` field.
- **Sections**: Use `##` (e.g., `## Work Experience`, `## Education`, `## Projects`).
- **Entities**: Use `###` for Company or School names.
- **Role/Date Line**: Immediately after `###`, use: `**Job Title** | StartDate - EndDate`.
  - *Note: Only the title is bolded. The pipe `|` and dates are NOT bolded. Use spaces around `|` and ` - `.*
- **Date Format**: Use `MMM YYYY` (e.g., `Oct 2013`) or `YYYY/MM`. Use `Present` for ongoing roles.
- **Example**: `**Senior Engineer** | Oct 2013 - Present`

---

## 📸 VISION MODEL TIP (OCR/Image Input)
If you are using a Vision-capable model (like GPT-4o or Gemini Pro Vision) with a **screenshot or image** of the resume:
- The model can see the spatial layout. Tell it to "Look for the header area for name and contact info" and "Look at the right side or end of lines for dates."
- Vision models are excellent at maintaining the relationship between a Job Title and its corresponding Dates even when the text extraction is messy.

---

## 🚀 LLM CONVERSION PROMPT (Vision/Image)

> "Analyze the provided image(s) of the resume and convert it into a Markdown file matching this schema.
> 
> ### STRICT RULES:
> 1. **Name Splitting**: You MUST split the full name into `firstName` and `lastName` in the YAML frontmatter.
> 2. **The Bold Rule**: Bold ONLY the job title or degree. The dates and the `|` separator MUST be plain text.
>    - Correct: `**Software Engineer** | Jan 2020 - Present`
> 3. **Date Separator**: Use exactly ` - ` (space, hyphen, space) to separate start and end dates.
> 4. **Spatial Awareness**: Pay close attention to the layout. Dates are often on the right side of the page. Ensure they are correctly paired with the corresponding role.
> 
> ### SCHEMA STRUCTURE:
> (Same as standard schema)
> ..."
