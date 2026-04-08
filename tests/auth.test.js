import request from 'supertest';
import app from '../src/app.js';

describe('Authentication Endpoints', () => {
  const testUser = {
    name: 'Test User',
    email: `test${Date.now()}@gmail.com`,
    password: '123456',
    role: 'buyer',
  };

  let authToken;

  describe('POST /api/auth/signup', () => {
    it('should register a new user', async () => {
      const response = await request(app)
        .post('/api/auth/signup')
        .send(testUser);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('message', 'User registered successfully');
      expect(response.body.user).toHaveProperty('email', testUser.email);
      expect(response.body).toHaveProperty('token');
    });

    it('should not register duplicate email', async () => {
      const response = await request(app)
        .post('/api/auth/signup')
        .send(testUser);

      expect(response.status).toBe(409);
      expect(response.body).toHaveProperty('error');
    });

    it('should fail with missing fields', async () => {
      const response = await request(app)
        .post('/api/auth/signup')
        .send({ email: 'test@gmail.com' });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error', 'Validation failed');
    });
  });

  describe('POST /api/auth/signin', () => {
    it('should login successfully', async () => {
      const response = await request(app)
        .post('/api/auth/signin')
        .send({
          email: testUser.email,
          password: testUser.password,
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('token');
      authToken = response.body.token;
    });

    it('should fail with wrong password', async () => {
      const response = await request(app)
        .post('/api/auth/signin')
        .send({
          email: testUser.email,
          password: 'wrongpassword',
        });

      expect(response.status).toBe(401);
    });
  });

  describe('GET /api/auth/me', () => {
    it('should get current user with valid token', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('user');
    });

    it('should fail without token', async () => {
      const response = await request(app).get('/api/auth/me');
      expect(response.status).toBe(401);
    });
  });

  describe('POST /api/auth/signout', () => {
    it('should signout successfully', async () => {
      const response = await request(app)
        .post('/api/auth/signout');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message', 'Signed out successfully');
    });
  });
});