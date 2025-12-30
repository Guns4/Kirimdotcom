import InvestorDashboard from '@/components/investor/InvestorDashboard';

export const metadata = {
    title: 'Live Data - Investor Portal | CekKirim',
    description: 'Real-time business metrics for CekKirim investors and partners.',
    robots: 'noindex, nofollow', // Keep private from search engines
};

export default function InvestorLiveDataPage() {
    return <InvestorDashboard />;
}
