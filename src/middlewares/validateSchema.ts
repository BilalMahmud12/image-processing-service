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

        console.log('errors', errors)

        const requiredErrors = errors
            .filter((err) => err.keyword === 'required')
            .map((err) => `The ${err.params.missingProperty} field is required`)

        console.log('requiredErrors', requiredErrors)

        const otherErrors = errors
            .filter((err) => err.keyword !== 'required')
            .map((err) => {
                if (err.keyword === 'type') {
                    return `${err.instancePath || 'Field'} ${err.message}`
                }
                if (err.keyword === 'enum') {
                    return `${err.instancePath || 'Field'} ${err.message}`
                }
                if (err.keyword === 'minItems') {
                    return `${err.instancePath} must contain at least one file`
                }
                return err.message;
            });

        const groupedErrors = [...requiredErrors, ...otherErrors]

        response.status(400).json({
            error: 'Validation Error',
            details: groupedErrors,
        })

        return
    }

    next()
}
