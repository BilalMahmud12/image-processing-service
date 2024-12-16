import { JSONSchemaType } from 'ajv'
import { imageConfig } from '../config/imageConfig'

export const imageUploadSchema: JSONSchemaType<{ type: string, files: {}[] }> = {
    type: 'object',
    properties: {
        type: {
            type: 'string',
            enum: Object.keys(imageConfig),
            errorMessage: {
                type: 'The type field must be a string',
                enum: `The type field must be one of: `,
            },
        },
        files: {
            type: 'array',
            items: { type: 'object' },
            minItems: 1,
            errorMessage: {
                type: 'The files field must be an array',
                minItems: 'The files field must contain at least one file'
            }
        }
    },
    required: ['type', 'files'],
    additionalProperties: false,
    errorMessage: {
        required: {
            type: 'The type field is required',
            files: 'The files field is required',
        },
        additionalProperties: 'Additional properties are not allowed.',
    }
}