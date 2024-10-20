import request from 'supertest';
import app from '../app';
import { connectDB, closeDB } from './db/testDatabase';
import { redisClient } from '../config/redis.config';


jest.mock('../config/redis.config', () => {
  const mRedisClient = {
    set: jest.fn(),
    get: jest.fn(),
    del: jest.fn(),
    quit: jest.fn(),
  };
  return { redisClient: mRedisClient };
});

beforeAll(async () => {
  await connectDB();
});

afterAll(async () => {
  await closeDB();
  await redisClient.quit(); 
});

describe('Auth API', () => {
  it('should sign up a new user', async () => {
    const res = await request(app).post('/api/v1/auth/create-user').send({
      firstName: 'Precious',
      lastName: 'Agamuyi',
      email: 'testUser@gmail.com',
      password: 'Password123@',
      role: 'admin',
    });

    console.log('Register Response:', res.body);

    if (res.statusCode !== 201) {
      console.error('Error registering user:', res.body);
    }

    expect(res.statusCode).toBe(201);
  });

  it('should login a user', async () => {
    const res = await request(app).post('/api/v1/auth/login').send({
      email: 'testUser@gmail.com',
      password: 'Password123@',
    });

    console.log('Login Response:', res.body);

    if (res.statusCode !== 200) {
      console.error('Error logging in:', res.body);
    }

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('token');
  });

  it('should fail login with invalid credentials', async () => {
    const res = await request(app).post('/api/v1/auth/login').send({
      email: 'testUser@gmail.com',
      password: 'wrongPassword',
    });

    expect(res.statusCode).toBe(400);
    expect(res.body.status).toBe('error');
    expect(res.body.message).toBe('Invalid credentials');
  });
});
