jest.mock('../src/services/imageService/imageProcessor.service', () => ({
    cropImage: jest.fn().mockResolvedValue(Buffer.from('mocked-image-buffer'))
}))

import * as imageProcessor from '../src/services/imageService/imageProcessor.service'
import request from 'supertest'
import app from '../src/app'
import path from 'path'
import { imageMimeTypes } from '../src/config/mimeTypes'

const imageCropURL = '/api/crop'
const testImagePath = path.resolve(__dirname, './test-images/sample_image_1.jpg')
const base64MockedImageBuffer = Buffer.from('mocked-image-buffer').toString('base64');

describe('Image Crop Functionality', () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    describe('Successful Cropping', () => {
        it('should crop given image and return the original and cropped version', async () => {
            const response = await request(app)
                .post(imageCropURL)
                .field('width', 500)
                .field('height', 200)
                .attach('files', testImagePath)

            expect(response.status).toBe(200)

            expect(response.body).toHaveProperty('files')
            expect(response.body.files).toHaveProperty('original')
            expect(response.body.files).toHaveProperty('cropped')
            expect(response.body.files.cropped).toBe(base64MockedImageBuffer)

            expect(imageProcessor.cropImage).toHaveBeenCalledTimes(1)
        })
    })
    describe('Validation Errors', () => {
        it('Should return 400 if no file is uploaded', async () => {
            const response = await request(app)
                .post(imageCropURL)
                .field('width', 500)
                .field('height', 200)

            expect(response.status).toBe(400)
            expect(response.body).toHaveProperty('error', 'No file was uploaded')
            expect(imageProcessor.cropImage).not.toHaveBeenCalled()
        })

        it('Should return 400 if the uploaded file is not an image', async () => {
            const invalidFilePath = path.resolve(__dirname, './test-files/sample_text.txt');

            const response = await request(app)
                .post(imageCropURL)
                .field('width', 500)
                .field('height', 200)
                .attach('files', invalidFilePath)

            expect(response.status).toBe(400)
            expect(response.body).toHaveProperty('error', `Invalid file type. Only ${imageMimeTypes.join(', ')} are allowed`)
            expect(imageProcessor.cropImage).not.toHaveBeenCalled()
        })

        it('Should return 400 if the width field is missing', async () => {
            const response = await request(app)
                .post(imageCropURL)
                .field('height', 200)
                .attach('files', testImagePath);

            expect(response.status).toBe(400);
            expect(response.body).toHaveProperty('error', 'Validation Error: Width and height are required and must be valid numbers');
            expect(imageProcessor.cropImage).not.toHaveBeenCalled();
        })

        it('Should return 400 if the height field is missing', async () => {
            const response = await request(app)
                .post(imageCropURL)
                .field('width', 500)
                .attach('files', testImagePath);

            expect(response.status).toBe(400);
            expect(response.body).toHaveProperty('error', 'Validation Error: Width and height are required and must be valid numbers');
            expect(imageProcessor.cropImage).not.toHaveBeenCalled();
        })

        it('Should return 400 if the width or height field are non numbers', async () => {
            const response = await request(app)
                .post(imageCropURL)
                .field('width', 'abc')
                .field('height', 'abc')
                .attach('files', testImagePath);

            expect(response.status).toBe(400);
            expect(response.body).toHaveProperty('error', 'Validation Error: Width and height are required and must be valid numbers');
            expect(imageProcessor.cropImage).not.toHaveBeenCalled();
        })

        it('Should return 400 if the top or left field are non numbers', async () => {
            const response = await request(app)
                .post(imageCropURL)
                .field('width', '500')
                .field('height', '200')
                .field('top', 'abc')
                .field('left', 'abc')
                .attach('files', testImagePath);

            expect(response.status).toBe(400);
            expect(response.body).toHaveProperty('error', 'Validation Error: Left and top must be valid numbers');
            expect(imageProcessor.cropImage).not.toHaveBeenCalled();
        })

        it('Should return 400 if the width field exceeds the image original dimentions', async () => {
            const response = await request(app)
                .post(imageCropURL)
                .field('width', '5000')
                .field('height', '200')
                .attach('files', testImagePath);

            expect(response.status).toBe(400);
            expect(response.body).toHaveProperty('error', 'Validation Error: Crop dimensions exceed image size');
            expect(imageProcessor.cropImage).not.toHaveBeenCalled();
        })

        it('Should return 400 if the height field exceeds the image original dimentions', async () => {
            const response = await request(app)
                .post(imageCropURL)
                .field('width', '500')
                .field('height', '2000')
                .attach('files', testImagePath);

            expect(response.status).toBe(400);
            expect(response.body).toHaveProperty('error', 'Validation Error: Crop dimensions exceed image size');
            expect(imageProcessor.cropImage).not.toHaveBeenCalled();
        })
    })
    describe('Server Errors', () => {
        it('Should return 500 if an error occurs during image crop', async () => {
            (imageProcessor.cropImage as jest.Mock).mockRejectedValue(new Error('Failed to crop the image'));

            const response = await request(app)
                .post(imageCropURL)
                .field('width', 500)
                .field('height', 200)
                .attach('files', testImagePath)

            expect(response.status).toBe(500)
            expect(response.body.error).toBe('Failed to crop the image')

            expect(imageProcessor.cropImage).toHaveBeenCalledTimes(1)
        })
    })
})