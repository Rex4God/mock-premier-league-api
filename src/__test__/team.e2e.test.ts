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

describe('Team API', () => {
  let adminToken: string;
  let userToken: string;
  let teamId: string;

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

  //Admin Only Tests 

  it('should allow an admin to create a new team', async () => {
    const res = await request(app)
      .post('/api/v1/teams/create-teams')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        teamName: 'Mock Team',
        stadium: 'Mock Stadium',
        createdBy: "671430a1a98459617df6a1f4",
        createdOn: new Date()
      });

    expect(res.statusCode).toBe(201); 
    expect(res.body.data.teamName).toBe('Mock Team');
    expect(res.body.data.stadium).toBe('Mock Stadium');
    teamId = res.body.data._id; 
  });

  it('should prevent a non-admin from creating a new team', async () => {
    const res = await request(app)
      .post('/api/v1/teams/create-teams')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        teamName: 'Mock Team',
        stadium: 'Mock Stadium',
        createdBy: "671430a1a98459617df6a1f4",
        createdOn: new Date()
      });

    expect(res.statusCode).toBe(403); 
    expect(res.body.message).toBe('You do not have sufficient privileges to access this resource');
  });

  it('should allow an admin to update a team', async () => {
    const res = await request(app)
      .put(`/api/v1/teams/${teamId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ stadium: 'Updated Stadium' });

    expect(res.statusCode).toBe(200); 
    expect(res.body.data.stadium).toBe('Updated Stadium');
  });

  it('should prevent a non-admin from updating a team', async () => {
    const res = await request(app)
      .put(`/api/v1/teams/${teamId}`)
      .set('Authorization', `Bearer ${userToken}`)
      .send({ stadium: 'Unauthorized Update' });

    expect(res.statusCode).toBe(403); 
    expect(res.body.message).toBe('You do not have sufficient privileges to access this resource');
  });

  it('should allow an admin to delete a team', async () => {
    const res = await request(app)
      .delete(`/api/v1/teams/${teamId}`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.statusCode).toBe(200); 
    expect(res.body.data._id).toBe(teamId); 
  });

  it('should prevent a non-admin from deleting a team', async () => {
    const res = await request(app)
      .delete(`/api/v1/teams/${teamId}`)
      .set('Authorization', `Bearer ${userToken}`);

    expect(res.statusCode).toBe(403); 
    expect(res.body.message).toBe('You do not have sufficient privileges to access this resource');
  });

  //Authenticated (Admin & User) Tests 

  it('should allow both admin and users to view teams', async () => {
    // View as admin
    const adminRes = await request(app)
      .get('/api/v1/teams/views')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(adminRes.statusCode).toBe(200);
    expect(Array.isArray(adminRes.body.paginateData))

    // View as normal user
    const userRes = await request(app)
      .get('/api/v1/teams/views')
      .set('Authorization', `Bearer ${userToken}`);

    expect(userRes.statusCode).toBe(200);
    expect(Array.isArray(userRes.body.paginateData))
  });

  it('should prevent unauthenticated users from viewing teams', async () => {
    const res = await request(app).get('/api/v1/teams/views');
    expect(res.statusCode).toBe(401); 
  });

  //Public Tests (No Authentication Required) 

  it('should allow public access to search teams', async () => {
    const res = await request(app).get('/api/v1/teams/search/teams?query=Mock');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  // Test pagination for viewing teams
  it('should paginate teams correctly', async () => {
    const res = await request(app)
      .get('/api/v1/teams/views?page=1&limit=2')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.currentPage)
    expect(res.body.totalPages)
    expect(Array.isArray(res.body.paginateData)).toBe(true);
  });
});
