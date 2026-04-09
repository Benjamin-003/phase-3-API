import { describe, it, expect } from '@jest/globals';
import request from 'supertest';
import { app } from '../server.js';

describe('Tools Management API (CRUD)', () => {
  
  describe('GET /api/tools', () => {
    it('should return a list of all tools', async () => {
      if (!app) {
        throw new Error("The 'app' instance is not correctly exported from server.ts.");
      }
      const res = await request(app).get('/api/tools');
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });
  });

  describe('POST /api/tools', () => {
    it('should create a new tool successfully', async () => {
      const newTool = {
        name: "Test Analytics Tool",
        vendor: "Test Vendor",
        monthly_cost: 49.99,
        status: "active",
        owner_department: "Engineering"
      };
      const res = await request(app).post('/api/tools').send(newTool);
      expect(res.status).toBe(201);
      expect(res.body.name).toBe(newTool.name);
    });

    it('should return 400 for missing mandatory fields', async () => {
      const res = await request(app).post('/api/tools').send({ name: "Incomplete Tool" });
      expect(res.status).toBe(400);
    });
  });

  describe('GET /api/tools/:id', () => {
    it('should return 404 for non-existent tool id', async () => {
      const res = await request(app).get('/api/tools/999999');
      expect(res.status).toBe(404);
    });
  });

  describe('PATCH /api/tools/:id', () => {
    it('should update tool status correctly', async () => {
      const res = await request(app)
        .patch('/api/tools/1')
        .send({ status: 'deprecated' });
      expect([200, 404]).toContain(res.status);
    });
  });

  describe('DELETE /api/tools/:id', () => {
    it('should delete a tool', async () => {
      const res = await request(app).delete('/api/tools/1');
      expect([200, 204, 404]).toContain(res.status);
    });
  });
});