import type { ImageTypeConfig, ProcessedImage, ProcessImagesResult } from '../../types'
import { ApplicationError } from '../../utils/ApplicationError'
import { convertToWebP, resizeImage } from './imageProcessor.service'
import { imageConfig } from '../../config/imageConfig'


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
            console.log('start processing file', file)
            const originalBuffer = await convertToWebP(file.buffer)
            const variations = await generateVariations(originalBuffer, config.variations)

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
    const variations: Record<string, string> = {};

    for (const [key, { width, height }] of Object.entries(variationsConfig)) {
        const resizedBuffer = await resizeImage(originalBuffer, width, height)
        variations[key] = resizedBuffer.toString('base64')
    }

    return variations
}