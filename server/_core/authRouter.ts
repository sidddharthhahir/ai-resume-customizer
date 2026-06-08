import { z } from "zod";
import { publicProcedure, router } from "./trpc";
import { createUser, getUserByEmail, updateUserLastSignedIn } from "../db";
import { ENV } from "./env";
import { SignJWT } from "jose";
import bcryptjs from "bcryptjs";
import { COOKIE_NAME } from "../../shared/const";

const signupSchema = z.object({
  email: z.string().email("Invalid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  name: z.string().min(1, "Name is required"),
});

const loginSchema = z.object({
  email: z.string().email("Invalid email"),
  password: z.string().min(1, "Password is required"),
});

async function createSessionToken(userId: number): Promise<string> {
  const secret = new TextEncoder().encode(ENV.cookieSecret);
  const token = await new SignJWT({ userId })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("30d")
    .sign(secret);
  return token;
}

export const authRouter = router({
  signup: publicProcedure
    .input(signupSchema)
    .mutation(async ({ ctx, input }) => {
      // Check if user already exists
      const existingUser = await getUserByEmail(input.email);
      if (existingUser) {
        throw new Error("Email already registered");
      }

      // Hash password
      const passwordHash = await bcryptjs.hash(input.password, 10);

      // Create user
      const result = await createUser({
        email: input.email,
        passwordHash,
        name: input.name,
      });

      // Create session token
      const token = await createSessionToken(result.id);

      // Set cookie
      ctx.res.setHeader("Set-Cookie", `${COOKIE_NAME}=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${30 * 24 * 60 * 60}`);

      return {
        success: true,
        userId: result.id,
      };
    }),

  login: publicProcedure
    .input(loginSchema)
    .mutation(async ({ ctx, input }) => {
      // Find user
      const user = await getUserByEmail(input.email);
      if (!user) {
        throw new Error("Invalid email or password");
      }

      // Verify password
      const passwordMatch = await bcryptjs.compare(input.password, user.passwordHash);
      if (!passwordMatch) {
        throw new Error("Invalid email or password");
      }

      // Update last signed in
      await updateUserLastSignedIn(user.id);

      // Create session token
      const token = await createSessionToken(user.id);

      // Set cookie
      ctx.res.setHeader("Set-Cookie", `${COOKIE_NAME}=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${30 * 24 * 60 * 60}`);

      return {
        success: true,
        userId: user.id,
      };
    }),

  logout: publicProcedure.mutation(({ ctx }) => {
    ctx.res.setHeader("Set-Cookie", `${COOKIE_NAME}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`);
    return { success: true };
  }),

  me: publicProcedure.query(({ ctx }) => {
    return {
      user: ctx.user,
    };
  }),
});
