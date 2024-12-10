import request from 'supertest';
import app from '../src/app';

describe('Images Transformation', () => {
    it('returns success for testing transform endpoint', async () => {
        const response = await (request(app)).post('/api/transform')

        expect(response.status).toBe(200);
        expect(response.body.status).toBe('Success')
    })
})