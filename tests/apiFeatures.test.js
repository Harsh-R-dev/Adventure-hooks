/**
 * UNIT TESTS — APIfeatures class
 *
 * These tests mock the Mongoose query object so no DB
 * connection is needed. They verify filtering, sorting,
 * pagination, and field-limiting logic in isolation.
 */

import { jest, describe, test, expect } from '@jest/globals';
import APIfeatures from '../utils/apiFeatures.js';

// ─── MOCK MONGOOSE QUERY ───────────────────────────────────
// Each method returns `this` so chaining works, just like
// a real Mongoose query object.

const buildMockQuery = (overrides = {}) => ({
  find: jest.fn().mockReturnThis(),
  sort: jest.fn().mockReturnThis(),
  select: jest.fn().mockReturnThis(),
  skip: jest.fn().mockReturnThis(),
  limit: jest.fn().mockReturnThis(),
  ...overrides,
});

// ─── FILTER ───────────────────────────────────────────────

describe('APIfeatures.filter()', () => {
  test('should call query.find() with the query object', () => {
    const mockQuery = buildMockQuery();
    const features = new APIfeatures(mockQuery, { difficulty: 'easy' });
    features.filter();

    expect(mockQuery.find).toHaveBeenCalledWith({ difficulty: 'easy' });
  });

  test('should strip pagination/sort/limit/fields from the filter object', () => {
    const mockQuery = buildMockQuery();
    const features = new APIfeatures(mockQuery, {
      difficulty: 'medium',
      page: '2',
      sort: 'price',
      limit: '5',
      fields: 'name',
    });
    features.filter();

    const calledWith = mockQuery.find.mock.calls[0][0];
    expect(calledWith).toEqual({ difficulty: 'medium' });
    expect(calledWith.page).toBeUndefined();
    expect(calledWith.sort).toBeUndefined();
    expect(calledWith.limit).toBeUndefined();
    expect(calledWith.fields).toBeUndefined();
  });

  test('should convert gte/gt/lte/lt operators to MongoDB $ syntax', () => {
    const mockQuery = buildMockQuery();
    const features = new APIfeatures(mockQuery, {
      price: { gte: '100', lte: '500' },
      duration: { gt: '3', lt: '14' },
    });
    features.filter();

    const calledWith = mockQuery.find.mock.calls[0][0];
    expect(calledWith.price).toEqual({ $gte: '100', $lte: '500' });
    expect(calledWith.duration).toEqual({ $gt: '3', $lt: '14' });
  });

  test('should assign the result back to this.query (critical bug fix)', () => {
    const mockQuery = buildMockQuery();
    const features = new APIfeatures(mockQuery, { difficulty: 'easy' });

    // Before the bug fix, this.query was NOT updated — filter was discarded
    features.filter();

    // After fix: this.query must be the return value of find()
    expect(features.query).toBe(mockQuery);
  });
});

// ─── SORT ─────────────────────────────────────────────────

describe('APIfeatures.sort()', () => {
  test('should sort by the provided query string field', () => {
    const mockQuery = buildMockQuery();
    const features = new APIfeatures(mockQuery, { sort: 'price' });
    features.sort();

    expect(mockQuery.sort).toHaveBeenCalledWith('price');
  });

  test('should support multiple sort fields separated by comma', () => {
    const mockQuery = buildMockQuery();
    const features = new APIfeatures(mockQuery, { sort: 'price,-ratingsAverage' });
    features.sort();

    expect(mockQuery.sort).toHaveBeenCalledWith('price -ratingsAverage');
  });

  test('should default to -createdat when no sort is provided', () => {
    const mockQuery = buildMockQuery();
    const features = new APIfeatures(mockQuery, {});
    features.sort();

    // Bug fix: was '-createdAt' (wrong field name) — now '-createdat'
    expect(mockQuery.sort).toHaveBeenCalledWith('-createdat');
  });
});

// ─── FIELD LIMITING ───────────────────────────────────────

describe('APIfeatures.limit()', () => {
  test('should select specified fields when provided', () => {
    const mockQuery = buildMockQuery();
    const features = new APIfeatures(mockQuery, { fields: 'name,price,difficulty' });
    features.limit();

    expect(mockQuery.select).toHaveBeenCalledWith('name price difficulty');
  });

  test('should exclude __v by default when no fields are specified', () => {
    const mockQuery = buildMockQuery();
    const features = new APIfeatures(mockQuery, {});
    features.limit();

    // Bug fix: was '-_v' (wrong) — now '-__v' (correct Mongoose version key)
    expect(mockQuery.select).toHaveBeenCalledWith('-__v');
  });

  test('should NOT use -_v (the old broken value)', () => {
    const mockQuery = buildMockQuery();
    const features = new APIfeatures(mockQuery, {});
    features.limit();

    expect(mockQuery.select).not.toHaveBeenCalledWith('-_v');
  });
});

// ─── PAGINATION ───────────────────────────────────────────

describe('APIfeatures.paginate()', () => {
  test('should apply default limit of 100 and skip 0 on page 1', () => {
    const mockQuery = buildMockQuery();
    const features = new APIfeatures(mockQuery, {});
    features.paginate();

    expect(mockQuery.skip).toHaveBeenCalledWith(0);
    expect(mockQuery.limit).toHaveBeenCalledWith(100);
  });

  test('should skip correctly for page 2 with limit 10', () => {
    const mockQuery = buildMockQuery();
    const features = new APIfeatures(mockQuery, { page: '2', limit: '10' });
    features.paginate();

    // page 2, limit 10 → skip = (2-1) * 10 = 10
    expect(mockQuery.skip).toHaveBeenCalledWith(10);
    expect(mockQuery.limit).toHaveBeenCalledWith(10);
  });

  test('should skip correctly for page 3 with limit 5', () => {
    const mockQuery = buildMockQuery();
    const features = new APIfeatures(mockQuery, { page: '3', limit: '5' });
    features.paginate();

    // page 3, limit 5 → skip = (3-1) * 5 = 10
    expect(mockQuery.skip).toHaveBeenCalledWith(10);
    expect(mockQuery.limit).toHaveBeenCalledWith(5);
  });

  test('should handle page 1 with custom limit', () => {
    const mockQuery = buildMockQuery();
    const features = new APIfeatures(mockQuery, { page: '1', limit: '25' });
    features.paginate();

    expect(mockQuery.skip).toHaveBeenCalledWith(0);
    expect(mockQuery.limit).toHaveBeenCalledWith(25);
  });
});

// ─── CHAINING ─────────────────────────────────────────────

describe('APIfeatures method chaining', () => {
  test('all methods should return the instance (for chaining)', () => {
    const mockQuery = buildMockQuery();
    const features = new APIfeatures(mockQuery, {});

    expect(features.filter()).toBe(features);
    expect(features.sort()).toBe(features);
    expect(features.limit()).toBe(features);
    expect(features.paginate()).toBe(features);
  });

  test('full chain should apply all transformations without throwing', () => {
    const mockQuery = buildMockQuery();
    const features = new APIfeatures(mockQuery, {
      difficulty: 'easy',
      sort: 'price',
      fields: 'name,price',
      page: '1',
      limit: '5',
    });

    expect(() => {
      features.filter().sort().paginate().limit();
    }).not.toThrow();

    expect(mockQuery.find).toHaveBeenCalled();
    expect(mockQuery.sort).toHaveBeenCalledWith('price');
    expect(mockQuery.select).toHaveBeenCalledWith('name price');
    expect(mockQuery.skip).toHaveBeenCalledWith(0);
    expect(mockQuery.limit).toHaveBeenCalledWith(5);
  });
});
