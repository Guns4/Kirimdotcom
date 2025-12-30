'use client';

import { motion } from 'framer-motion';
import { Sparkles, Lightbulb, TrendingUp, AlertTriangle } from 'lucide-react';

interface AIInsightProps {
  message: string;
  type?: 'info' | 'success' | 'warning' | 'tip';
  className?: string;
}

export function AIInsight({
  message,
  type = 'info',
  className = '',
}: AIInsightProps) {
  const getIcon = () => {
    switch (type) {
      case 'success':
        return (
          <Sparkles className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
        );
      case 'warning':
        return (
          <AlertTriangle className="w-5 h-5 text-yellow-400 mt-0.5 flex-shrink-0" />
        );
      case 'tip':
        return (
          <Lightbulb className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
        );
      default:
        return (
          <Sparkles className="w-5 h-5 text-purple-400 mt-0.5 flex-shrink-0" />
        );
    }
  };

  const getColorClasses = () => {
    switch (type) {
      case 'success':
        return 'from-green-500/10 to-emerald-500/10 border-green-500/30';
      case 'warning':
        return 'from-yellow-500/10 to-orange-500/10 border-yellow-500/30';
      case 'tip':
        return 'from-blue-500/10 to-cyan-500/10 border-blue-500/30';
      default:
        return 'from-purple-500/10 to-indigo-500/10 border-purple-500/30';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className={`glass-card p-4 bg-gradient-to-r ${getColorClasses()} ${className}`}
    >
      <div className="flex items-start gap-3">
        {getIcon()}
        <div className="flex-1">
          <p className="text-sm font-semibold text-purple-300 mb-1">
            AI Insight
          </p>
          <p className="text-sm text-gray-300">{message}</p>
        </div>
      </div>
    </motion.div>
  );
}
