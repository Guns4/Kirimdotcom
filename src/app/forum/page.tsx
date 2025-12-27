import { getForumCategories, getThreadsByCategory } from '@/app/actions/forumActions';
import { MessageSquare, TrendingUp, Users, Plus } from 'lucide-react';
import Link from 'next/link';

export const metadata = {
    title: 'Forum Seller Indonesia - Diskusi & Tips Jualan | CekKirim',
    description: 'Forum komunitas seller Indonesia. Curhat ekspedisi, tips jualan, info marketplace, dan diskusi bisnis online.',
};

async function getForumData() {
    const { data: categories } = await getForumCategories();
    const { data: threads } = await getThreadsByCategory(undefined, 10);

    return { categories: categories || [], threads: threads || [] };
}

export default async function ForumPage() {
    const { categories, threads } = await getForumData();

    const formatDate = (date: string) => {
        return new Date(date).toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
        });
    };

    const formatRelativeTime = (date: string) => {
        const now = new Date();
        const then = new Date(date);
        const diffMinutes = Math.floor((now.getTime() - then.getTime()) / (1000 * 60));

        if (diffMinutes < 60) return `${diffMinutes} menit lalu`;
        const diffHours = Math.floor(diffMinutes / 60);
        if (diffHours < 24) return `${diffHours} jam lalu`;
        const diffDays = Math.floor(diffHours / 24);
        return `${diffDays} hari lalu`;
    };

    return (
        <main className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 py-12 px-4">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-4xl font-bold text-gray-900 mb-2">
                            Forum Seller 💬
                        </h1>
                        <p className="text-gray-600">
                            Komunitas seller Indonesia berbagi tips dan pengalaman
                        </p>
                    </div>
                    <Link
                        href="/forum/new"
                        className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold px-6 py-3 rounded-lg flex items-center gap-2 transition-colors"
                    >
                        <Plus className="w-5 h-5" />
                        Buat Thread
                    </Link>
                </div>

                {/* Stats */}
                <div className="grid md:grid-cols-3 gap-4 mb-8">
                    <div className="bg-white rounded-xl p-6 shadow-md">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                                <MessageSquare className="w-6 h-6 text-blue-600" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Total Thread</p>
                                <p className="text-2xl font-bold text-gray-900">{threads.length}+</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl p-6 shadow-md">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                                <Users className="w-6 h-6 text-purple-600" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Anggota Aktif</p>
                                <p className="text-2xl font-bold text-gray-900">500+</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl p-6 shadow-md">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                                <TrendingUp className="w-6 h-6 text-green-600" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Dapatkan Poin</p>
                                <p className="text-2xl font-bold text-gray-900">+15/thread</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Categories */}
                <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">Kategori Forum</h2>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {categories.map((category: any) => (
                            <Link
                                key={category.id}
                                href={`/forum/${category.slug}`}
                                className="p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors"
                            >
                                <div className="flex items-center gap-3">
                                    <span className="text-3xl">{category.icon}</span>
                                    <div>
                                        <p className="font-bold text-gray-900">{category.name}</p>
                                        <p className="text-sm text-gray-600">{category.description}</p>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>

                {/* Recent Threads */}
                <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                    <div className="p-6 border-b border-gray-200">
                        <h2 className="text-xl font-bold text-gray-900">Thread Terbaru</h2>
                    </div>

                    <div className="divide-y divide-gray-200">
                        {threads.map((thread: any) => (
                            <Link
                                key={thread.id}
                                href={`/forum/thread/${thread.slug}`}
                                className="block p-6 hover:bg-gray-50 transition-colors"
                            >
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex-1">
                                        <h3 className="text-lg font-bold text-gray-900 mb-2 hover:text-blue-600">
                                            {thread.title}
                                        </h3>
                                        <div className="flex items-center gap-4 text-sm text-gray-600">
                                            <span className="font-semibold">{thread.author_name || 'Anonymous'}</span>
                                            <span>•</span>
                                            <span>{formatRelativeTime(thread.created_at)}</span>
                                            {thread.forum_categories && (
                                                <>
                                                    <span>•</span>
                                                    <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-semibold">
                                                        {thread.forum_categories.name}
                                                    </span>
                                                </>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-6 text-sm text-gray-600">
                                        <div className="text-center">
                                            <p className="font-bold text-gray-900">{thread.views_count}</p>
                                            <p className="text-xs">views</p>
                                        </div>
                                        <div className="text-center">
                                            <p className="font-bold text-gray-900">{thread.comments_count}</p>
                                            <p className="text-xs">replies</p>
                                        </div>
                                        <div className="text-center">
                                            <p className="font-bold text-gray-900">{thread.likes_count}</p>
                                            <p className="text-xs">likes</p>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>

                {/* Gamification CTA */}
                <div className="mt-8 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-xl p-8 text-center">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">
                        Raih Poin dengan Aktif di Forum! 🎯
                    </h2>
                    <div className="flex justify-center gap-8 text-gray-900">
                        <div>
                            <p className="text-3xl font-bold">+15</p>
                            <p className="text-sm">Buat Thread</p>
                        </div>
                        <div>
                            <p className="text-3xl font-bold">+5</p>
                            <p className="text-sm">Komentar</p>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}
