import { Request, Response } from 'express';

export async function handleImageTransform(request: Request, response: Response) {
    response.json({
        status: 'Success'
    })
}