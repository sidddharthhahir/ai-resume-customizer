# AI Resume Customizer — Self-Hosted Edition
A self-hosted web app that customizes resumes and cover letters for specific roles while preserving factual accuracy.

## Project Overview
AI Resume Customizer helps job seekers tailor resumes to job descriptions without fabricating skills or experience. It supports resume upload, match analysis, AI-guided customization, and exportable final documents.

## Key Features
- Email/password authentication
- Resume upload and parsing (PDF/DOCX)
- Job description analysis and match scoring
- AI-generated resume customization with truthfulness constraints
- AI-generated, job-specific cover letters
- ATS-focused optimization checks
- Export to PDF and DOCX
- Configurable LLM provider (Gemini/OpenAI/Anthropic/OpenAI-compatible)
- Local file storage for self-hosted deployments

## Tech Stack
- Frontend: React 19, TypeScript, Tailwind CSS 4, Vite
- Backend: Node.js, Express 4, tRPC 11
- Database: MySQL 8+, Drizzle ORM
- Auth: JWT (`jose`), `bcryptjs`
- File handling: `pdf-parse`, `mammoth`, `pdfkit`, `docx`

## Setup & Run
### Prerequisites
- Node.js 20+
- MySQL 8+
- pnpm (or npm)
- (Optional) Docker + Docker Compose

### Local Development
1. Install dependencies:
   ```bash
   pnpm install
   ```
2. Create environment file:
   ```bash
   cp .env.example .env
   ```
3. Configure `.env` (database, JWT secret, LLM provider/API key).
4. Push schema:
   ```bash
   pnpm db:push
   ```
5. Start app:
   ```bash
   pnpm dev
   ```

### Docker Run
1. Configure `.env` from `.env.example`.
2. Start services:
   ```bash
   docker-compose up -d
   ```
3. Open `http://localhost:3000`.

## Usage
1. Sign up or log in.
2. Upload a resume (PDF/DOCX).
3. Paste a job description.
4. Review match score and customized output.
5. Download resume and cover letter in PDF/DOCX.

## Project Structure
```text
client/      React frontend
server/      Express + tRPC backend
drizzle/     Database schema/migration assets
shared/      Shared constants and types
config/      App-level configuration
```

## Contributing
Contributions are welcome. Open an issue for discussion, then submit a focused pull request.

## License / Contact
Licensed under MIT. For support, questions, or feature requests, use the repository issues/discussions.
