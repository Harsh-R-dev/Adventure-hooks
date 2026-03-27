/**
 * TOUR ROUTES TESTS
 * GET    /api/v1/tours
 * GET    /api/v1/tours/:id
 * POST   /api/v1/tours
 * PATCH  /api/v1/tours/:id
 * DELETE /api/v1/tours/:id
 * GET    /api/v1/tours/top-5-cheap
 * GET    /api/v1/tours/tour-stats
 */

import { describe, test, expect, beforeAll } from '@jest/globals';
import request from 'supertest';
import app from '../app.js';

let adminToken;
let createdTourId;

const adminCredentials = {
  email: process.env.TEST_ADMIN_EMAIL || 'admin@test.com',
  password: process.env.TEST_ADMIN_PASSWORD || 'Admin@1234!',
};

const sampleTour = {
  name: 'Test Ocean Trail',
  duration: 7,
  maxGroupSize: 15,
  difficulty: 'easy',
  price: 299,
  summary: 'A beautiful ocean trail adventure',
  description: 'Explore the breathtaking coastline on this guided 7-day ocean trail experience.',
  imageCover: 'ocean-trail.jpg',
};

// ─── SETUP: login as admin before all tour tests ───────────

beforeAll(async () => {
  // Try to login; if user doesn't exist, sign up first
  let res = await request(app)
    .post('/api/v1/user/login')
    .send(adminCredentials);

  if (res.statusCode !== 200) {
    res = await request(app)
      .post('/api/v1/user/signup')
      .send({
        name: 'Test Admin',
        email: adminCredentials.email,
        password: adminCredentials.password,
        passwordconfirm: adminCredentials.password,
        role: 'admin',
      });
  }

  adminToken = res.body.token;
});

// ─── GET ALL TOURS (public) ────────────────────────────────

describe('GET /api/v1/tours', () => {
  test('should return all tours without authentication', async () => {
    const res = await request(app).get('/api/v1/tours');

    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('success');
    expect(Array.isArray(res.body.data.tours)).toBe(true);
    expect(typeof res.body.result).toBe('number');
  });

  test('should support filtering by difficulty', async () => {
    const res = await request(app).get('/api/v1/tours?difficulty=easy');

    expect(res.statusCode).toBe(200);
    res.body.data.tours.forEach((tour) => {
      expect(tour.difficulty).toBe('easy');
    });
  });

  test('should support sorting by price ascending', async () => {
    const res = await request(app).get('/api/v1/tours?sort=price');

    expect(res.statusCode).toBe(200);
    const prices = res.body.data.tours.map((t) => t.price);
    for (let i = 1; i < prices.length; i++) {
      expect(prices[i]).toBeGreaterThanOrEqual(prices[i - 1]);
    }
  });

  test('should support pagination (limit + page)', async () => {
    const res = await request(app).get('/api/v1/tours?limit=2&page=1');

    expect(res.statusCode).toBe(200);
    expect(res.body.data.tours.length).toBeLessThanOrEqual(2);
  });

  test('should support price range filtering (gte/lte)', async () => {
    const res = await request(app).get('/api/v1/tours?price[gte]=100&price[lte]=500');

    expect(res.statusCode).toBe(200);
    res.body.data.tours.forEach((tour) => {
      expect(tour.price).toBeGreaterThanOrEqual(100);
      expect(tour.price).toBeLessThanOrEqual(500);
    });
  });

  test('should support field limiting', async () => {
    const res = await request(app).get('/api/v1/tours?fields=name,price');

    expect(res.statusCode).toBe(200);
    if (res.body.data.tours.length > 0) {
      const tour = res.body.data.tours[0];
      expect(tour.name).toBeDefined();
      expect(tour.price).toBeDefined();
      // fields not requested should be absent
      expect(tour.description).toBeUndefined();
    }
  });
});

// ─── GET TOP 5 CHEAP ──────────────────────────────────────

describe('GET /api/v1/tours/top-5-cheap', () => {
  test('should return at most 5 tours', async () => {
    const res = await request(app).get('/api/v1/tours/top-5-cheap');

    expect(res.statusCode).toBe(200);
    expect(res.body.data.tours.length).toBeLessThanOrEqual(5);
  });
});

// ─── GET TOUR STATS ───────────────────────────────────────

