// Domain Manager Service
// Automate Vercel Custom Domain mapping for SaaS Tenants

const VERCEL_API_URL = 'https://api.vercel.com/v9/projects';
const VERCEL_PROJECT_ID = process.env.VERCEL_PROJECT_ID;
const VERCEL_TEAM_ID = process.env.VERCEL_TEAM_ID;
const VERCEL_AUTH_TOKEN = process.env.VERCEL_AUTH_TOKEN;

interface VercelDomainResponse {
    name: string;
    verified: boolean;
    verification?: {
        type: string;
        domain: string;
        value: string;
        reason: string;
    }[];
    error?: {
        code: string;
        message: string;
    };
}

// Add Domain
export async function addDomainToVercel(domain: string): Promise<{ success: boolean; data?: any; error?: string }> {
    if (!VERCEL_PROJECT_ID || !VERCEL_AUTH_TOKEN) {
        console.warn('Missing Vercel credentials');
        return { success: false, error: 'Server configuration error' };
    }

    try {
        const url = `${VERCEL_API_URL}/${VERCEL_PROJECT_ID}/domains${VERCEL_TEAM_ID ? `?teamId=${VERCEL_TEAM_ID}` : ''}`;

        const res = await fetch(url, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${VERCEL_AUTH_TOKEN}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ name: domain })
        });

        const data: VercelDomainResponse = await res.json();

        if (data.error) {
            return { success: false, error: data.error.message };
        }

        return { success: true, data };
    } catch (err: any) {
        return { success: false, error: err.message };
    }
}

// Verify Domain
export async function verifyDomainConfig(domain: string): Promise<{ verified: boolean; misconfigured: boolean }> {
    if (!VERCEL_PROJECT_ID || !VERCEL_AUTH_TOKEN) {
        // Mock for dev
        console.log(`[Mock] Verifying domain ${domain}`);
        return { verified: true, misconfigured: false };
    }

    try {
        const url = `${VERCEL_API_URL}/${VERCEL_PROJECT_ID}/domains/${domain}${VERCEL_TEAM_ID ? `?teamId=${VERCEL_TEAM_ID}` : ''}`;

        const res = await fetch(url, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${VERCEL_AUTH_TOKEN}`
            }
        });

        const data: VercelDomainResponse = await res.json();

        return {
            verified: data.verified,
            misconfigured: !data.verified // Simplify logic
        };
    } catch (err) {
        return { verified: false, misconfigured: true };
    }
}

// Remove Domain
export async function removeDomainFromVercel(domain: string): Promise<boolean> {
    if (!VERCEL_PROJECT_ID || !VERCEL_AUTH_TOKEN) return false;

    try {
        const url = `${VERCEL_API_URL}/${VERCEL_PROJECT_ID}/domains/${domain}${VERCEL_TEAM_ID ? `?teamId=${VERCEL_TEAM_ID}` : ''}`;

        await fetch(url, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${VERCEL_AUTH_TOKEN}`
            }
        });

        return true;
    } catch (err) {
        return false;
    }
}
