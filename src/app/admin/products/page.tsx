import { requireAdmin } from '@/lib/adminAuth';
import { getAllProductsAdmin, getSalesStats, createProduct, updateProduct, deleteProduct } from '@/app/actions/adminProductActions';
import { Package, TrendingUp, Plus, Edit2, Trash2, Eye } from 'lucide-react';
import Link from 'next/link';

export const metadata = {
    title: 'Admin - Product Management | CekKirim',
    description: 'Manage digital products',
};

async function getAdminData() {
    await requireAdmin();

    const { data: products } = await getAllProductsAdmin();
    const { data: salesStats } = await getSalesStats();

    return { products: products || [], salesStats: salesStats || [] };
}

export default async function AdminProductsPage() {
    const { products, salesStats } = await getAdminData();

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
        }).format(price);
    };

    const formatDate = (date: string) => {
        return new Date(date).toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
        });
    };

    const activeProducts = products.filter((p: any) => p.is_active);
    const totalRevenue = products.reduce((sum: number, p: any) => {
        const sales = salesStats.find((s: any) => s.id === p.id)?.count || 0;
        return sum + (p.price * sales);
    }, 0);

    return (
        <main className="min-h-screen bg-gray-50 py-8 px-4">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">
                            Product Management
                        </h1>
                        <p className="text-gray-600">Manage digital products for the store</p>
                    </div>
                    <Link
                        href="/admin/products/new"
                        className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-3 rounded-lg transition-colors inline-flex items-center gap-2"
                    >
                        <Plus className="w-5 h-5" />
                        Add New Product
                    </Link>
                </div>

                {/* Stats */}
                <div className="grid md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-white rounded-xl shadow-md p-6">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                                <Package className="w-6 h-6 text-blue-600" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Total Products</p>
                                <p className="text-2xl font-bold text-gray-900">{products.length}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-md p-6">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                                <TrendingUp className="w-6 h-6 text-green-600" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Active Products</p>
                                <p className="text-2xl font-bold text-gray-900">{activeProducts.length}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-md p-6">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                                <TrendingUp className="w-6 h-6 text-purple-600" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Total Revenue</p>
                                <p className="text-2xl font-bold text-gray-900">{formatPrice(totalRevenue)}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Sales Chart */}
                {salesStats.length > 0 && (
                    <div className="bg-white rounded-xl shadow-md p-6 mb-8">
                        <h2 className="text-xl font-bold text-gray-900 mb-6">Top Selling Products</h2>
                        <div className="space-y-4">
                            {salesStats.slice(0, 5).map((stat: any, index: number) => {
                                const maxSales = salesStats[0]?.count || 1;
                                const percentage = (stat.count / maxSales) * 100;

                                return (
                                    <div key={stat.id}>
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-sm font-semibold text-gray-900">
                                                {index + 1}. {stat.title}
                                            </span>
                                            <span className="text-sm text-gray-600">{stat.count} sales</span>
                                        </div>
                                        <div className="w-full bg-gray-200 rounded-full h-3">
                                            <div
                                                className="bg-blue-600 h-3 rounded-full transition-all duration-500"
                                                style={{ width: `${percentage}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* Products Table */}
                <div className="bg-white rounded-xl shadow-md overflow-hidden">
                    <div className="p-6 border-b border-gray-200">
                        <h2 className="text-xl font-bold text-gray-900">All Products</h2>
                    </div>

                    {products.length === 0 ? (
                        <div className="text-center py-12">
                            <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                            <p className="text-gray-500">No products yet</p>
                            <Link
                                href="/admin/products/new"
                                className="inline-block mt-4 text-blue-600 hover:underline"
                            >
                                Create your first product
                            </Link>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Product
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Category
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Price
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Sales
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Status
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Created
                                        </th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {products.map((product: any) => {
                                        const sales = salesStats.find((s: any) => s.id === product.id)?.count || 0;

                                        return (
                                            <tr key={product.id}>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-12 h-12 bg-gray-200 rounded overflow-hidden">
                                                            {product.cover_image_url && (
                                                                <img
                                                                    src={product.cover_image_url}
                                                                    alt={product.title}
                                                                    className="w-full h-full object-cover"
                                                                />
                                                            )}
                                                        </div>
                                                        <div>
                                                            <p className="font-semibold text-gray-900">{product.title}</p>
                                                            <p className="text-sm text-gray-500 line-clamp-1">
                                                                {product.description}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="inline-block px-2 py-1 bg-blue-100 text-blue-800 text-xs font-semibold rounded">
                                                        {product.category || 'Uncategorized'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-gray-900 font-semibold">
                                                    {formatPrice(product.price)}
                                                </td>
                                                <td className="px-6 py-4 text-gray-600">
                                                    {sales}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`inline-block px-2 py-1 text-xs font-semibold rounded ${product.is_active
                                                            ? 'bg-green-100 text-green-800'
                                                            : 'bg-gray-100 text-gray-800'
                                                        }`}>
                                                        {product.is_active ? 'Active' : 'Inactive'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-sm text-gray-600">
                                                    {formatDate(product.created_at)}
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <Link
                                                            href={`/shop/${product.id}`}
                                                            className="text-blue-600 hover:text-blue-800 p-2"
                                                            title="View"
                                                        >
                                                            <Eye className="w-4 h-4" />
                                                        </Link>
                                                        <Link
                                                            href={`/admin/products/edit/${product.id}`}
                                                            className="text-green-600 hover:text-green-800 p-2"
                                                            title="Edit"
                                                        >
                                                            <Edit2 className="w-4 h-4" />
                                                        </Link>
                                                        <button
                                                            className="text-red-600 hover:text-red-800 p-2"
                                                            title="Delete"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </main>
    );
}
