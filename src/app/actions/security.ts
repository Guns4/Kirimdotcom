'use server'

interface TurnstileVerifyResponse {
    success: boolean
    error_codes?: string[]
    challenge_ts?: string
    hostname?: string
}

export async function verifyTurnstile(token: string): Promise<boolean> {
    const secretKey = process.env.TURNSTILE_SECRET_KEY

    // Fail-Open: If no secret key is set (e.g. dev environment without keys), allow traffic
    // Or if in production and key is missing, logged error but allow (depending on policy).
    // Here we'll treat missing key as "allow" for "Fail-Open" strict definition,
    // assuming valid setup would have the key.
    if (!secretKey) {
        console.warn('TURNSTILE_SECRET_KEY not set. Allowing request locally/insecurely.')
        return true
    }

    // Always use Cloudflare Test Secret Key if the site key was the test one
    // But since we can't easily know which site key was used client side without passing it,
    // we assume env vars are paired correctly.
    // Cloudflare Test Secret Key: 1x0000000000000000000000000000000AA

    try {
        const formData = new FormData()
        formData.append('secret', secretKey)
        formData.append('response', token)

        // Using fetch with a timeout to ensure Fail-Open on network issues
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 3000) // 3s timeout

        const result = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
            method: 'POST',
            body: formData,
            signal: controller.signal,
        })

        clearTimeout(timeoutId)

        if (!result.ok) {
            console.error('Turnstile API error:', result.status)
            return true // Fail-Open on API error
        }

        const data: TurnstileVerifyResponse = await result.json()

        if (!data.success) {
            console.warn('Turnstile validation failed:', data.error_codes)
            return false // Block if explicitly failed validation
        }

        return true

    } catch (error) {
        console.error('Turnstile verification exception:', error)
        return true // Fail-Open on network/exception
    }
}
