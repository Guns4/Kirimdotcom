// ============================================
// IMAGE COMPRESSION UTILITIES
// ============================================
// Client-side image compression before upload

interface CompressOptions {
    maxWidth?: number
    maxHeight?: number
    maxSizeKB?: number
    quality?: number
    format?: 'jpeg' | 'webp' | 'png'
}

const defaultOptions: CompressOptions = {
    maxWidth: 800,
    maxHeight: 800,
    maxSizeKB: 500,
    quality: 0.8,
    format: 'webp',
}

/**
 * Compress image file before upload
 * Reduces file size while maintaining quality
 */
export async function compressImage(
    file: File,
    options: CompressOptions = {}
): Promise<File> {
    const opts = { ...defaultOptions, ...options }

    // Skip if already small enough
    if (file.size <= (opts.maxSizeKB! * 1024)) {
        return file
    }

    return new Promise((resolve, reject) => {
        const reader = new FileReader()

        reader.onload = (e) => {
            const img = new Image()

            img.onload = () => {
                const canvas = document.createElement('canvas')
                let { width, height } = img

                // Calculate new dimensions
                if (width > opts.maxWidth! || height > opts.maxHeight!) {
                    const ratio = Math.min(
                        opts.maxWidth! / width,
                        opts.maxHeight! / height
                    )
                    width = Math.round(width * ratio)
                    height = Math.round(height * ratio)
                }

                canvas.width = width
                canvas.height = height

                const ctx = canvas.getContext('2d')
                if (!ctx) {
                    reject(new Error('Failed to get canvas context'))
                    return
                }

                // Draw image with white background (for transparency)
                ctx.fillStyle = '#FFFFFF'
                ctx.fillRect(0, 0, width, height)
                ctx.drawImage(img, 0, 0, width, height)

                // Convert to blob with compression
                const mimeType = opts.format === 'webp'
                    ? 'image/webp'
                    : opts.format === 'png'
                        ? 'image/png'
                        : 'image/jpeg'

                canvas.toBlob(
                    (blob) => {
                        if (!blob) {
                            reject(new Error('Failed to compress image'))
                            return
                        }

                        // If still too large, reduce quality
                        if (blob.size > opts.maxSizeKB! * 1024 && opts.quality! > 0.3) {
                            compressImage(file, {
                                ...opts,
                                quality: opts.quality! - 0.1
                            })
                                .then(resolve)
                                .catch(reject)
                            return
                        }

                        const extension = opts.format === 'webp'
                            ? 'webp'
                            : opts.format === 'png'
                                ? 'png'
                                : 'jpg'

                        const compressedFile = new File(
                            [blob],
                            file.name.replace(/\.[^.]+$/, `.${extension}`),
                            { type: mimeType }
                        )

                        console.log(`[Image Compression] ${file.name}: ${(file.size / 1024).toFixed(1)}KB → ${(compressedFile.size / 1024).toFixed(1)}KB`)

                        resolve(compressedFile)
                    },
                    mimeType,
                    opts.quality
                )
            }

            img.onerror = () => reject(new Error('Failed to load image'))
            img.src = e.target?.result as string
        }

        reader.onerror = () => reject(new Error('Failed to read file'))
        reader.readAsDataURL(file)
    })
}

/**
 * Validate file before upload
 */
export function validateUploadFile(
    file: File,
    options: {
        maxSizeKB?: number
        allowedTypes?: string[]
    } = {}
): { valid: boolean; error?: string } {
    const maxSize = options.maxSizeKB || 500
    const allowedTypes = options.allowedTypes || [
        'image/jpeg',
        'image/png',
        'image/webp',
        'image/gif',
    ]

    if (!allowedTypes.includes(file.type)) {
        return {
            valid: false,
            error: `Tipe file tidak didukung. Gunakan: ${allowedTypes.map(t => t.split('/')[1]).join(', ')}`,
        }
    }

    if (file.size > maxSize * 1024) {
        return {
            valid: false,
            error: `Ukuran file maksimal ${maxSize}KB. File Anda: ${(file.size / 1024).toFixed(1)}KB`,
        }
    }

    return { valid: true }
}

/**
 * Get optimized image URL from Supabase Storage
 * Uses transform parameter for on-the-fly optimization
 */
export function getOptimizedImageUrl(
    supabaseUrl: string,
    bucketName: string,
    filePath: string,
    options: {
        width?: number
        height?: number
        quality?: number
    } = {}
): string {
    const { width = 400, height, quality = 80 } = options

    let transformParams = `width=${width}`
    if (height) transformParams += `,height=${height}`
    transformParams += `,quality=${quality}`

    return `${supabaseUrl}/storage/v1/render/image/public/${bucketName}/${filePath}?${transformParams}`
}

/**
 * Generate thumbnail URL
 */
export function getThumbnailUrl(
    supabaseUrl: string,
    bucketName: string,
    filePath: string
): string {
    return getOptimizedImageUrl(supabaseUrl, bucketName, filePath, {
        width: 100,
        quality: 60,
    })
}
