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

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
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
