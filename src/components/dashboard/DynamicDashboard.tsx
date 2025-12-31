'use client';

import React from 'react';
import { getLayoutForPersona, Persona, WidgetConfig } from '@/lib/dashboard/layout-engine';

// Mock Components for Demo
const Components: any = {
    SalesChart: () => <div className="h-40 bg-blue-100 flex items-center justify-center">Sales Chart Placeholder</div>,
    OrderList: () => <div className="h-40 bg-white border p-4">Order List...</div>,
    SupplyPromo: () => <div className="h-40 bg-orange-100 flex items-center justify-center">Buy Bubble Wrap!</div>,
    TrackingWidget: () => <div className="h-40 bg-gray-100 p-4">Input Resi Here...</div>,
    PromoCarousel: () => <div className="h-32 bg-gradient-to-r from-purple-500 to-pink-500 text-white p-4">Super Promo!</div>,
    DailySpin: () => <div className="h-40 bg-yellow-100 text-center p-4">🎰 Spin & Win</div>,
    CommissionChart: () => <div className="h-40 bg-green-100 p-4">Total Earnings: Rp 5.000.000</div>,
    RouteStats: () => <div className="h-40 bg-gray-50 p-4">Jkt -> Bdg is trending</div>,
    NewsFeed: () => <div className="h-40 bg-white p-4">New Agent Policy...</div>,
    WelcomeGuide: () => <div className="h-60 bg-indigo-50 p-8 text-center text-lg">Welcome! Let's verify your identity.</div>
};

export default function DynamicDashboard({ persona }: { persona: Persona }) {
    const layout = getLayoutForPersona(persona);

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
            {layout.map((widget: WidgetConfig) => {
                const Component = Components[widget.componentName];
                const colSpan = widget.size === 'full' ? 'md:col-span-2' : 'md:col-span-1';

                return (
                    <div key={widget.id} className={`${colSpan} bg-white shadow rounded-lg overflow-hidden`}>
                        <div className="bg-gray-50 px-4 py-2 border-b font-medium text-sm text-gray-600">
                            {widget.title}
                        </div>
                        <div className="p-0">
                            {Component ? <Component /> : <div>Widget Not Found</div>}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
