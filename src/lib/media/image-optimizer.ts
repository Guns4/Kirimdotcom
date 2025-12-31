import sharp from 'sharp';

/**
 * Optimizes an image buffer to WebP format.
 * - Resizes to max width 1080px (maintaining aspect ratio)
 * - Converts to WebP with 80% quality
 */
export async function optimizeImage(buffer: Buffer): Promise<Buffer> {
    try {
        const optimizedBuffer = await sharp(buffer)
            .resize({ width: 1080, withoutEnlargement: true }) // Downscale only
            .webp({ quality: 80 })
            .toBuffer();

        return optimizedBuffer;
    } catch (error) {
        console.error('Image optimization failed:', error);
        throw new Error('Failed to optimize image');
    }
}
