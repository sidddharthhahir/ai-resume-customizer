/**
 * ═══════════════════════════════════════════════════════════
 * AI RESUME CUSTOMIZER — MASTER CONFIGURATION
 * ═══════════════════════════════════════════════════════════
 * 
 * Edit this ONE file to customize the entire app.
 * For secrets (database, API keys), use .env file.
 * For everything else, change values below and rebuild.
 */

const config = {

  // ─── APP BRANDING ─────────────────────────────────
  app: {
    name: 'AI Resume Customizer',
    tagline: 'Optimize your resume for any job with AI',
    description: 'AI-powered resume customization while maintaining complete truthfulness',
  },

  // ─── THEME ────────────────────────────────────────
  theme: {
    primaryColor: '#2563eb',
    primaryHover: '#1d4ed8',
    gradientFrom: '#eff6ff',
    gradientTo: '#eef2ff',
    defaultTheme: 'light' as 'light' | 'dark',
  },

  // ─── LLM SETTINGS ────────────────────────────────
  llm: {
    maxTokens: 32768,
    customizationTemperature: 0.3,
    coverLetterTemperature: 0.5,
    parsingTemperature: 0.1,
  },

  // ─── RESUME TEMPLATES ─────────────────────────────
  templates: {
    modern: true,
    classic: true,
    technical: true,
    creative: true,
    minimal: true,
    'professional-sidebar': true,
  },

  // ─── FILE UPLOAD LIMITS ───────────────────────────
  upload: {
    maxResumeSizeMB: 10,
    maxPhotoSizeMB: 5,
    allowedResumeTypes: ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
    allowedPhotoTypes: ['image/jpeg', 'image/jpg', 'image/png'],
  },

  // ─── FEATURE TOGGLES ─────────────────────────────
  features: {
    atsScanner: true,
    coverLetter: true,
    photoUpload: true,
    downloadDocx: true,
    downloadPdf: true,
    darkMode: true,
    matchScoreDetails: true,
    allowSignup: true,
  },

  // ─── MATCH SCORE WEIGHTS (must sum to 1.0) ────────
  scoring: {
    skillOverlapWeight: 0.40,
    experienceRelevanceWeight: 0.35,
    keywordAlignmentWeight: 0.25,
  },

  // ─── AUTH ─────────────────────────────────────────
  auth: {
    sessionMaxAgeDays: 30,
    minPasswordLength: 6,
  },

  // ─── CUSTOMIZATION AI BEHAVIOR ────────────────────
  customization: {
    extraSystemPrompt: '',
    showOriginalBullets: true,
    maxSkillsDisplay: 20,
  },

} as const;

export default config;
export type AppConfig = typeof config;
