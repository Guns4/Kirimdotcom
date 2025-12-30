// Investor Metrics Service
// Calculate and format key business metrics for investors

export interface InvestorMetrics {
    gmv: {
        current: number;
        previous: number;
        growth: number;
    };
    mau: {
        current: number;
        previous: number;
        growth: number;
    };
    mom: {
        revenue: number;
        users: number;
        transactions: number;
    };
    cac: number;
    ltv: number;
    ltvCacRatio: number;
    runway: number; // months
    burnRate: number;
}

export interface MonthlyData {
    month: string;
    gmv: number;
    users: number;
    transactions: number;
    revenue: number;
}

// Mock data generator (in production, fetch from database)
export function getInvestorMetrics(): InvestorMetrics {
    // All values in IDR millions
    return {
        gmv: {
            current: 2850, // Rp 2.85 Miliar
            previous: 2100,
            growth: ((2850 - 2100) / 2100) * 100 // 35.7%
        },
        mau: {
            current: 45000,
            previous: 38000,
            growth: ((45000 - 38000) / 38000) * 100 // 18.4%
        },
        mom: {
            revenue: 15.2, // %
            users: 18.4, // %
            transactions: 22.1 // %
        },
        cac: 25000, // Rp 25k per user
        ltv: 350000, // Rp 350k per user lifetime
        ltvCacRatio: 350000 / 25000, // 14x
        runway: 18, // months
        burnRate: 150 // Rp 150 Juta per month
    };
}

export function getMonthlyGrowthData(): MonthlyData[] {
    return [
        { month: 'Jul', gmv: 1200, users: 25000, transactions: 8500, revenue: 48 },
        { month: 'Aug', gmv: 1450, users: 28000, transactions: 10200, revenue: 58 },
        { month: 'Sep', gmv: 1680, users: 32000, transactions: 12800, revenue: 67 },
        { month: 'Oct', gmv: 1920, users: 35000, transactions: 15400, revenue: 77 },
        { month: 'Nov', gmv: 2100, users: 38000, transactions: 18200, revenue: 84 },
        { month: 'Dec', gmv: 2850, users: 45000, transactions: 24500, revenue: 114 },
    ];
}

export function getUserAcquisitionData() {
    return [
        { channel: 'Organic', users: 18000, cac: 0 },
        { channel: 'Referral', users: 12000, cac: 15000 },
        { channel: 'Social Ads', users: 8000, cac: 35000 },
        { channel: 'Google Ads', users: 5000, cac: 45000 },
        { channel: 'Partnerships', users: 2000, cac: 20000 },
    ];
}

export function formatCurrency(value: number, inMillions = false): string {
    if (inMillions) {
        if (value >= 1000) {
            return `Rp ${(value / 1000).toFixed(1)}M`;
        }
        return `Rp ${value}Jt`;
    }
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(value);
}

export function formatNumber(value: number): string {
    if (value >= 1000000) {
        return `${(value / 1000000).toFixed(1)}M`;
    }
    if (value >= 1000) {
        return `${(value / 1000).toFixed(1)}K`;
    }
    return value.toString();
}

// Investor access password (in production, use env variable)
export const INVESTOR_PASSWORD = 'cekkirimdeck2024';

export function validateInvestorAccess(password: string): boolean {
    return password === INVESTOR_PASSWORD;
}
