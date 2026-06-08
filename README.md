# AI Resume Customizer — Self-Hosted Edition

A fully self-hosted, AI-powered resume customization platform. Optimize your resume for any job while maintaining complete truthfulness. Zero Manus/Forge dependencies.

## Features

- **Email + Password Authentication** — Simple, secure login without OAuth
- **AI-Powered Resume Customization** — Automatically tailor resumes for specific jobs
- **Multiple Resume Templates** — Professional, Modern, Classic, Technical, Creative, and Minimal layouts
- **Cover Letter Generation** — AI-generated cover letters matched to job descriptions
- **ATS Compatibility Scoring** — Analyze resume compatibility with Applicant Tracking Systems
- **Photo Upload Support** — Include professional photos in resumes
- **Multiple Export Formats** — Download as PDF or DOCX
- **Configurable LLM Provider** — Support for OpenAI, Anthropic, and Gemini (or any OpenAI-compatible API)
- **Local File Storage** — All files stored locally, no cloud dependencies

## Quick Start (Docker)

### Prerequisites

- Docker & Docker Compose
- MySQL 8.0 or compatible database

### Setup

1. **Clone the repository**
   ```bash
   git clone <your-repo>
   cd ai-resume-customizer
   ```

2. **Create `.env` file**
   ```bash
   cp .env.example .env
   ```

3. **Edit `.env` with your configuration**
   ```env
   DATABASE_URL="mysql://root:changeme@db:3306/resume_customizer"
   JWT_SECRET="your-secure-random-secret"
   LLM_PROVIDER="gemini"  # or "openai", "anthropic"
   LLM_API_KEY="your-api-key"
   DB_PASSWORD="your-db-password"
   ```

4. **Start the application**
   ```bash
   docker-compose up -d
   ```

5. **Access the app**
   - Open http://localhost:3000 in your browser
   - Create an account with email + password
   - Start customizing resumes!

## Manual Setup (Local Development)

### Prerequisites

- Node.js 20+
- MySQL 8.0+
- pnpm (or npm)

### Installation

1. **Install dependencies**
   ```bash
   pnpm install
   ```

2. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```

3. **Configure your database and LLM provider in `.env`**

4. **Run database migrations**
   ```bash
   pnpm db:push
   ```

5. **Start development server**
   ```bash
   pnpm dev
   ```

6. **Build for production**
   ```bash
   pnpm build
   pnpm start
   ```

## Configuration

### Master Config File

Edit `config/app.config.ts` to customize:

- **App Branding** — Name, tagline, description
- **Theme** — Colors, default theme (light/dark)
- **LLM Settings** — Temperature, max tokens
- **Resume Templates** — Enable/disable specific templates
- **File Upload Limits** — Max file sizes, allowed types
- **Feature Toggles** — Enable/disable features (ATS scanner, cover letter, etc.)
- **Scoring Weights** — Customize match score calculation
- **Authentication** — Session duration, password requirements

### Environment Variables

```env
# Database Connection
DATABASE_URL="mysql://user:password@host:3306/database"

# Session Management
JWT_SECRET="generate-with: openssl rand -hex 32"

# LLM Configuration
LLM_PROVIDER="gemini"           # "openai" | "anthropic" | "gemini"
LLM_API_KEY="your-api-key"
LLM_MODEL="gemini-2.5-flash"    # Optional: uses provider default if empty
LLM_BASE_URL=""                 # Optional: for self-hosted or proxy endpoints

# File Storage
STORAGE_DIR="./uploads"         # Local directory for file storage

# Server
PORT=3000
NODE_ENV="production"           # "development" | "production"
```

### LLM Provider Setup

#### Google Gemini (Default)
1. Get API key from [Google AI Studio](https://aistudio.google.com/apikey)
2. Set `LLM_PROVIDER=gemini` and `LLM_API_KEY=your-key`

#### OpenAI
1. Get API key from [OpenAI Platform](https://platform.openai.com/api-keys)
2. Set `LLM_PROVIDER=openai` and `LLM_API_KEY=your-key`
3. Optionally set `LLM_MODEL=gpt-4o-mini` (or your preferred model)

#### Anthropic
1. Get API key from [Anthropic Console](https://console.anthropic.com)
2. Set `LLM_PROVIDER=anthropic` and `LLM_API_KEY=your-key`
3. Optionally set `LLM_MODEL=claude-sonnet-4-20250514`

#### Self-Hosted or Proxy
1. Set `LLM_BASE_URL=https://your-proxy.com` (must support OpenAI-compatible API)
2. Set `LLM_PROVIDER=openai` (or any value — base URL takes precedence)
3. Set `LLM_API_KEY=your-api-key`

## Architecture

### Tech Stack

- **Frontend** — React 19 + Tailwind CSS 4 + Vite
- **Backend** — Express 4 + tRPC 11 + Node.js
- **Database** — MySQL 8.0 + Drizzle ORM
- **Authentication** — JWT (jose) + bcryptjs
- **File Processing** — PDF parsing (pdf-parse), DOCX parsing (mammoth)
- **File Generation** — PDF (pdfkit), DOCX (docx)
- **LLM Integration** — Configurable provider (OpenAI-compatible API)

### Project Structure

