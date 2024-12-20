import sharp from 'sharp'
import { ApplicationError } from '../../utils/ApplicationError'

export const convertToWebP = async (buffer: Buffer): Promise<Buffer> => {
    try {
        return await sharp(buffer).webp().toBuffer()
    } catch (error) {
        throw new ApplicationError('WebP conversion failed', 500)
    }
}

export const resizeImage = async (buffer: Buffer, width: number, height: number): Promise<Buffer> => {
    try {
        return await sharp(buffer).resize(width, height).toBuffer()
    } catch (error) {
        throw new ApplicationError('Image resizing failed', 500)
    }
}

export const cropImage = async (
    buffer: Buffer,
    left: number,
    top: number,
    width: number,
    height: number,
): Promise<Buffer> => {
    try {
        const croppedImage = await sharp(buffer)
            .extract({ left, top, width, height })
            .toBuffer()

        return croppedImage
    } catch (error) {
        throw new ApplicationError('Failed to crop the image', 500)
    }
}