/**
 * Computes the SHA-256 hash of a text input.
 * Used for privacy-preserving phone number checks.
 *
 * @param text - The raw text input (e.g., phone number)
 * @returns The hex string of the SHA-256 hash.
 */
export async function sha256(text: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(text);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
  return hashHex;
}

/**
 * Normalizes a phone number to a standard format (628...)
 * Removes non-numeric characters and handles 08... prefix.
 *
 * @param phone - Raw phone number input
 * @returns Normalized phone number string or null if invalid
 */
export function normalizePhone(phone: string): string | null {
  // Remove all non-numeric characters
  let cleaned = phone.replace(/\D/g, '');

  // Handle '08...' -> '628...'
  if (cleaned.startsWith('08')) {
    cleaned = '62' + cleaned.substring(1);
  }

  // Handle '8...' (missing prefix) -> '628...'
  if (cleaned.startsWith('8')) {
    cleaned = '62' + cleaned;
  }

  // Basic validation (Indonesian mobile numbers are usually 10-13 digits)
  // 62 8xx xxxx xxxx (11-14 digits total with 62)
  if (cleaned.length < 10 || cleaned.length > 15) {
    return null; // Invalid length
  }

  return cleaned;
}
