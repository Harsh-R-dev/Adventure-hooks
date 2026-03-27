/**
 * AUTH ROUTES TESTS
 * POST /api/v1/user/signup
 * POST /api/v1/user/login
 */

import { describe, test, expect, beforeAll } from '@jest/globals';
import request from 'supertest';
import app from '../app.js';

// Unique email per test run to avoid duplicate conflicts
const testEmail = `testuser_${Date.now()}@test.com`;
const testPassword = 'Test@1234!';
let authToken;

// ─── SIGNUP ────────────────────────────────────────────────

describe('POST /api/v1/user/signup', () => {
  test('should create a new user and return a JWT token', async () => {
    const res = await request(app)
      .post('/api/v1/user/signup')
      .send({
        name: `testuser_${Date.now()}`,
        email: testEmail,
        password: testPassword,
        passwordconfirm: testPassword,
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.status).toBe('success');
    expect(res.body.token).toBeDefined();
    expect(res.body.data.user.email).toBe(testEmail);
    // password must NOT be returned
    expect(res.body.data.user.password).toBeUndefined();

    authToken = res.body.token;
  });

  test('should return 400 if email is missing', async () => {
    const res = await request(app)
      .post('/api/v1/user/signup')
      .send({
        name: 'NoEmail',
        password: testPassword,
        passwordconfirm: testPassword,
      });

    expect(res.statusCode).toBe(400);
  });

  test('should return error if passwords do not match', async () => {
    const res = await request(app)
      .post('/api/v1/user/signup')
      .send({
        name: `mismatch_${Date.now()}`,
        email: `mismatch_${Date.now()}@test.com`,
        password: testPassword,
        passwordconfirm: 'WrongPassword!99',
      });

    expect(res.statusCode).toBeGreaterThanOrEqual(400);
  });

  test('should reject duplicate email', async () => {
    const res = await request(app)
      .post('/api/v1/user/signup')
      .send({
        name: `duplicate_${Date.now()}`,
        email: testEmail, // same email already registered
        password: testPassword,
        passwordconfirm: testPassword,
      });

    expect(res.statusCode).toBeGreaterThanOrEqual(400);
  });

  test('should default role to "user" (not allow arbitrary roles)', async () => {
    const res = await request(app)
      .post('/api/v1/user/signup')
      .send({
        name: `roletest_${Date.now()}`,
        email: `roletest_${Date.now()}@test.com`,
        password: testPassword,
        passwordconfirm: testPassword,
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.data.user.role).toBe('user');
  });
});

// ─── LOGIN ─────────────────────────────────────────────────

describe('POST /api/v1/user/login', () => {
  test('should login with correct credentials and return a token', async () => {
    const res = await request(app)
      .post('/api/v1/user/login')
      .send({ email: testEmail, password: testPassword });

    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('success');
    expect(res.body.token).toBeDefined();
  });

  test('should return 401 for wrong password', async () => {
    const res = await request(app)
      .post('/api/v1/user/login')
      .send({ email: testEmail, password: 'WrongPass!99' });

    expect(res.statusCode).toBe(401);
    expect(res.body.status).toBe('fail');
  });

  test('should return 401 for non-existent email', async () => {
    const res = await request(app)
      .post('/api/v1/user/login')
      .send({ email: 'nobody@nowhere.com', password: testPassword });

    expect(res.statusCode).toBe(401);
  });

  test('should return 400 if email or password is missing', async () => {
    const res = await request(app)
      .post('/api/v1/user/login')
      .send({ email: testEmail });

    expect(res.statusCode).toBe(400);
  });
});
