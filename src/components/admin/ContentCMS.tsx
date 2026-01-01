'use client';
import React, { useState, useEffect } from 'react';
import { FileText, Plus, Edit2, Trash2, RefreshCw, Eye } from 'lucide-react';

export default function ContentCMS({ adminKey }: { adminKey: string }) {
    const [posts, setPosts] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [editingPost, setEditingPost] = useState<any>(null);

    const fetchPosts = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/admin/content/manage', {
                headers: { 'x-admin-secret': adminKey }
            });
            if (res.ok) {
                const data = await res.json();
                setPosts(data.posts || []);
            }
        } catch (error) {
            console.error('Failed to fetch posts:', error);
        }
        setLoading(false);
    };

    useEffect(() => {
        if (adminKey) fetchPosts();
    }, [adminKey]);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);

        const payload = {
            id: editingPost?.id,
            slug: formData.get('slug'),
            title: formData.get('title'),
            content: formData.get('content'),
            category: formData.get('category'),
            meta_desc: formData.get('meta_desc'),
            is_published: formData.get('is_published') === 'on'
        };

        try {
            const res = await fetch('/api/admin/content/manage', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-admin-secret': adminKey
                },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                alert(editingPost ? '✅ Post updated!' : '✅ Post created!');
                setShowForm(false);
                setEditingPost(null);
                fetchPosts();
                e.currentTarget.reset();
            } else {
                alert('❌ Failed to save post');
            }
        } catch (error) {
            alert('Error: ' + error);
        }
    };

    const handleDelete = async (postId: string) => {
        if (!confirm('Delete this post? This cannot be undone.')) return;

        try {
            const res = await fetch(`/api/admin/content/manage?id=${postId}`, {
                method: 'DELETE',
                headers: { 'x-admin-secret': adminKey }
            });

            if (res.ok) {
                alert('✅ Post deleted');
                fetchPosts();
            } else {
                alert('❌ Failed to delete post');
            }
        } catch (error) {
            alert('Error: ' + error);
        }
    };

    const handleEdit = (post: any) => {
        setEditingPost(post);
        setShowForm(true);
    };

    const publishedCount = posts.filter(p => p.is_published).length;
    const totalViews = posts.reduce((acc, p) => acc + (p.views || 0), 0);

    return (
        <div className="space-y-6">
            {/* STATS */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                    <h4 className="text-blue-800 font-bold flex items-center gap-2 text-sm">
                        <FileText size={16} /> Total Articles
                    </h4>
                    <p className="text-3xl font-black text-blue-900 mt-1">{posts.length}</p>
                </div>
                <div className="bg-green-50 p-4 rounded-xl border border-green-100">
                    <h4 className="text-green-800 font-bold flex items-center gap-2 text-sm">
                        Published
                    </h4>
                    <p className="text-3xl font-black text-green-900 mt-1">{publishedCount}</p>
                </div>
                <div className="bg-purple-50 p-4 rounded-xl border border-purple-100">
                    <h4 className="text-purple-800 font-bold flex items-center gap-2 text-sm">
                        <Eye size={16} /> Total Views
                    </h4>
                    <p className="text-3xl font-black text-purple-900 mt-1">
                        {totalViews.toLocaleString()}
                    </p>
                </div>
            </div>

            {/* HEADER */}
            <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold text-slate-800">SEO Content Engine</h3>
                <div className="flex gap-2">
                    <button
                        onClick={fetchPosts}
                        disabled={loading}
                        className="flex items-center gap-2 px-4 py-2 bg-white border rounded-lg hover:bg-slate-50 transition disabled:opacity-50"
                    >
                        <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
                        Refresh
                    </button>
                    <button
                        onClick={() => {
                            setEditingPost(null);
                            setShowForm(!showForm);
                        }}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                    >
                        <Plus size={16} />
                        New Article
                    </button>
                </div>
            </div>

            {/* FORM */}
            {showForm && (
                <div className="bg-white p-6 rounded-xl shadow border">
                    <h4 className="font-bold mb-4">
                        {editingPost ? 'Edit Article' : 'Create New Article'}
                    </h4>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-bold text-slate-600 mb-1">Title</label>
                                <input
                                    name="title"
                                    required
                                    defaultValue={editingPost?.title}
                                    placeholder="Article title"
                                    className="w-full border p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-600 mb-1">
                                    Slug (URL)
                                </label>
                                <input
                                    name="slug"
                                    required
                                    defaultValue={editingPost?.slug}
                                    placeholder="article-slug"
                                    className="w-full border p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-slate-600 mb-1">Category</label>
                            <input
                                name="category"
                                defaultValue={editingPost?.category || 'general'}
                                placeholder="general, tutorial, news"
                                className="w-full border p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-slate-600 mb-1">
                                Meta Description (SEO)
                            </label>
                            <input
                                name="meta_desc"
                                defaultValue={editingPost?.meta_desc}
                                placeholder="Brief description for search engines"
                                className="w-full border p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                maxLength={160}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-slate-600 mb-1">Content</label>
                            <textarea
                                name="content"
                                defaultValue={editingPost?.content}
                                rows={12}
                                placeholder="Article content (supports Markdown)"
                                className="w-full border p-3 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                            ></textarea>
                        </div>

                        <div className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                name="is_published"
                                id="is_published"
                                defaultChecked={editingPost?.is_published}
                                className="w-4 h-4"
                            />
                            <label htmlFor="is_published" className="text-sm font-bold text-slate-600">
                                Publish immediately
                            </label>
                        </div>

                        <div className="flex gap-2">
                            <button
                                type="submit"
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                            >
                                {editingPost ? 'Update Article' : 'Publish Article'}
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    setShowForm(false);
                                    setEditingPost(null);
                                }}
                                className="px-4 py-2 bg-slate-200 rounded-lg hover:bg-slate-300"
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* POSTS LIST */}
            <div className="bg-white rounded-xl shadow border overflow-hidden">
                <div className="p-4 border-b bg-slate-50 font-bold">Articles</div>
                <div className="divide-y divide-slate-100">
                    {posts.length === 0 ? (
                        <div className="p-8 text-center text-slate-400">
                            No articles yet. Create your first one!
                        </div>
                    ) : (
                        posts.map((post) => (
                            <div
                                key={post.id}
                                className="p-4 hover:bg-slate-50 transition flex justify-between items-start"
                            >
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                        <h4 className="font-bold text-slate-800">{post.title}</h4>
                                        {post.is_published ? (
                                            <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded text-xs font-bold">
                                                PUBLISHED
                                            </span>
                                        ) : (
                                            <span className="bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded text-xs font-bold">
                                                DRAFT
                                            </span>
                                        )}
                                    </div>
                                    <div className="text-xs text-slate-500 space-x-3">
                                        <span>/{post.slug}</span>
                                        <span>•</span>
                                        <span>{post.category}</span>
                                        <span>•</span>
                                        <span>{post.views || 0} views</span>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => handleEdit(post)}
                                        className="p-2 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition"
                                        title="Edit"
                                    >
                                        <Edit2 size={14} />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(post.id)}
                                        className="p-2 bg-red-100 text-red-700 rounded hover:bg-red-200 transition"
                                        title="Delete"
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
