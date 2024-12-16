export interface ProcessedImage {
    original: string
    variations: Record<string, string>
}

export interface ImageUploadPayload {
    type: string;
    files: Express.Multer.File[]
}

export interface ProcessImagesResult {
    type: string
    files: ProcessedImage[]
}