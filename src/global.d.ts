export { }

declare global {
    namespace Express {
        interface Request {
            files?: Express.Multer.File[];
        }
    }
}