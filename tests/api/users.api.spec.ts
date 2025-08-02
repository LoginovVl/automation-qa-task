import { test, expect } from '@playwright/test';
import { getApiClient } from '../../api/apiClient';
import { APIRequestContext } from '@playwright/test';


test.describe('Auth API - /auth', () => {
  let apiClient: APIRequestContext;

  test.beforeAll(async () => {
    apiClient = await getApiClient();
  });

  test('Check successfull authenticate with valid credentials', async () => {
    const response = await apiClient.post('/auth', {
      data: {
        username: 'admin',
        password: 'password123'
      }
    });

    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body).toHaveProperty('token');
    expect(typeof body.token).toBe('string');
  });

  test('Check valid error handlig with invalid credentials', async () => {
    const response = await apiClient.post('/auth', {
      data: {
        username: 'admin',
        password: 'wrongpassword'
      }
    });

    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body).not.toHaveProperty('token');
    expect(body).toEqual({ reason: 'Bad credentials' });
  });

  test('Check valid error handlig with empty values', async () => {
    const response = await apiClient.post('/auth', {
      data: {
        username: '',
        password: ''
      }
    });

    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body).not.toHaveProperty('token');
    expect(body).toEqual({ reason: 'Bad credentials' });
  });
});
