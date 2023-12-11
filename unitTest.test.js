const request = require('supertest');
const app = require('./app'); 

describe('POST /signup', () => {
  test('It should respond with 200 status for successful user signup', async () => {
    const newUser = {
      username: 'testuser',
      email: 'test@example.com',
      password: 'password123'
    };

    const response = await request(app).post('/signup').send(newUser);
    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual({ message: "User inserted successfully" });
  });

  test('It should handle errors and respond with 500 status for a failed signup', async () => {
    
    const incompleteUser = {
      username: 'testuser',
      email: 'test@example.com'
      
    };

    const response = await request(app).post('/signup').send(incompleteUser);
    expect(response.statusCode).toBe(500);
  });
});
