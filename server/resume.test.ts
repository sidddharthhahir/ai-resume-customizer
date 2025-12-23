import { describe, expect, it } from 'vitest';
import { appRouter } from './routers';
import type { TrpcContext } from './_core/context';

type AuthenticatedUser = NonNullable<TrpcContext['user']>;

function createAuthContext(): TrpcContext {
  const user: AuthenticatedUser = {
    id: 1,
    openId: 'test-user',
    email: 'test@example.com',
    name: 'Test User',
    loginMethod: 'manus',
    role: 'user',
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  return {
    user,
    req: {
      protocol: 'https',
      headers: {},
    } as TrpcContext['req'],
    res: {} as TrpcContext['res'],
  };
}

describe('Resume Operations', () => {
  it('should list user resumes', async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const resumes = await caller.resume.list();
    
    expect(Array.isArray(resumes)).toBe(true);
  });

  it('should require authentication for resume operations', async () => {
    const ctx: TrpcContext = {
      user: null,
      req: {
        protocol: 'https',
        headers: {},
      } as TrpcContext['req'],
      res: {} as TrpcContext['res'],
    };
    
    const caller = appRouter.createCaller(ctx);

    await expect(caller.resume.list()).rejects.toThrow();
  });
});

describe('Job Description Operations', () => {
  it('should list user job descriptions', async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const jobs = await caller.job.list();
    
    expect(Array.isArray(jobs)).toBe(true);
  });

  it('should require authentication for job operations', async () => {
    const ctx: TrpcContext = {
      user: null,
      req: {
        protocol: 'https',
        headers: {},
      } as TrpcContext['req'],
      res: {} as TrpcContext['res'],
    };
    
    const caller = appRouter.createCaller(ctx);

    await expect(caller.job.list()).rejects.toThrow();
  });
});

describe('Customization Operations', () => {
  it('should list user customizations', async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const customizations = await caller.customization.list();
    
    expect(Array.isArray(customizations)).toBe(true);
  });

  it('should require authentication for customization operations', async () => {
    const ctx: TrpcContext = {
      user: null,
      req: {
        protocol: 'https',
        headers: {},
      } as TrpcContext['req'],
      res: {} as TrpcContext['res'],
    };
    
    const caller = appRouter.createCaller(ctx);

    await expect(caller.customization.list()).rejects.toThrow();
  });
});
