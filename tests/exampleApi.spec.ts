import { test, expect } from '@playwright/test';
import { ENV } from '../config';
import { onGetMetersData } from '../support/apiFunction';

test.describe('API Test Suite', () => {
  test('POST Login API Test', async () => {
    const requestBody = {
      username: 'arissara',
      password: 'Test@123456789'
    };
    
    const response = await onGetMetersData.callPostLogin(ENV.LOGIN_PATH, requestBody);
    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty('access_token');
  });
});