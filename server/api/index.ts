import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createApp } from '../src/app.js';

let appPromise: ReturnType<typeof createApp> | undefined;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  appPromise ??= createApp();
  const app = await appPromise;
  app.getHttpAdapter().getInstance()(req, res);
}
