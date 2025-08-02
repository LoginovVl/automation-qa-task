import { request, APIRequestContext } from '@playwright/test';
import dotenv from 'dotenv';

dotenv.config();

let apiContext: APIRequestContext;

export async function getApiClient(): Promise<APIRequestContext> {
  if (!apiContext) {
    apiContext = await request.newContext({
      baseURL: process.env.API_BASE_URL,
      extraHTTPHeaders: {
        'Content-Type': 'application/json',
      },
    });
  }
  return apiContext;
}
