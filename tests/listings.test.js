import request from 'supertest';
import app from '../src/app.js';

describe('Listings Endpoints', () => {
  let agentToken;
  let listingId;

  beforeAll(async () => {
    const agentRes = await request(app)
      .post('/api/auth/signup')
      .send({
        name: 'Test Agent',
        email: `agent${Date.now()}@gmail.com`,
        password: '123456',
        role: 'agent',
      });

    agentToken = agentRes.body.token;
  });

  describe('POST /api/listings', () => {
    it('should create a listing as agent', async () => {
      const response = await request(app)
        .post('/api/listings')
        .set('Authorization', `Bearer ${agentToken}`)
        .send({
          title: 'Test Property Listing',
          description: 'A beautiful test property for testing purposes',
          price: 5000000,
          location: 'Test Location',
          city: 'Bangalore',
          state: 'Karnataka',
          type: 'sale',
          category: 'apartment',
          bedrooms: 2,
          bathrooms: 2,
          area: 1000,
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('listing');
      listingId = response.body.listing.id;
    });

    it('should fail without authentication', async () => {
      const response = await request(app)
        .post('/api/listings')
        .send({ title: 'Test' });

      expect(response.status).toBe(401);
    });
  });

  describe('GET /api/listings', () => {
    it('should get all listings', async () => {
      const response = await request(app).get('/api/listings');
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('listings');
      expect(Array.isArray(response.body.listings)).toBe(true);
    });

    it('should filter by city', async () => {
      const response = await request(app)
        .get('/api/listings?city=Bangalore');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('listings');
    });
  });

  describe('GET /api/listings/:id', () => {
    it('should get listing by id', async () => {
      if (!listingId) return;

      const response = await request(app)
        .get(`/api/listings/${listingId}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('listing');
    });

    it('should return 404 for non-existent listing', async () => {
      const response = await request(app)
        .get('/api/listings/99999');

      expect(response.status).toBe(404);
    });
  });
});