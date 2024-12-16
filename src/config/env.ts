import logger from "../utils/logger"

const getEnvVar = (key: string, defaultValue: string): string => {
    const value = process.env[key]
    if (!value) {
        logger.warn(`Environment variable ${key} is not set. Using default value: ${defaultValue}`)
        return defaultValue
    }
    return value
}

export const env = {
    nodeEnv: getEnvVar('NODE_ENV', 'development'),
    port: parseInt(getEnvVar('PORT', '3000')),
    maxUploadLimit: parseInt(getEnvVar('MAX_UPLOAD_LIMIT', '10'), 10),
    maxFileSize: parseInt(getEnvVar('MAX_FILE_SIZE', '5242880'), 10)
}