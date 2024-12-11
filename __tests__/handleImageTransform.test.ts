import request from 'supertest'
import app from '../src/app'
import path from 'path'

describe('Images Transformation Endpoint', () => {
    const testImagePath = path.resolve(__dirname, './test-images/sample_image_1.jpg')
    // it('returns success for testing transform endpoint', async () => {
    //     const response = await (request(app)).post('/api/transform')

    //     expect(response.status).toBe(200);
    //     expect(response.body.status).toBe('Success')
    // })

    describe('Successful Transformations', () => {
        it('Should transform and return the WebP image for game type with a thumbnail', async () => {
            //
        })

        it('Should transform and return the WebP image for promotion type with a resized image', async () => {
            //
        })

        it('Should support multiple valid image file formats: jpg, png', async () => {
            //
        })
    })

    describe('Edge Cases', () => {

    })

    describe('Validation Errors', () => {
        it('Should return 400 if no file is uploaded', async () => {
            //
        })

        it('Should return 400 if the uploaded file is not an image', async () => {
            //
        })

        it('Should return 400 if the type field is missing', async () => {
            //
        })

        it('Should return 400 if the type field is invalid', async () => {
            //
        })
    })

    describe('Server Errors', () => {
        it('Should return 500 if an error occurs during WebP conversion', async () => {
            jest.mock('../src/services/imageProcessor', () => ({
                convertToWebP: jest.fn().mockRejectedValue(new Error('WebP conversion failed'))
            }))

            const response = await request(app)
                .post('/api/transform')
                .field('type', 'game')
                .attach('file', testImagePath)

            expect(response.status).toBe(500)
            expect(response.body.error).toBe('Internal Server Error')
        })

        it('Should return 500 if an error occurs during resizing', async () => {
            //
        })
    })
})