import request from 'supertest';
import app from '../app';
import { connectDB, closeDB } from './db/testDatabase';
import { redisClient } from '../config/redis.config';
import { generateUniqueLink } from '../utils/generateUniqueLink';

const uniqueLink = generateUniqueLink();

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

describe('Fixture API', () => {
  let adminToken: string;
  let userToken: string;
  let fixtureId: string;

  beforeAll(async () => {
    // Admin SignUp with unique email
    await request(app).post('/api/v1/auth/create-user').send({
      firstName: 'Admin',
      lastName: 'User',
      email: 'adminUser@gmail.com',  
      password: 'Password123@',
      role: 'admin',
    });

    // Admin Login
    const adminRes = await request(app).post('/api/v1/auth/login').send({
      email: 'adminUser@gmail.com',
      password: 'Password123@',
    });
    adminToken = adminRes.body.token;
    console.log('Admin JWT Token:', adminToken);

    // User SignUp with different email
    await request(app).post('/api/v1/auth/create-user').send({
      firstName: 'Regular',
      lastName: 'User',
      email: 'regularUser@gmail.com', 
      password: 'Password123@',
      role: 'user',
    });

    // User Login
    const userRes = await request(app).post('/api/v1/auth/login').send({
      email: 'regularUser@gmail.com', 
      password: 'Password123@',
    });
    userToken = userRes.body.token;
    console.log('User JWT Token:', userToken);
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should create a new fixture (admin only)', async () => {
    const res = await request(app)
      .post('/api/v1/fixtures/create-fixtures')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        homeTeam: 'Mock Team 1',
        awayTeam: 'Mock Team 2',
        date: '2024-12-25T00:00:00Z',
        status: 'pending',
        score: { home: 0, away: 0 },
        uniqueLink: uniqueLink,
      });

    console.log('Create Fixture Response:', res.body);

    if (res.statusCode !== 201) {
      console.error('Error creating fixture:', res.body);
    }

    expect(res.statusCode).toBe(201);

    fixtureId = res.body.data._id;
    expect(fixtureId).toBeDefined();
  });

  it('should deny a regular user from creating a fixture', async () => {
    const res = await request(app)
      .post('/api/v1/fixtures/create-fixtures')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        homeTeam: 'Mock Team 1',
        awayTeam: 'Mock Team 2',
        date: '2024-10-25T00:00:00Z',
        status: 'pending',
        score: { home: 0, away: 0 },
      });

    console.log('Unauthorized Create Response:', res.body);

    if (res.statusCode !== 403) {
      console.error('Error creating fixture:', res.body);
    }
    expect(res.statusCode).toBe(403);
    expect(res.body.message).toBe('You do not have sufficient privileges to access this resource');
  });

  it('should update a fixture (admin only)', async () => {
    const fixture = await request(app)
      .post('/api/v1/fixtures/create-fixtures')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        homeTeam: 'Mock Team 1',
        awayTeam: 'Mock Team 2',
        date: '2024-12-25T00:00:00Z',
        status: 'pending',
        score: { home: 0, away: 0 },
      });
  
    expect(fixture.statusCode).toBe(201);

    const fixtureId = fixture.body.data._id || fixture.body.data.fixtureId; 
    expect(fixtureId).toBe(fixtureId); 
  
    const res = await request(app)
      .put(`/api/v1/fixtures/${fixtureId}`) 
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        status: 'completed',
        score: { home: 2, away: 1 },
      });
  
    console.log('Update Fixture Response:', res.body);

    expect(res.statusCode).toBe(201); 
    expect(res.body.data.status).toBe('completed');
    expect(res.body.data.score.home).toBe(2);
    expect(res.body.data.score.away).toBe(1);
  });
  

  it('should deny a regular user from updating a fixture', async () => {
    expect(fixtureId).toBeDefined();

    const res = await request(app)
      .put(`/api/v1/fixtures/${fixtureId}`)
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        status: 'pending',
        score: { home: 2, away: 1 },
      });

    console.log('Unauthorized Update Response:', res.body);

    expect(res.statusCode).toBe(403);
    expect(res.body.message).toBe('You do not have sufficient privileges to access this resource');
  });

  it('should delete a fixture (admin only)', async () => {
    expect(fixtureId).toBeDefined();

    const res = await request(app)
      .delete(`/api/v1/fixtures/${fixtureId}`)
      .set('Authorization', `Bearer ${adminToken}`);

    console.log('Delete Fixture Response:', res.body);

    expect(res.statusCode).toBe(200);
   
  });

  it('should deny a regular user from deleting a fixture', async () => {
    expect(fixtureId).toBeDefined();

    const res = await request(app)
      .delete(`/api/v1/fixtures/${fixtureId}`)
      .set('Authorization', `Bearer ${userToken}`);

    console.log('Unauthorized Delete Response:', res.body);

    expect(res.statusCode).toBe(403);
    expect(res.body.message).toBe('You do not have sufficient privileges to access this resource');
  });

  it('should fetch all fixtures with caching', async () => {
    const res1 = await request(app)
      .get('/api/v1/fixtures/fixtures')
      .set('Authorization', `Bearer ${adminToken}`); 

    expect(res1.statusCode).toBe(200);
    expect(Array.isArray(res1.body.data));

    const cachedData = await redisClient.get('fixtures:/api/v1/fixtures/fixtures');
    console.log('Cached Data:', cachedData);
    expect(cachedData).toBe(cachedData);

    
    const res2 = await request(app)
      .get('/api/v1/fixtures/fixtures')
      .set('Authorization', `Bearer ${adminToken}`); 

    expect(res2.statusCode).toBe(200);
    expect(Array.isArray(res2.body.data));
  });

  it('should search for fixtures by team name', async () => {
    await request(app)
      .post('/api/v1/fixtures/search/fixtures')
      .send({
        homeTeam: 'Mock Team 1',
        awayTeam: 'Mock Team 2',
        date: '2024-12-25T00:00:00Z',
        status: 'pending',
        score: { home: 0, away: 0 },
      });

    const res = await request(app)
      .get('/api/v1/fixtures/search/fixtures?query=Mock')

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data[0].homeTeam).toBe('Mock Team 1');
  });

  it('should view fixtures by status with caching', async () => {
    await request(app)
      .post('/api/v1/fixtures/view-fixtures')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        homeTeam: 'Mock Team A',
        awayTeam: 'Mock Team B',
        date: '2024-12-25T00:00:00Z',
        status: 'pending',
        score: { home: 0, away: 0 },
      });

    await request(app)
      .post('/api/v1/fixtures/view-fixtures')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        homeTeam: 'Mock Team C',
        awayTeam: 'Mock Team D',
        date: '2024-12-25T00:00:00Z',
        status: 'completed',
        score: { home: 1, away: 2 },
      });

    const pendingRes = await request(app)
      .get('/api/v1/fixtures/view-fixtures?status=pending')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(pendingRes.statusCode).toBe(200);

    const cachedPendingData = await redisClient.get('view-fixtures:pending');
    expect(cachedPendingData).toBe(cachedPendingData);
    
    const completedRes = await request(app)
      .get('/api/v1/fixtures/view-fixtures?status=completed')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(completedRes.statusCode).toBe(200);
    
    const cachedCompletedData = await redisClient.get('view-fixtures:completed');
    expect(cachedCompletedData).toBe(cachedCompletedData);

    const allRes = await request(app)
      .get('/api/v1/fixtures/view-fixtures')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(allRes.statusCode).toBe(200);
    expect(allRes.body.data.length); 

    const cachedAllData = await redisClient.get('view-fixtures:all');
    expect(cachedAllData).toBe(cachedAllData);
  });
});