```
├── client/                    # React frontend
│   ├── src/
│   │   ├── pages/            # Page components
│   │   ├── components/       # Reusable UI components
│   │   ├── contexts/         # React contexts
│   │   ├── hooks/            # Custom hooks
│   │   ├── lib/trpc.ts       # tRPC client setup
│   │   ├── App.tsx           # Main app component
│   │   └── main.tsx          # Entry point
│   └── public/               # Static assets
├── server/                    # Express backend
│   ├── _core/                # Core infrastructure
│   │   ├── index.ts          # Server entry point
│   │   ├── context.ts        # tRPC context (JWT auth)
│   │   ├── authRouter.ts     # Auth procedures (login/signup)
│   │   ├── env.ts            # Environment config
│   │   ├── llm.ts            # LLM integration
│   │   └── trpc.ts           # tRPC router setup
│   ├── services/             # Business logic
│   │   ├── customizer.ts     # Resume customization
│   │   ├── matcher.ts        # Job matching
│   │   ├── fileGenerator.ts  # PDF/DOCX generation
│   │   └── atsScanner.ts     # ATS compatibility analysis
│   ├── db.ts                 # Database helpers
│   └── routers.ts            # tRPC route definitions
├── drizzle/                   # Database schema & migrations
│   └── schema.ts             # Table definitions
├── shared/                    # Shared types & constants
│   ├── const.ts              # Constants
│   └── templates.ts          # Resume template definitions
├── config/                    # Configuration
│   └── app.config.ts         # Master config file
├── Dockerfile                # Docker image
├── docker-compose.yml        # Docker Compose setup
├── .env.example              # Environment template
└── README.md                 # This file
```

## Database Schema

### Users Table
- `id` — Primary key
- `email` — Unique email address
- `passwordHash` — Bcrypt-hashed password
- `name` — User's full name
- `role` — "user" or "admin"
- `createdAt`, `updatedAt`, `lastSignedIn` — Timestamps

### Resumes Table
- `id` — Primary key
- `userId` — Foreign key to users
- `originalFileName` — Original uploaded filename
- `fileUrl`, `fileKey` — Storage reference
- `parsedContent` — Extracted resume data (JSON)
- `createdAt` — Upload timestamp

### Job Descriptions Table
- `id` — Primary key
- `userId` — Foreign key to users
- `companyName`, `roleName` — Job details
- `description` — Full job description
- `analysis` — Extracted requirements (JSON)
- `createdAt` — Creation timestamp

### Customizations Table
- `id` — Primary key
- `userId`, `resumeId`, `jobId` — Foreign keys
- `templateId` — Selected resume template
- `matchScore` — Calculated match metrics (JSON)
- `customizedResume` — Tailored resume content (JSON)
- `coverLetter` — Generated cover letter
- `explanation` — Customization rationale (JSON)
- `photoUrl`, `photoKey` — Profile photo reference
- `resumePdfUrl`, `resumeDocxUrl` — Generated file URLs
- `coverLetterPdfUrl`, `coverLetterDocxUrl` — Generated file URLs
- `createdAt` — Creation timestamp

## API Endpoints

All API calls use tRPC over HTTP POST to `/api/trpc`.

### Authentication
- `auth.signup` — Create new account
- `auth.login` — Sign in with email + password
- `auth.logout` — Clear session
- `auth.me` — Get current user

### Resume Management
- `resume.upload` — Upload resume (PDF/DOCX)
- `resume.list` — Get user's resumes
- `resume.get` — Get resume details

### Job Descriptions
- `job.create` — Add job description
- `job.list` — Get user's job descriptions
- `job.get` — Get job details

### Customization
- `customization.create` — Generate customized resume + cover letter
- `customization.list` — Get user's customizations
- `customization.get` — Get customization details
- `customization.downloadPdf` — Download resume as PDF
- `customization.downloadDocx` — Download resume as DOCX
- `customization.analyzeATS` — Get ATS compatibility score

## Deployment

### Docker Deployment

```bash
# Build and run
docker-compose up -d

# View logs
docker-compose logs -f app

# Stop
docker-compose down
```

### Manual Deployment (e.g., VPS, Heroku, Railway)

1. **Build the application**
   ```bash
   pnpm install
   pnpm build
   ```

2. **Set environment variables** on your hosting platform

3. **Run migrations**
   ```bash
   pnpm db:push
   ```

4. **Start the server**
   ```bash
   pnpm start
   ```

### Production Checklist

- [ ] Set `NODE_ENV=production`
- [ ] Generate strong `JWT_SECRET` (use `openssl rand -hex 32`)
- [ ] Configure MySQL with strong password
- [ ] Set up HTTPS/TLS reverse proxy (nginx, Caddy)
- [ ] Enable CORS appropriately
- [ ] Set up backups for MySQL database
- [ ] Monitor disk space for file uploads
- [ ] Configure log rotation
- [ ] Set up monitoring/alerting

## Development

### Running Tests

```bash
pnpm test
```

### Type Checking

```bash
pnpm check
```

### Code Formatting

```bash
pnpm format
```

### Database Migrations

```bash
# Generate migration from schema changes
pnpm db:push
```

## Troubleshooting

### "Database connection failed"
- Verify `DATABASE_URL` is correct
- Ensure MySQL is running and accessible
- Check database credentials

### "LLM API key invalid"
- Verify API key is correct for chosen provider
- Check that provider is set correctly
- Ensure API key has appropriate permissions

### "File upload fails"
- Check `STORAGE_DIR` exists and is writable
- Verify file size is within limits (10MB for resumes, 5MB for photos)
- Ensure disk space is available

### "Resume parsing fails"
- Verify PDF/DOCX file is not corrupted
- Check file size is within limits
- Try re-uploading the file

## Security Considerations

- **Passwords** — Hashed with bcryptjs (10 rounds)
- **Sessions** — JWT tokens with 30-day expiration
- **File Storage** — Local filesystem (ensure proper permissions)
- **API** — All endpoints require authentication except signup/login
- **HTTPS** — Use reverse proxy with TLS in production
- **Database** — Use strong passwords and restrict network access

## License

MIT

## Support

For issues, questions, or contributions, please refer to the project repository.

---

**Built with ❤️ for self-hosting enthusiasts**
