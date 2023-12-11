const supertest = require('supertest');
const app = require('./app');



describe("POST /signup", () => {
    describe("given all the required details", () => {
        test("should respond with a 200 status code", async () => {
            const response = await supertest(app).post('/signup').send({
                 username: 'testUser',
                email: 'test@example.com', 
                password: 'testPassword'
            })
            expect(response.statusCode).toBe(200);
            expect(response.text).toBe('User inserted successfully');
        })
    })
})

