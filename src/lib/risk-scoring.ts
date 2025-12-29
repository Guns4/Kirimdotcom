export interface Report {
    id: string;
    description: string;
    has_evidence: boolean;
    created_at: string;
}

export interface RiskScore {
    score: number; // 0-100
    level: 'AMAN' | 'WASPADA' | 'BAHAYA';
    color: string;
    factors: string[];
}

export function calculateRiskScore(reports: Report[]): RiskScore {
    let score = 100;
    const factors: string[] = [];
    const now = new Date();

    if (reports.length === 0) {
        return { score: 100, level: 'AMAN', color: '#10B981', factors: ['Tidak ada laporan'] };
    }

    reports.forEach(report => {
        // Base deduction
        let deduction = 20;

        // Evidence penalty
        if (report.has_evidence) {
            deduction += 10; // Total 30
        }

        // Recency penalty (< 30 days)
        const reportDate = new Date(report.created_at);
        const daysDiff = (now.getTime() - reportDate.getTime()) / (1000 * 3600 * 24);

        if (daysDiff < 30) {
            deduction += 10;
        }

        score -= deduction;
    });

    // Clamp score 0-100
    score = Math.max(0, Math.min(100, score));

    // Determine Level
    let level: RiskScore['level'] = 'AMAN';
    let color = '#10B981'; // Green

    if (score < 40) {
        level = 'BAHAYA';
        color = '#EF4444'; // Red
    } else if (score < 80) {
        level = 'WASPADA';
        color = '#F59E0B'; // Yellow
    }

    return { score, level, color, factors };
}