describe('GET /api/v1/tours/tour-stats', () => {
  test('should return aggregated stats grouped by difficulty', async () => {
    const res = await request(app).get('/api/v1/tours/tour-stats');

    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('success');
    expect(Array.isArray(res.body.data.stats)).toBe(true);

    if (res.body.data.stats.length > 0) {
      const stat = res.body.data.stats[0];
      expect(stat.numTours).toBeDefined();
      expect(stat.avgPrice).toBeDefined();
      expect(stat.minPrice).toBeDefined();
      expect(stat.maxPrice).toBeDefined();
    }
  });
});

// ─── CREATE TOUR (protected) ──────────────────────────────

describe('POST /api/v1/tours', () => {
  test('should create a tour when logged in as admin', async () => {
    const res = await request(app)
      .post('/api/v1/tours')
      .set('Authorization', `Bearer ${adminToken}`)
      .send(sampleTour);

    expect(res.statusCode).toBe(201);
    expect(res.body.status).toBe('success');
    expect(res.body.data.tour.name).toBe(sampleTour.name);
    expect(res.body.data.tour._id).toBeDefined();

    createdTourId = res.body.data.tour._id;
  });

  test('should return 401 when creating a tour without auth', async () => {
    const res = await request(app)
      .post('/api/v1/tours')
      .send({ ...sampleTour, name: 'Unauthorized Tour' });

    expect(res.statusCode).toBe(401);
  });

  test('should return 400 for missing required fields', async () => {
    const res = await request(app)
      .post('/api/v1/tours')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: 'Incomplete Tour' }); // missing duration, price, etc.

    expect(res.statusCode).toBeGreaterThanOrEqual(400);
  });

  test('should reject invalid difficulty value', async () => {
    const res = await request(app)
      .post('/api/v1/tours')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ ...sampleTour, name: 'Bad Difficulty Tour', difficulty: 'extreme' });

    expect(res.statusCode).toBeGreaterThanOrEqual(400);
  });

  test('should reject name shorter than 5 characters', async () => {
    const res = await request(app)
      .post('/api/v1/tours')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ ...sampleTour, name: 'Hi' });

    expect(res.statusCode).toBeGreaterThanOrEqual(400);
  });
});

// ─── GET SINGLE TOUR ──────────────────────────────────────

describe('GET /api/v1/tours/:id', () => {
  test('should return a specific tour by ID', async () => {
    if (!createdTourId) return;

    const res = await request(app).get(`/api/v1/tours/${createdTourId}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('success');
    expect(res.body.data.tour._id).toBe(createdTourId);
  });

  test('should return 404 for a non-existent tour ID', async () => {
    const res = await request(app).get('/api/v1/tours/000000000000000000000000');

    expect(res.statusCode).toBe(404);
  });

  test('should return 400/500 for an invalid (malformed) tour ID', async () => {
    const res = await request(app).get('/api/v1/tours/invalid-id');

    expect(res.statusCode).toBeGreaterThanOrEqual(400);
  });
});

// ─── UPDATE TOUR ──────────────────────────────────────────

describe('PATCH /api/v1/tours/:id', () => {
  test('should update a tour price', async () => {
    if (!createdTourId) return;

    const res = await request(app)
      .patch(`/api/v1/tours/${createdTourId}`)
      .send({ price: 399 });

    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('success');
    expect(res.body.data.tour.price).toBe(399);
  });

  test('should return 404 when updating non-existent tour', async () => {
    const res = await request(app)
      .patch('/api/v1/tours/000000000000000000000000')
      .send({ price: 100 });

    expect(res.statusCode).toBe(404);
  });
});

// ─── DELETE TOUR ──────────────────────────────────────────

describe('DELETE /api/v1/tours/:id', () => {
  test('should return 401 when deleting without auth', async () => {
    if (!createdTourId) return;

    const res = await request(app).delete(`/api/v1/tours/${createdTourId}`);

    expect(res.statusCode).toBe(401);
  });

  test('should delete a tour when logged in as admin', async () => {
    if (!createdTourId) return;

    const res = await request(app)
      .delete(`/api/v1/tours/${createdTourId}`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.statusCode).toBe(204);
  });

  test('should return 404 when deleting already deleted tour', async () => {
    if (!createdTourId) return;

    const res = await request(app)
      .delete(`/api/v1/tours/${createdTourId}`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.statusCode).toBe(404);
  });
});

// ─── 404 UNKNOWN ROUTES ───────────────────────────────────

describe('Unknown routes', () => {
  test('should return 404 for unknown endpoints', async () => {
    const res = await request(app).get('/api/v1/unknown-route');

    expect(res.statusCode).toBe(404);
  });
});
