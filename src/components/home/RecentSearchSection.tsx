'use client';

import { Trash2, History, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { useSearchHistory } from '@/hooks/useSearchHistory';
import Link from 'next/link';

export default function RecentSearchSection() {
  const { history, clearHistory, removeItem, mounted } = useSearchHistory();

  if (!mounted || history.length === 0) return null;

  return (
    <section className="py-12 bg-gray-50/50">
      <div className="container-custom">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <History className="w-5 h-5 text-indigo-600" />
            <h2 className="text-xl font-bold text-gray-900">
              Pencarian Terakhir
            </h2>
          </div>
          <button
            onClick={clearHistory}
            className="text-sm text-red-500 hover:text-red-700 flex items-center gap-1 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            Hapus Semua
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {history.map((item, index) => (
            <motion.div
              key={`${item.resi}-${index}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all group relative"
            >
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-bold px-2 py-0.5 bg-indigo-50 text-indigo-600 rounded-md uppercase">
                      {item.courier}
                    </span>
                    <span className="text-xs text-gray-400">
                      {new Date(item.timestamp).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                  <p className="font-bold text-gray-900">{item.resi}</p>
                  <p className="text-sm text-gray-500 truncate mt-1 max-w-[200px]">
                    {item.last_status}
                  </p>
                </div>
                <div className="flex flex-col gap-2">
                  <button
                    onClick={() => removeItem(item.resi)}
                    className="text-gray-300 hover:text-red-400 transition-colors p-1"
                    title="Hapus"
                  >
                    <XIcon />
                  </button>
                </div>
              </div>

              <Link
                href={`/tracking?resi=${item.resi}&courier=${item.courier}`}
                className="absolute inset-0 z-10"
                onClick={(e) => {
                  // Prevent clicking delete button
                  if ((e.target as HTMLElement).closest('button')) {
                    e.preventDefault();
                  }
                }}
              />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function XIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </svg>
  );
}
