export function validateSandboxKey(key: string): boolean {
    return key.startsWith('sb_') && key.length > 10;
}

export const MOCK_SANDBOX_USER = {
    id: 'sandbox_user_001',
    name: 'Sandbox Developer',
    balance: 999999999, // Infinite
    role: 'PARTNER'
};
