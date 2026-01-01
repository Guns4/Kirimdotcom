// Profit Margin Calculator & Circuit Breaker
// Ensures every request is profitable

export function checkProfitability(plan: string, endpoint: string): boolean {
    // Server cost estimation per request (Example: Rp 1)
    const SERVER_COST_PER_REQ = 1;

    // Revenue per request (calculated from plan)
    // Startup: Rp 299,000 / 10,000 req = Rp 29.9 per req
    // Business: Rp 2,000,000 / 100,000 req = Rp 20 per req
    const REVENUE_PER_REQ = calculateRevenue(plan);

    if (plan === 'FREE' || plan === 'Developer') {
        // Free tier is "Marketing Loss" (Customer Acquisition Cost)
        // We accept controlled losses for user acquisition
        // But strictly limit to prevent abuse
        return true;
    }

    const margin = REVENUE_PER_REQ - SERVER_COST_PER_REQ;

    if (margin < 0) {
        // ALERT ADMIN! Selling price too low or server too expensive!
        console.error(`[PROFIT ALERT] Negative margin on ${endpoint}. Revenue: Rp${REVENUE_PER_REQ}, Cost: Rp${SERVER_COST_PER_REQ}`);
        // In production: Send notification to Admin Panel God Mode
        // Consider circuit breaker: pause endpoint if consistently unprofitable
        return false;
    }

    // Log healthy margin for monitoring
    console.log(`[PROFIT OK] Margin: Rp${margin.toFixed(2)} on ${plan} plan`);
    return true;
}

function calculateRevenue(plan: string): number {
    const pricing = {
        'FREE': 0,
        'Developer': 0,
        'STARTUP': 29.9,      // Rp 299K / 10K
        'Startup': 29.9,
        'BUSINESS': 20,       // Rp 2M / 100K
        'Business': 20,
        'ENTERPRISE': 50,     // Custom, assumed high value
        'Enterprise': 50,
    };

    return pricing[plan as keyof typeof pricing] || 0;
}

export function estimateMonthlyProfit(totalRequests: number, plan: string): number {
    const revenuePerReq = calculateRevenue(plan);
    const costPerReq = 1;
    const margin = revenuePerReq - costPerReq;

    return totalRequests * margin;
}

// Circuit Breaker: Stops service if too many unprofitable requests
export class CircuitBreaker {
    private failureCount = 0;
    private readonly threshold = 100;
    private isOpen = false;

    recordFailure() {
        this.failureCount++;
        if (this.failureCount >= this.threshold) {
            this.isOpen = true;
            console.error('[CIRCUIT BREAKER] OPENED - Too many unprofitable requests!');
        }
    }

    recordSuccess() {
        this.failureCount = Math.max(0, this.failureCount - 1);
    }

    isCircuitOpen(): boolean {
        return this.isOpen;
    }
}
