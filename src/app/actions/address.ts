'use server'

import { safeAction } from '@/lib/safe-action'
import { addressNormalizer } from '@/lib/ai/address-normalizer'

export const normalizeAddress = async (address: string) => {
    return safeAction(async () => {
        const result = addressNormalizer.normalize(address)
        return result
    })
}

// Batch normalize for multiple addresses
export const normalizeAddresses = async (addresses: string[]) => {
    return safeAction(async () => {
        const results = addresses.map(addr => addressNormalizer.normalize(addr))
        return results
    })
}
