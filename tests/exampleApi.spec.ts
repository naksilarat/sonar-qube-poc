import { test, expect } from '@playwright/test';
import { ENV } from '../config';
import { onGetMetersData } from '../support/apiFunction';

const dataTest = require ('../public/dataTest.json')
const expectedResults = require ('../public/expectedResults.json')

test.describe.skip('API Test Suite', () => {

  test('POST Login API success when login with valid user', async () => {
    const requestBody = dataTest.usersData.validUser;
    console.log('Request Body:', requestBody);
    const response = await onGetMetersData.callPostLogin(ENV.LOGIN_PATH, requestBody);
    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty('access_token');
  });

  test('POST Login API failed when login with not existing user', async () => {
    const requestBody = dataTest.usersData.invalidUser;
    console.log('Request Body:', requestBody);
    const response = await onGetMetersData.callPostLogin(ENV.LOGIN_PATH, requestBody);
    expect(response.statusCode).toBe(401);
    expect(response.body).toEqual(expectedResults.errors.unauthorized);
  });
});