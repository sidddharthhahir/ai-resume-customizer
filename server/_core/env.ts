export const ENV = {
  cookieSecret: process.env.JWT_SECRET ?? "change-me-in-production",
  databaseUrl: process.env.DATABASE_URL ?? "",
  llmApiKey: process.env.LLM_API_KEY ?? "",
  llmProvider: process.env.LLM_PROVIDER ?? "gemini",
  llmModel: process.env.LLM_MODEL ?? "",
  llmBaseUrl: process.env.LLM_BASE_URL ?? "",
  storageDir: process.env.STORAGE_DIR ?? "./uploads",
  isProduction: process.env.NODE_ENV === "production",
  port: parseInt(process.env.PORT || "3000"),
};
