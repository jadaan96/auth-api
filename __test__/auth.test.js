const { server } = require('../src/server');
const { db } = require('../src/auth/models/index');
const supertest = require('supertest');

const request = supertest(server);

let TOKEN;


beforeAll(async () => {
  await db.sync();
});

afterAll(async () => {
  await db.drop();
});


describe('Auth Routes', () => {
    test('POST /signup creates a new user and sends an object with the user and the token to the client', async () => {
      const response = await request.post('/signup').send({
        username: 'jadaan966',
        password: '123123',
        role: 'admin',
      });
  
      expect(response.status).toEqual(201);
      expect(response.body).toHaveProperty('user');
      expect(response.body).toHaveProperty('token');
    });
  
    test('POST /signin with basic authentication headers logs in a user and sends an object with the user and the token to the client', async () => {
      const response = await request.post('/signin').set('Authorization', 'Basic amFkYWFuOTY2OjEyMzEyMw==');
  
      expect(response.status).toEqual(200);
      expect(response.body).toHaveProperty('user');
      expect(response.body).toHaveProperty('token');
  
      TOKEN = response.body.token;
    });
  });
  