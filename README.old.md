# AI Resume & Cover Letter Customizer (Legacy Notes)
A production-oriented AI resume and cover-letter customization app focused on truthful, ATS-aware output.

## Project Overview
This README captures the earlier architecture direction of the project and its core behavior: analyze resumes against job descriptions, generate tailored content, and keep all output grounded in existing candidate data.

## Key Features
- Resume parsing from PDF/DOCX into structured data
- Job description requirement extraction
- Multi-factor resume/job match scoring
- Truthfulness-constrained resume rewriting
- Cover letter generation from resume + job description
- Downloadable PDF/DOCX outputs
- Explanation of optimization changes

## Tech Stack
- Frontend: React, TypeScript, Tailwind CSS
- Backend: Express, tRPC, Node.js
- Database: MySQL/TiDB via Drizzle ORM
- Storage: S3-based object storage (legacy setup)
- AI workflow: structured prompt/output pipelines

## Setup & Run
### Prerequisites
- Node.js
- pnpm
- MySQL/TiDB
- Required environment variables for DB, auth, storage, and AI provider

### Basic Steps
1. Install dependencies:
   ```bash
   pnpm install
   ```
2. Configure environment variables.
3. Initialize schema:
   ```bash
   pnpm db:push
   ```
4. Start development server:
   ```bash
   pnpm dev
   ```

## Usage
1. Upload resume.
2. Provide job description.
3. Review match analysis.
4. Inspect AI-customized resume/cover letter.
5. Export final files.

## Project Structure
```text
client/          Frontend app
server/          API and business logic
drizzle/         Schema definitions
shared/          Shared types/constants
```

## Contributing
Use issues for proposals and bug reports. Submit small, focused pull requests.

## License / Contact
MIT License. For support, open an issue in the repository.
