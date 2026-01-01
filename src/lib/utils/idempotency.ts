import { v4 as uuidv4 } from 'uuid';

// Client-side idempotency key generator
// Prevents double-click submissions

let currentKey: string | null = null;

export function getIdempotencyKey(): string {
    if (!currentKey) {
        currentKey = uuidv4();
    }
    return currentKey;
}

// Call this after successful/failed transaction to reset
export function resetIdempotencyKey() {
    currentKey = null;
}

// Usage in forms:
// const key = getIdempotencyKey();
// await api.withdraw({ amount, pin, idempotencyKey: key });
// resetIdempotencyKey(); // After success
