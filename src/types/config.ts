export interface VariationConfig {
    width: number
    height: number
}

export interface ImageTypeConfig {
    variations: Record<string, VariationConfig>
}

export interface ImageConfig {
    [key: string]: number | ImageTypeConfig
}