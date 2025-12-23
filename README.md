# AI Resume & Cover Letter Customizer

A production-ready web application that leverages artificial intelligence to optimize resumes and generate tailored cover letters for specific job postings while maintaining complete truthfulness and professional integrity.

## Overview

The AI Resume & Cover Letter Customizer addresses a critical challenge faced by job seekers: adapting their resumes to match specific job requirements without compromising authenticity. This application employs advanced natural language processing to analyze job descriptions, evaluate resume-job fit, and optimize existing resume content for applicant tracking systems (ATS) while strictly adhering to ethical guidelines that prevent fabrication of skills, experience, or achievements.

## Key Features

### Resume Processing & Analysis

The application accepts resume uploads in PDF and DOCX formats, utilizing AI-powered parsing to extract structured information including professional summary, skills, work experience, projects, and education. The parsing service handles various resume layouts and formats with high accuracy, converting unstructured document content into a standardized JSON schema that enables downstream analysis and customization.

### Job Description Intelligence

When users provide a job description, the system performs comprehensive analysis to identify required skills, preferred qualifications, key responsibilities, important keywords, and desired soft skills. This analysis forms the foundation for matching algorithms and customization strategies, ensuring that resume optimizations align precisely with employer expectations.

### Match Scoring Algorithm

The matching engine calculates a multi-dimensional fit score between the resume and job description, evaluating skill overlap (percentage of required skills present in the resume), experience relevance (alignment between work history and job responsibilities), and keyword alignment (presence of critical terms). These individual scores combine into an overall match percentage that provides candidates with realistic expectations about their competitiveness for the position.

### AI-Powered Customization with Ethical Safeguards

The customization engine operates under strict ethical constraints designed to maintain truthfulness. The system **never** invents skills, fabricates metrics, exaggerates experience, or adds technologies not mentioned in the original resume. Instead, it optimizes wording to incorporate job description language, emphasizes relevant existing experience, and improves clarity and impact of current statements. Each modification includes an explanation of the reasoning behind the change.

### Cover Letter Generation

The application generates job-specific cover letters using only information present in the resume and job description. Cover letters follow professional formatting standards with three to four concise paragraphs that express interest in the role, connect relevant experiences to job requirements, and conclude with appropriate calls to action.

### File Generation & Download

Users receive their customized materials in both PDF and DOCX formats. PDF files are optimized for printing and final submission, while DOCX files allow for further manual editing. The system applies ATS-safe formatting principles, avoiding tables, graphics, and complex layouts that might confuse automated resume screening systems.

## Architecture

### Technology Stack

The application is built on a modern full-stack architecture:

**Frontend**: React 19 with TypeScript provides a type-safe, component-based user interface. Tailwind CSS 4 enables rapid styling with a professional design system. The wizard-based interface guides users through a five-step process with clear progress indicators and validation.

**Backend**: Express 4 serves as the HTTP framework, with tRPC 11 providing end-to-end type safety between client and server. Drizzle ORM manages database interactions with MySQL/TiDB. Superjson enables seamless serialization of complex data types including dates and custom objects.

**AI Services**: The application integrates with language models for resume parsing, job analysis, semantic matching, content customization, and cover letter generation. All AI interactions include structured output schemas to ensure consistent, predictable responses.

**File Processing**: The pdf-parse library extracts text from PDF documents, while mammoth handles DOCX files. PDFKit and the docx library generate output files in their respective formats.

**Storage**: Amazon S3 provides scalable object storage for uploaded resumes and generated files, with URLs stored in the database for retrieval.

### Database Schema

The schema consists of four primary tables:

**users**: Stores authentication information and user profiles, integrated with Manus OAuth for secure login.

**resumes**: Contains uploaded resume files (stored in S3) and their parsed JSON content, enabling quick access to structured resume data without re-parsing.

**jobDescriptions**: Holds job posting text along with AI-generated analysis results, allowing users to reuse job analyses across multiple resume customizations.

**customizations**: Links resumes to job descriptions and stores match scores, customized resume content, cover letters, explanations, and URLs to generated files.

### AI Safety Implementation

The system enforces truthfulness through multiple layers:

**Prompt Engineering**: System prompts for the customization service explicitly prohibit skill fabrication, metric invention, and experience exaggeration. Instructions emphasize preservation of company names, role titles, and project scope.

**Structured Output**: JSON schemas constrain AI responses to include only allowed fields, preventing unstructured additions that might contain fabricated content.

**Explanation Requirements**: Every change must include a reason, creating accountability and allowing users to verify that modifications align with the original content.

**Skill Gap Transparency**: Missing skills are clearly identified in the analysis but never added to the customized resume, maintaining honesty about candidate qualifications.

## User Workflow

The application guides users through a streamlined five-step process:

**Step 1 - Upload Resume**: Users select a PDF or DOCX file (maximum 10MB). The system uploads the file to S3, extracts text content, and invokes AI parsing to generate structured JSON. Users see a summary of parsed information including skill count, number of positions, projects, and education entries.

**Step 2 - Job Description**: Users paste the full job description text and optionally provide company name and role title. The AI analyzes the posting to extract requirements, keywords, and responsibilities.

**Step 3 - Match Analysis**: The system automatically calculates match scores and displays overall fit percentage along with detailed breakdowns for skill overlap, experience relevance, and keyword alignment. Strengths and skill gaps are presented in clearly labeled sections.

