'use strict';

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



  describe('V1 (Unauthenticated API) Routes', () => {

    let itemId;
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
  
    test('POST /api/v1/:model adds an item to the DB and returns an object with the added item', async () => {
      const response = await request.post('/api/v1/food').send({
        name: 'food',
        calories: '9001',
        type: 'protein',
      });
  
      expect(response.status).toEqual(201);
      expect(response.body.name).toEqual('food');
      expect(response.body.calories).toEqual('9001');
      expect(response.body.type).toEqual('protein');
  
      itemId = response.body.id;
    });
  
    test('GET /api/v1/:model returns a list of :model items', async () => {
      const response = await request.get('/api/v1/food');
  
      expect(response.status).toEqual(200);
      expect(response.body).toBeTruthy();
    });
  
    test('GET /api/v1/:model/ID returns a single item by ID', async () => {
      const response = await request.get(`/api/v1/food/${itemId}`);
  
      expect(response.status).toEqual(200);
    });
  
    test('PUT /api/v1/:model/ID returns a single, updated item by ID', async () => {
      const response = await request.put(`/api/v1/food/${itemId}`).send({
        name: 'updatedFood',
        calories: '5000',
        type: 'vegetable',
      });
  
      expect(response.status).toEqual(200);
      expect(response.body.name).toEqual('updatedFood');
      expect(response.body.calories).toEqual('5000');
      expect(response.body.type).toEqual('vegetable');
    });
  
    test('DELETE /api/v1/:model/ID returns an empty object. Subsequent GET for the same ID should result in nothing found', async () => {
      let response = await request.delete(`/api/v1/food/${itemId}`);
  
      expect(response.status).toEqual(204);
  
      response = await request.delete(`/api/v1/food/${itemId}`);
      expect(response.status).toEqual(404);
    });
  });
  
  describe('V2 (Authenticated API) Routes', () => {
    let itemId;
    // let TOKEN = "eyJ hbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6ImphZGFhbjk2NiIsImlhdCI6MTY4ODM3MzIzMX0.fNnXz8lFItFSI9RYN5XHNmzGj6MA--46WvZaq6hwBko"

    test('POST /api/v2/:model with a bearer token that has create permissions adds an item to the DB and returns an object with the added item', async () => {
      const response = await request
        .post('/api/v2/food')
        .send({
          name: 'food',
          calories: '9001',
          type: 'protein',
        })
        .set('Authorization', `Bearer ${TOKEN}`);
  
      expect(response.status).toEqual(201);
      expect(response.body.name).toEqual('food');
      expect(response.body.calories).toEqual('9001');
      expect(response.body.type).toEqual('protein');
  
      itemId = response.body.id;
    });
  
    test('GET /api/v2/:model with a bearer token that has read permissions returns a list of :model items', async () => {
      const response = await request.get('/api/v2/food').set('Authorization', `Basic amFkYWFuOTY2OjEyMzEyMw==`);
  
      expect(response.status).toEqual(200);
      expect(Array.isArray(response.body)).toBeTruthy();
    });
  
    test('GET /api/v2/:model/ID with a bearer token that has read permissions returns a single item by ID', async () => {
      const response = await request.get(`/api/v2/food/${itemId}`).set('Authorization', `Basic amFkYWFuOTY2OjEyMzEyMw==`);
  
      expect(response.status).toEqual(200);
      expect(response.body).toHaveProperty('id', itemId);
    });
  
    test('PUT /api/v2/:model/ID with a bearer token that has update permissions returns a single, updated item by ID', async () => {
      const response = await request
        .put(`/api/v2/food/${itemId}`)
        .send({
          name: 'updatedFood',
          calories: '5000',
          type: 'fruit',
        })
        .set('Authorization', `Bearer ${TOKEN}`);
  
      expect(response.status).toEqual(200);
      expect(response.body).toHaveProperty('id', itemId);
      expect(response.body.name).toEqual('updatedFood');
      expect(response.body.calories).toEqual('5000');
      expect(response.body.type).toEqual('fruit');
    });
  
    test('DELETE /api/v2/:model/ID with a bearer token that has delete permissions returns an empty object. Subsequent GET for the same ID should result in nothing found', async () => {
      let response = await request.delete(`/api/v2/food/${itemId}`).set('Authorization', `Bearer ${TOKEN}`);
  
      expect(response.status).toEqual(204);
      expect(response.body).toEqual({});
       response = await request.delete(`/api/v2/food/${itemId}`).set('Authorization', `Bearer ${TOKEN}`);

      expect(response.status).toEqual(404);
    });
  });