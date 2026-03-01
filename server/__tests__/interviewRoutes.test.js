const request = require('supertest');
const app = require('../server');
const mongoose = require('mongoose');

describe('Interview routes', () => {
    afterAll(async () => {
        await mongoose.connection.close();
    });

    it('starts an interview successfully', async () => {
        const res = await request(app)
            .post('/api/interview/start')
            .send({
                avatar: { name: 'Alex' },
                role: 'Technical Interviewer'
            });

        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty('message');
        expect(res.body).toHaveProperty('sessionId');
        expect(res.body.message).toContain('Alex');
    });

    it('fails to start without avatar', async () => {
        const res = await request(app)
            .post('/api/interview/start')
            .send({
                role: 'Technical Interviewer'
            });

        expect(res.statusCode).toEqual(400);
        expect(res.body).toHaveProperty('error', 'Avatar and role are required');
    });

    it('chats during interview successfully', async () => {
        const res = await request(app)
            .post('/api/interview/chat')
            .send({
                message: 'My background is in React development.',
                avatar: { name: 'Alex' },
                role: 'Technical Interviewer',
                questionCount: 1
            });

        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty('response');
        expect(res.body).toHaveProperty('isComplete', false);
    });

    it('completes interview after 5 questions', async () => {
        const res = await request(app)
            .post('/api/interview/chat')
            .send({
                message: 'My answer to the 5th question.',
                avatar: { name: 'Alex' },
                role: 'Technical Interviewer',
                questionCount: 5
            });

        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty('isComplete', true);
    });
});
