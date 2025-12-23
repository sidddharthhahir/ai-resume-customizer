# Project TODO

## Backend Features
- [x] Database schema for resumes, job descriptions, customizations, and match scores
- [x] Resume upload and parsing service (PDF/DOCX support)
- [x] AI-based resume extraction to structured JSON
- [x] Job description analysis service
- [x] Resume-job matching algorithm with scoring
- [x] AI-powered resume customization with truthfulness enforcement
- [x] Cover letter generation service
- [x] Explanation layer for changes
- [x] PDF generation service
- [x] DOCX generation service
- [x] File download endpoints
- [x] S3 storage integration for uploaded resumes

## Frontend Features
- [x] Professional UI design with color scheme and typography
- [x] Step 1: Resume upload interface
- [x] Step 2: Job description input interface
- [x] Step 3: Match score and skill gap analysis display
- [x] Step 4: Customized resume preview with diff view
- [x] Step 5: Cover letter preview
- [x] Step 6: Download buttons for PDF and DOCX files
- [x] Wizard navigation and progress indicator
- [x] Loading states for AI processing
- [x] Error handling and validation

## AI Safety & Quality
- [x] Enforce no skill fabrication rule
- [x] Enforce no metric fabrication rule
- [x] Enforce no experience fabrication rule
- [x] ATS-safe formatting validation
- [x] Quality check before output

## Documentation
- [x] README with architecture overview
- [x] Setup instructions
- [x] AI safety rules documentation

## Upgrade: Photo Support
- [x] Database schema update for photo storage
- [x] Photo upload endpoint with validation
- [x] Photo validation (face visible, neutral background, size)
- [x] Photo embedding in PDF resume
- [x] Photo embedding in DOCX resume
- [x] Photo opt-in UI in wizard
- [x] Ensure cover letter never includes photo

## Upgrade: Resume Quality Improvements
- [x] Implement Action→Technology→Impact formula
- [x] Upgrade resume customization prompts
- [x] Improve bullet point clarity and impact
- [x] Ensure all changes maintain truthfulness

## Upgrade: Cover Letter Quality
- [x] Improve cover letter generation prompts
- [x] Add company-specific reasoning
- [x] Add role-specific motivation
- [x] Ensure human, confident tone
- [x] Add strong call-to-action

## Feature: Resume Templates
- [x] Design template system (Modern, Classic, Technical, Creative, Minimal)
- [x] Create template definitions with styling rules
- [x] Update database schema for template selection
- [x] Create template selection UI component
- [x] Update PDF generator for template support
- [x] Update DOCX generator for template support
- [x] Integrate template selection into wizard
- [x] Ensure all templates are ATS-safe