**Step 4 - Resume Preview**: Users review the customized resume with a diff view showing original text (highlighted in red with strikethrough) and revised text (highlighted in green). Each change includes an explanation. Tabs allow switching between the resume, cover letter, and detailed explanations of the optimization strategy.

**Step 5 - Download**: Users generate and download PDF and DOCX files for both the resume and cover letter. Files are named according to company and role for easy organization.

## Setup Instructions

### Prerequisites

The application requires Node.js 22.x, pnpm package manager, and access to a MySQL or TiDB database. Environment variables must be configured for database connection, OAuth credentials, JWT secrets, and S3 storage.

### Installation

Clone the repository and install dependencies:

```bash
pnpm install
```

### Database Setup

Push the database schema to create required tables:

```bash
pnpm db:push
```

### Development

Start the development server:

```bash
pnpm dev
```

The application runs on `http://localhost:3000` with hot module reloading enabled for both frontend and backend code.

### Testing

Run the test suite to verify functionality:

```bash
pnpm test
```

Tests cover authentication, resume operations, job description management, and customization workflows.

### Production Build

Build the application for production deployment:

```bash
pnpm build
pnpm start
```

## AI Safety Rules

The application operates under non-negotiable ethical guidelines:

### Prohibited Actions

- **No Skill Fabrication**: The system never adds skills, tools, or technologies not mentioned in the original resume.
- **No Metric Invention**: Numbers, percentages, and quantitative achievements are preserved exactly as stated or omitted if not present.
- **No Experience Exaggeration**: Job titles, company names, project scope, and responsibilities remain unchanged.
- **No Fake Credentials**: Education, certifications, and qualifications are never invented or embellished.

### Permitted Optimizations

- **Wording Refinement**: Bullet points can be rephrased to use job description terminology while maintaining factual accuracy.
- **Emphasis Adjustment**: Relevant experiences can be highlighted or reordered to appear more prominently.
- **Clarity Improvement**: Vague or unclear statements can be made more specific using information already present in the resume.
- **ATS Optimization**: Language can be adjusted to include keywords that improve compatibility with automated screening systems.

### Validation Mechanisms

Before final output, the system validates that no hallucinated content has been introduced, role titles and company names match the original, metrics are unchanged, and formatting follows ATS-safe principles. Any violations trigger regeneration with stricter constraints.

## API Structure

The application exposes tRPC procedures organized into logical routers:

### Authentication Router

- `auth.me`: Returns current user information
- `auth.logout`: Clears session cookie and logs out user

### Resume Router

- `resume.upload`: Accepts base64-encoded file, uploads to S3, parses content
- `resume.list`: Returns all resumes for authenticated user
- `resume.get`: Retrieves specific resume by ID

### Job Router

- `job.create`: Analyzes job description and stores results
- `job.list`: Returns all job descriptions for authenticated user
- `job.get`: Retrieves specific job description by ID

### Customization Router

- `customization.create`: Generates match score, customized resume, and cover letter
- `customization.generateFiles`: Creates PDF and DOCX files for download
- `customization.list`: Returns all customizations for authenticated user
- `customization.get`: Retrieves specific customization by ID
- `customization.getByResumeAndJob`: Finds existing customization for resume-job pair

## File Generation Details

### PDF Generation

PDFKit creates PDF documents with professional typography using Helvetica font family. Resumes follow a structured layout with bold section headings, clear hierarchy, and consistent spacing. Cover letters use a simpler format with appropriate margins for business correspondence.

### DOCX Generation

The docx library generates Word-compatible files with proper heading levels, paragraph spacing, and text formatting. Documents use standard styles that are compatible with most word processors and maintain ATS-safe plain text structure.

### Naming Convention

Generated files follow a consistent naming pattern:

- `Resume_{Company}_{Role}_{Timestamp}.pdf`
- `Resume_{Company}_{Role}_{Timestamp}.docx`
- `CoverLetter_{Company}_{Role}_{Timestamp}.pdf`
- `CoverLetter_{Company}_{Role}_{Timestamp}.docx`

Company and role names are sanitized to remove special characters, and timestamps prevent filename collisions.

## Security Considerations

User authentication is handled through Manus OAuth, with session cookies signed using JWT secrets. All file uploads are validated for type and size before processing. Database queries use parameterized statements through Drizzle ORM to prevent SQL injection. S3 storage uses unique keys with random suffixes to prevent enumeration attacks.

## Performance Optimization

The application employs several strategies to maintain responsiveness:

- **Lazy Loading**: Database connections are established only when needed
- **Caching**: Parsed resume content is stored to avoid re-parsing
- **Streaming**: Large file operations use streams to minimize memory usage
- **Parallel Processing**: File generation for PDF and DOCX formats occurs concurrently

## Future Enhancements

Potential improvements include support for additional file formats, multi-language resume processing, integration with job board APIs for automatic job description retrieval, resume version history and comparison, collaborative editing features for career coaches, and analytics dashboards showing application success rates.

## License

This project is licensed under the MIT License.

## Support

For questions, issues, or feature requests, please visit the project repository or contact the development team.

---

**Built with Manus AI** - Demonstrating responsible AI application development with strict ethical guidelines and production-ready architecture.
