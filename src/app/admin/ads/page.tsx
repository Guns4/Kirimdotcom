import { requireAdmin } from '@/lib/adminAuth';
import { createClient } from '@/utils/supabase/server';
import { TrendingUp, Eye, MousePointer, CheckCircle, Clock, XCircle } from 'lucide-react';
import Link from 'next/link';

export const metadata = {
    title: 'Admin - Ad Management | CekKirim',
    description: 'Manage advertising campaigns',
};

async function getAdminAdsData() {
    await requireAdmin();

    const supabase = await createClient();

    // Get all campaigns
    const { data: campaigns } = await supabase
        .from('ad_campaigns')
        .select('*')
        .order('created_at', { ascending: false });

    // Get total stats
    const totalImpressions = campaigns?.reduce((sum, c) => sum + (c.total_impressions || 0), 0) || 0;
    const totalClicks = campaigns?.reduce((sum, c) => sum + (c.total_clicks || 0), 0) || 0;
    const avgCTR = totalImpressions > 0 ? ((totalClicks / totalImpressions) * 100).toFixed(2) : 0;

    return {
        campaigns: campaigns || [],
        stats: { totalImpressions, totalClicks, avgCTR }
    };
}

export default async function AdminAdsPage() {
    const { campaigns, stats } = await getAdminAdsData();

    const formatDate = (date: string) => {
        return new Date(date).toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
        });
    };

    const pendingCampaigns = campaigns.filter((c: any) => c.status === 'pending');
    const activeCampaigns = campaigns.filter((c: any) => c.status === 'active');

    return (
        <main className="min-h-screen bg-gray-50 py-8 px-4">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">
                            Ad Campaign Management
                        </h1>
                        <p className="text-gray-600">Manage advertising slots and campaigns</p>
                    </div>
                    <Link
                        href="/admin/ads/new"
                        className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-3 rounded-lg transition-colors"
                    >
                        Create Campaign
                    </Link>
                </div>

                {/* Stats */}
                <div className="grid md:grid-cols-4 gap-6 mb-8">
                    <div className="bg-white rounded-xl shadow-md p-6">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                                <TrendingUp className="w-6 h-6 text-blue-600" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Total Campaigns</p>
                                <p className="text-2xl font-bold text-gray-900">{campaigns.length}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-md p-6">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                                <Eye className="w-6 h-6 text-purple-600" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Total Impressions</p>
                                <p className="text-2xl font-bold text-gray-900">{stats.totalImpressions.toLocaleString()}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-md p-6">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                                <MousePointer className="w-6 h-6 text-green-600" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Total Clicks</p>
                                <p className="text-2xl font-bold text-gray-900">{stats.totalClicks.toLocaleString()}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-md p-6">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                                <TrendingUp className="w-6 h-6 text-yellow-600" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Average CTR</p>
                                <p className="text-2xl font-bold text-gray-900">{stats.avgCTR}%</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Pending Approvals */}
                {pendingCampaigns.length > 0 && (
                    <div className="bg-yellow-50 border-2 border-yellow-300 rounded-xl p-6 mb-8">
                        <h2 className="text-xl font-bold text-yellow-900 mb-4">
                            ⚠️ Pending Approvals ({pendingCampaigns.length})
                        </h2>
                        <div className="space-y-3">
                            {pendingCampaigns.map((campaign: any) => (
                                <div key={campaign.id} className="bg-white rounded-lg p-4 flex items-center justify-between">
                                    <div>
                                        <p className="font-semibold text-gray-900">{campaign.campaign_name}</p>
                                        <p className="text-sm text-gray-600">
                                            by {campaign.advertiser_name} - {campaign.slot_position}
                                        </p>
                                    </div>
                                    <Link
                                        href={`/admin/ads/${campaign.id}`}
                                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition"
                                    >
                                        Review
                                    </Link>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Campaigns Table */}
                <div className="bg-white rounded-xl shadow-md overflow-hidden">
                    <div className="p-6 border-b border-gray-200">
                        <h2 className="text-xl font-bold text-gray-900">All Campaigns</h2>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                        Campaign
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                        Slot
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                        Dates
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                        Impressions
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                        Clicks
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                        CTR
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                        Status
                                    </th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {campaigns.map((campaign: any) => (
                                    <tr key={campaign.id}>
                                        <td className="px-6 py-4">
                                            <div>
                                                <p className="font-semibold text-gray-900">{campaign.campaign_name}</p>
                                                <p className="text-sm text-gray-500">{campaign.advertiser_name}</p>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="inline-block px-2 py-1 bg-blue-100 text-blue-800 text-xs font-semibold rounded">
                                                {campaign.slot_position}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-600">
                                            {formatDate(campaign.start_date)} - {formatDate(campaign.end_date)}
                                        </td>
                                        <td className="px-6 py-4 text-gray-900">
                                            {campaign.total_impressions?.toLocaleString() || 0}
                                        </td>
                                        <td className="px-6 py-4 text-gray-900">
                                            {campaign.total_clicks?.toLocaleString() || 0}
                                        </td>
                                        <td className="px-6 py-4 text-gray-900">
                                            {campaign.ctr ? `${campaign.ctr}%` : '0%'}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded ${campaign.status === 'active' ? 'bg-green-100 text-green-800' :
                                                    campaign.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                                        campaign.status === 'paused' ? 'bg-gray-100 text-gray-800' :
                                                            'bg-red-100 text-red-800'
                                                }`}>
                                                {campaign.status === 'active' && <CheckCircle className="w-3 h-3" />}
                                                {campaign.status === 'pending' && <Clock className="w-3 h-3" />}
                                                {campaign.status === 'rejected' && <XCircle className="w-3 h-3" />}
                                                {campaign.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <Link
                                                href={`/admin/ads/${campaign.id}`}
                                                className="text-blue-600 hover:underline text-sm font-semibold"
                                            >
                                                View Details
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </main>
    );
}
