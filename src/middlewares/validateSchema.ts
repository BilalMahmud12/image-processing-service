import type { Request, Response, NextFunction } from 'express'
import Ajv, { ErrorObject } from 'ajv'
import addFormats from 'ajv-formats'
import addErrors from 'ajv-errors'
import { imageUploadSchema } from '../schemas/imageUploadSchema'

const ajv = new Ajv({ allErrors: true })
addFormats(ajv)
addErrors(ajv)

const validateSchema = ajv.compile(imageUploadSchema)

export const validateImageUpload = (
    request: Request, 
    response: Response, 
    next: NextFunction
): void => {
    const body = { ...request.body, files: request.files || [] }

    const isValid = validateSchema(body)

    if (!isValid) {
        const errors = validateSchema.errors as ErrorObject[]
        const groupedErrors = errors.map((err) => {
            switch (err.keyword) {
                case 'required':
                    return `Missing field: ${err.params.missingProperty}`;
                case 'type':
                    return `${err.instancePath} ${err.message}`;
                case 'enum':
                    return `${err.instancePath} ${err.message}`;
                case 'minItems':
                    return `${err.instancePath} must contain at least one file`;
                default:
                    return err.message
            }
        })

        response.status(400).json({
            error: 'Validation Error',
            details: groupedErrors,
        })

        return
    }

    next()
}
