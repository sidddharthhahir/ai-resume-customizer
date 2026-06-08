import { eq, and, desc } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { 
  InsertUser, 
  users, 
  resumes, 
  jobDescriptions, 
  customizations,
  InsertResume,
  InsertJobDescription,
  InsertCustomization,
  Resume,
  JobDescription,
  Customization
} from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function createUser(user: InsertUser): Promise<{ id: number }> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(users).values(user);
  const insertedId = Number(result[0].insertId);
  return { id: insertedId };
}

export async function getUserById(id: number) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getUserByEmail(email: string) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(users).where(eq(users.email, email)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function createNewUser(data: { email: string; passwordHash: string; name: string }) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(users).values({
    email: data.email,
    passwordHash: data.passwordHash,
    name: data.name,
    role: "user",
    createdAt: new Date(),
    updatedAt: new Date(),
  } as any);
  
  const insertedId = Number(result[0].insertId);
  return getUserById(insertedId);
}

export async function updateUserLastSignedIn(userId: number): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(users).set({ lastSignedIn: new Date() }).where(eq(users.id, userId));
}

// Resume operations
export async function createResume(resume: InsertResume): Promise<Resume> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(resumes).values(resume);
  const insertedId = Number(result[0].insertId);
  
  const inserted = await db.select().from(resumes).where(eq(resumes.id, insertedId)).limit(1);
  if (!inserted[0]) throw new Error("Failed to retrieve inserted resume");
  
  return inserted[0];
}

export async function getResumeById(id: number): Promise<Resume | undefined> {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(resumes).where(eq(resumes.id, id)).limit(1);
  return result[0];
}

export async function getUserResumes(userId: number): Promise<Resume[]> {
  const db = await getDb();
  if (!db) return [];

  return db.select().from(resumes).where(eq(resumes.userId, userId)).orderBy(desc(resumes.createdAt));
}

// Job description operations
export async function createJobDescription(job: InsertJobDescription): Promise<JobDescription> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(jobDescriptions).values(job);
  const insertedId = Number(result[0].insertId);
  
  const inserted = await db.select().from(jobDescriptions).where(eq(jobDescriptions.id, insertedId)).limit(1);
  if (!inserted[0]) throw new Error("Failed to retrieve inserted job description");
  
  return inserted[0];
}

export async function getJobDescriptionById(id: number): Promise<JobDescription | undefined> {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(jobDescriptions).where(eq(jobDescriptions.id, id)).limit(1);
  return result[0];
}

export async function getUserJobDescriptions(userId: number): Promise<JobDescription[]> {
  const db = await getDb();
  if (!db) return [];

  return db.select().from(jobDescriptions).where(eq(jobDescriptions.userId, userId)).orderBy(desc(jobDescriptions.createdAt));
}

// Customization operations
export async function createCustomization(customization: InsertCustomization): Promise<Customization> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(customizations).values(customization);
  const insertedId = Number(result[0].insertId);
  
  const inserted = await db.select().from(customizations).where(eq(customizations.id, insertedId)).limit(1);
  if (!inserted[0]) throw new Error("Failed to retrieve inserted customization");
  
  return inserted[0];
}

export async function getCustomizationById(id: number): Promise<Customization | undefined> {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(customizations).where(eq(customizations.id, id)).limit(1);
  return result[0];
}

export async function getUserCustomizations(userId: number): Promise<Customization[]> {
  const db = await getDb();
  if (!db) return [];

  return db.select().from(customizations).where(eq(customizations.userId, userId)).orderBy(desc(customizations.createdAt));
}

export async function getCustomizationByResumeAndJob(
  resumeId: number, 
  jobId: number
): Promise<Customization | undefined> {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db
    .select()
    .from(customizations)
    .where(and(eq(customizations.resumeId, resumeId), eq(customizations.jobId, jobId)))
    .orderBy(desc(customizations.createdAt))
    .limit(1);
  
  return result[0];
}

export async function updateCustomizationFiles(
  id: number,
  files: {
    resumePdfUrl?: string;
    resumeDocxUrl?: string;
    coverLetterPdfUrl?: string;
    coverLetterDocxUrl?: string;
  }
): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(customizations).set(files).where(eq(customizations.id, id));
}



