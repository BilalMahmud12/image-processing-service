jest.mock('../src/services/imageProcessor', () => ({
    convertToWebP: jest.fn().mockResolvedValue(Buffer.from('mocked-webp-buffer')),
    resizeImage: jest.fn().mockResolvedValue(Buffer.from('mocked-thumbnail-buffer')),
}))

import * as imageProcessor from '../src/services/imageProcessor'
import request from 'supertest'
import app from '../src/app'
import path from 'path'

const imageTransformURL = '/api/transform'
const testImagePath = path.resolve(__dirname, '../test-images/sample_image_1.jpg')

const base64MockedWebpBuffer = Buffer.from('mocked-webp-buffer').toString('base64');
const base64MockedThumbnailBuffer = Buffer.from('mocked-thumbnail-buffer').toString('base64');

describe('Images Transformation Endpoint', () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })
    describe('Successful Transformations', () => {
        it('Should transform and return the WebP image for game type with a thumbnail', async () => {
            const response = await request(app)
                .post(imageTransformURL)
                .field('type', 'game')
                .attach('files', testImagePath)

            expect(response.status).toBe(200)
            
            expect(response.body).toHaveProperty('type', 'game')
            expect(Array.isArray(response.body.files)).toBe(true)
            expect(response.body.files).toHaveLength(1)
            
            const firstFile = response.body.files[0]
            expect(firstFile).toHaveProperty('original')
            expect(firstFile.original).toBe(base64MockedWebpBuffer)
            expect(firstFile.original).toBeTruthy()
            
            expect(firstFile).toHaveProperty('variations')
            expect(firstFile.variations).toHaveProperty('thumbnail')
            expect(firstFile.variations.thumbnail).toBe(base64MockedThumbnailBuffer)
            expect(firstFile.variations.thumbnail).toBeTruthy()

            expect(imageProcessor.convertToWebP).toHaveBeenCalledTimes(1)
            expect(imageProcessor.resizeImage).toHaveBeenCalledTimes(1)
        })

        // Need to reviw this test case
        it('Should transform and return the WebP image for promotion type with a resized image', async () => {
            const response = await request(app)
                .post(imageTransformURL)
                .field('type', 'promotion')
                .attach('files', testImagePath)

            expect(response.status).toBe(200)

            expect(response.body).toHaveProperty('type', 'promotion')
            expect(Array.isArray(response.body.files)).toBe(true)
            expect(response.body.files).toHaveLength(1)

            const firstFile = response.body.files[0]
            expect(firstFile).toHaveProperty('original')
            expect(firstFile.original).toBe(base64MockedWebpBuffer)
            expect(firstFile.original).toBeTruthy()

            expect(firstFile).toHaveProperty('variations')
            expect(firstFile.variations).toHaveProperty('resized')
            expect(firstFile.variations.resized).toBe(base64MockedThumbnailBuffer)
            expect(firstFile.variations.resized).toBeTruthy()

            expect(imageProcessor.convertToWebP).toHaveBeenCalledTimes(1)
            expect(imageProcessor.resizeImage).toHaveBeenCalledTimes(1)
        })

        it('Should support multiple valid image file formats: jpg, png', async () => {
            const jpgImagePath = path.resolve(__dirname, '../test-images/sample_image_1.jpg')
            const pngImagePath = path.resolve(__dirname, '../test-images/sample_image_2.png')

            const response = await request(app)
                .post(imageTransformURL)
                .field('type', 'game')
                .attach('files', jpgImagePath)
                .attach('files', pngImagePath)

            expect(response.status).toBe(200)

            expect(response.body).toHaveProperty('type', 'game')
            expect(Array.isArray(response.body.files)).toBe(true)
            expect(response.body.files).toHaveLength(2)

            const [jpgFile, pngFile] = response.body.files

            // Validate the first file (jpg)
            expect(jpgFile).toHaveProperty('original');
            expect(jpgFile.original).toBe(base64MockedWebpBuffer)
            expect(jpgFile.original).toBeTruthy();

            expect(jpgFile).toHaveProperty('variations');
            expect(jpgFile.variations).toHaveProperty('thumbnail');
            expect(jpgFile.variations.thumbnail).toBe(base64MockedThumbnailBuffer);
            expect(jpgFile.variations.thumbnail).toBeTruthy()

            // Validate the second file (png)
            expect(pngFile).toHaveProperty('original')
            expect(pngFile.original).toBe(base64MockedWebpBuffer)
            expect(pngFile.original).toBeTruthy()

            expect(pngFile).toHaveProperty('variations')
            expect(pngFile.variations).toHaveProperty('thumbnail')
            expect(pngFile.variations.thumbnail).toBe(base64MockedThumbnailBuffer)
            expect(pngFile.variations.thumbnail).toBeTruthy()

            expect(imageProcessor.convertToWebP).toHaveBeenCalledTimes(2)
            expect(imageProcessor.resizeImage).toHaveBeenCalledTimes(2)
        })
    })

    describe('Edge Cases', () => {
        
    })

    describe('Validation Errors', () => {
        it('Should return 400 if no file is uploaded', async () => {
            const response = await request(app)
                .post(imageTransformURL)
                .field('type', 'game');

            expect(response.status).toBe(400);
            expect(response.body).toHaveProperty('error', 'No files uploaded');
            expect(imageProcessor.convertToWebP).not.toHaveBeenCalled();
            expect(imageProcessor.resizeImage).not.toHaveBeenCalled();
        })

        it('Should return 400 if the uploaded file is not an image', async () => {
            const invalidFilePath = path.resolve(__dirname, '../test-files/sample_text.txt');

            const response = await request(app)
                .post(imageTransformURL)
                .field('type', 'game')
                .attach('files', invalidFilePath);

            expect(response.status).toBe(400);
            expect(response.body).toHaveProperty('error', 'Invalid file type. Only JPEG, PNG, and WebP are allowed');
            expect(imageProcessor.convertToWebP).not.toHaveBeenCalled();
            expect(imageProcessor.resizeImage).not.toHaveBeenCalled();
        })

        it('Should return 400 if the type field is missing', async () => {
            const response = await request(app)
                .post(imageTransformURL)
                .attach('files', testImagePath);

            expect(response.status).toBe(400);
            expect(response.body).toHaveProperty('error', 'The "type" field is required');
            expect(imageProcessor.convertToWebP).not.toHaveBeenCalled();
            expect(imageProcessor.resizeImage).not.toHaveBeenCalled();
        })

        it('Should return 400 if the type field is invalid', async () => {
            const response = await request(app)
                .post(imageTransformURL)
                .field('type', 'invalidType')
                .attach('files', testImagePath);

            expect(response.status).toBe(400);
            expect(response.body).toHaveProperty('error', 'The provided image type is invalid');
            expect(imageProcessor.convertToWebP).not.toHaveBeenCalled();
            expect(imageProcessor.resizeImage).not.toHaveBeenCalled();
        })
    })

    describe('Server Errors', () => {
        it('Should return 500 if an error occurs during WebP conversion', async () => {
            (imageProcessor.convertToWebP as jest.Mock).mockRejectedValue(new Error('WebP conversion failed'));

            const response = await request(app)
                .post(imageTransformURL)
                .field('type', 'game')
                .attach('files', testImagePath)

            expect(response.status).toBe(500)
            expect(response.body.error).toBe('WebP conversion failed')

            expect(imageProcessor.convertToWebP).toHaveBeenCalledTimes(1)
            expect(imageProcessor.resizeImage).toHaveBeenCalledTimes(0)
        })

        it('Should return 500 if an error occurs during resizing', async () => {
            (imageProcessor.convertToWebP as jest.Mock).mockResolvedValue(Buffer.from('mocked-webp-buffer'));
            (imageProcessor.resizeImage as jest.Mock).mockRejectedValue(new Error('Image resizing failed'));

            const response = await request(app)
                .post(imageTransformURL)
                .field('type', 'game')
                .attach('files', testImagePath)

            expect(response.status).toBe(500)
            expect(response.body.error).toBe('Image resizing failed')

            expect(imageProcessor.convertToWebP).toHaveBeenCalledTimes(1)
            expect(imageProcessor.resizeImage).toHaveBeenCalledTimes(1)
        })
    })
})