'use client';
import { Activity } from 'lucide-react';

export function TrafficLiveCard() {
    return (
        <div className="bg-gray-900 text-white p-6 rounded-2xl border border-gray-800 shadow-lg relative overflow-hidden col-span-1 md:col-span-2 lg:col-span-1">
            <div className="flex justify-between items-start mb-6">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <span className="flex h-2 w-2 relative">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                        </span>
                        <span className="text-sm font-medium text-gray-400">Live Traffic</span>
                    </div>
                    <h3 className="text-3xl font-bold">1,248</h3>
                    <p className="text-xs text-gray-500">Active Users Right Now</p>
                </div>
                <div className="p-2 bg-gray-800 rounded-lg text-gray-400">
                    <Activity className="w-5 h-5" />
                </div>
            </div>
            
            {/* Fake Chart Visualization */}
            <div className="flex items-end gap-1 h-16 w-full opacity-50">
                {[40,65,55,80,95,70,60,85,100,75,65,90,80,60,45].map((h, i) => (
                    <div 
                        key={i} 
                        className="flex-1 bg-indigo-500 hover:bg-indigo-400 transition-all rounded-t-sm"
                        style={{ height: `${h}%` }}
                    />
                ))}
            </div>
        </div>
    );
}
