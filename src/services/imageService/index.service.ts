import type { ImageTypeConfig, ProcessedImage, ProcessImagesResult, CroppedImageResult } from '../../types'
import { ApplicationError } from '../../utils/ApplicationError'
import { convertToWebP, resizeImage, cropImage } from './imageProcessor.service'
import { imageConfig } from '../../config/imageConfig'
import logger from '../../utils/logger'


/**
 * Processes uploaded images for a specific type, generating original and variations.
 * 
 * @param type - The type of image processing (e.g., 'game', 'promotion')
 * @param files - Array of uploaded files (as Multer's File objects)
 * @returns A promise that resolves to the processed images result
 */
export const processImages = async (
    type: string, 
    files: Express.Multer.File[]
): Promise<ProcessImagesResult> => {
    const config = imageConfig[type] as ImageTypeConfig

    if (!config) {
        throw new ApplicationError(`Unsupported image type: ${type}`, 400)
    }

    const processedFiles: ProcessedImage[] = await Promise.all(
        files.map(async (file) => {
            logger.info('start converting file', { file })

            const originalBuffer = await convertToWebP(file.buffer)
            const variations = await generateVariations(originalBuffer, config.variations)

            logger.info('finished converting file', { file })
            return {
                original: originalBuffer.toString('base64'),
                variations,
            }
        })
    )

    return {
        type,
        files: processedFiles,
    }
}


/**
 * Generates variations of the original image based on the provided configuration.
 * 
 * @param originalBuffer - The buffer of the original WebP image
 * @param variationsConfig - Configuration for variations (e.g., width/height for each size)
 * @returns A promise that resolves to a record of variations in base64 format
 */
const generateVariations = async (
    originalBuffer: Buffer,
    variationsConfig: Record<string, { width: number; height: number }>
): Promise<Record<string, string>> => {
    const variations: Record<string, string> = {}

    for (const [key, { width, height }] of Object.entries(variationsConfig)) {
        logger.info('start generating file variation', { key, width, height, originalBuffer })
        const resizedBuffer = await resizeImage(originalBuffer, width, height)
        logger.info('finished generating file variation', { key, width, height, resizedBuffer })
        variations[key] = resizedBuffer.toString('base64')
    }

    return variations
}


/**
 * crop uploaded image for a specific width and height with given top and left margins
 * 
 * @param cropParams - The diemntions required for image crop
 * @param file - Single uploaded file (as Multer's File object)
 * @returns A promise that resolves to the cropped image result
 */
export const processImageCrop = async (
    cropParams: { width: number; height: number; top: number; left: number },
    file: Express.Multer.File
): Promise<CroppedImageResult> => {
    const { width, height, top, left } = cropParams
    const croppedBuffer = await cropImage(file.buffer, left, top, width, height)

    return {
        original: file.buffer.toString('base64'),
        cropped: croppedBuffer.toString('base64')
    }
}