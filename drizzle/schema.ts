import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, json } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 */
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Stores uploaded resumes with parsed content
 */
export const resumes = mysqlTable("resumes", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  originalFileName: varchar("originalFileName", { length: 255 }).notNull(),
  fileUrl: text("fileUrl").notNull(), // S3 URL
  fileKey: text("fileKey").notNull(), // S3 key
  parsedContent: json("parsedContent").$type<ParsedResume>().notNull(), // Structured JSON
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Resume = typeof resumes.$inferSelect;
export type InsertResume = typeof resumes.$inferInsert;

/**
 * Stores job descriptions and analysis
 */
export const jobDescriptions = mysqlTable("jobDescriptions", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  companyName: varchar("companyName", { length: 255 }),
  roleName: varchar("roleName", { length: 255 }),
  description: text("description").notNull(),
  analysis: json("analysis").$type<JobAnalysis>(), // Extracted requirements
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type JobDescription = typeof jobDescriptions.$inferSelect;
export type InsertJobDescription = typeof jobDescriptions.$inferInsert;

/**
 * Stores customization results linking resume + job
 */
export const customizations = mysqlTable("customizations", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  resumeId: int("resumeId").notNull(),
  jobId: int("jobId").notNull(),
  matchScore: json("matchScore").$type<MatchScore>().notNull(),
  customizedResume: json("customizedResume").$type<CustomizedResume>().notNull(),
  coverLetter: text("coverLetter").notNull(),
  explanation: json("explanation").$type<Explanation>().notNull(),
  resumePdfUrl: text("resumePdfUrl"), // Generated PDF URL
  resumeDocxUrl: text("resumeDocxUrl"), // Generated DOCX URL
  coverLetterPdfUrl: text("coverLetterPdfUrl"),
  coverLetterDocxUrl: text("coverLetterDocxUrl"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Customization = typeof customizations.$inferSelect;
export type InsertCustomization = typeof customizations.$inferInsert;

// Type definitions for JSON fields
export interface ParsedResume {
  summary: string;
  skills: string[];
  experience: Array<{
    company: string;
    role: string;
    duration?: string;
    bullets: string[];
  }>;
  projects: Array<{
    name: string;
    description: string;
    technologies?: string[];
  }>;
  education: Array<{
    institution: string;
    degree: string;
    field?: string;
    year?: string;
  }>;
}

export interface JobAnalysis {
  requiredSkills: string[];
  niceToHaveSkills: string[];
  responsibilities: string[];
  keywords: string[];
  softSkills: string[];
}

export interface MatchScore {
  overallMatch: number; // 0-100
  strengths: string[];
  gaps: string[];
  skillOverlap: number;
  experienceRelevance: number;
  keywordAlignment: number;
}

export interface CustomizedResume {
  summary: {
    original: string;
    revised: string;
    reason: string;
  };
  experience: Array<{
    company: string;
    role: string;
    duration?: string;
    bullets: Array<{
      original: string;
      revised: string;
      reason: string;
    }>;
  }>;
  skills: string[]; // Preserved from original
  projects: Array<{
    name: string;
    description: string;
    technologies?: string[];
  }>; // Preserved from original
  education: Array<{
    institution: string;
    degree: string;
    field?: string;
    year?: string;
  }>; // Preserved from original
}

export interface Explanation {
  skillEmphasis: string[];
  wordingChanges: string[];
  atsImprovements: string[];
}
