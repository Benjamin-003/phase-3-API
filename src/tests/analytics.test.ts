import request from 'supertest';
import { app } from '../server.js';

describe('Analytics API Endpoints', () => {
  
  describe('GET /api/analytics/department-costs', () => {
    it('should return department cost distribution', async () => {
      const res = await request(app).get('/api/analytics/department-costs');
      
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('data');
      expect(res.body).toHaveProperty('summary');
      
      if (res.body.data.length > 0) {
        const firstDept = res.body.data[0];
        expect(firstDept).toHaveProperty('department');
        expect(firstDept).toHaveProperty('total_cost');
        expect(firstDept).toHaveProperty('cost_percentage');
      }
    });
  });

  describe('GET /api/analytics/tools-by-category', () => {
    it('should return tools grouped by category', async () => {
      const res = await request(app).get('/api/analytics/tools-by-category');
      
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('data');
      expect(res.body).toHaveProperty('insights');
      
      if (res.body.data.length > 0) {
        expect(res.body.data[0]).toHaveProperty('category_name');
        expect(res.body.data[0]).toHaveProperty('average_cost_per_user');
      }
    });
  });

  describe('GET /api/analytics/low-usage-tools', () => {
    it('should return underutilized tools with default threshold', async () => {
      const res = await request(app).get('/api/analytics/low-usage-tools');
      
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('savings_analysis');
      expect(Array.isArray(res.body.data)).toBe(true);
    });

    it('should filter correctly with max_users parameter', async () => {
      const res = await request(app).get('/api/analytics/low-usage-tools?max_users=10');
      expect(res.status).toBe(200);
    });

    it('should return 400 for invalid max_users (not a number)', async () => {
      const res = await request(app).get('/api/analytics/low-usage-tools?max_users=abc');
      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('error');
    });

    it('should return 400 for max_users above allowed range (max 100)', async () => {
      const res = await request(app).get('/api/analytics/low-usage-tools?max_users=200');
      expect(res.status).toBe(400);
    });
  });

  describe('GET /api/analytics/vendor-summary', () => {
    it('should return vendor aggregation and efficiency labels', async () => {
      const res = await request(app).get('/api/analytics/vendor-summary');
      
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('vendor_insights');
      
      if (res.body.data.length > 0) {
        const vendor = res.body.data[0];
        expect(vendor).toHaveProperty('vendor');
        expect(vendor).toHaveProperty('vendor_efficiency');
        expect(['excellent', 'good', 'average', 'poor']).toContain(vendor.vendor_efficiency);
      }
    });
  });
});