import sharp from 'sharp'

export const convertToWebP = async (buffer: Buffer): Promise<Buffer> => {
    try {
        return await sharp(buffer).webp().toBuffer()
    } catch (error) {
        throw new Error('WebP conversion failed')
    }
}

export const resizeImage = async (buffer: Buffer, width: number, height: number): Promise<Buffer> => {
    try {
        return await sharp(buffer).resize(width, height).toBuffer()
    } catch (error) {
        throw new Error('Image resizing failed')
    }
}