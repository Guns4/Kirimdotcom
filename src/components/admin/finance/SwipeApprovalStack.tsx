'use client';

import { useState, useEffect } from 'react';
import {
  motion,
  useMotionValue,
  useTransform,
  AnimatePresence,
} from 'framer-motion';
import {
  CheckCircle,
  XCircle,
  Info,
  CreditCard,
  AlertTriangle,
} from 'lucide-react';
import {
  approveWithdrawalSwipe,
  rejectWithdrawalSwipe,
} from '@/app/actions/swipe-approval';
import { toast } from 'sonner';

interface SwipeItem {
  id: string;
  userId: string;
  email: string;
  amount: number;
  bankDetails: string;
  riskScore: number;
  date: string;
}

export function SwipeApprovalStack({
  initialItems,
}: {
  initialItems: SwipeItem[];
}) {
  const [cards, setCards] = useState<SwipeItem[]>(initialItems);

  const handleSwipe = async (id: string, direction: 'right' | 'left') => {
    // Haptic Feedback
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(50);
    }

    // Optimistic UI update
    const item = cards.find((c) => c.id === id);
    setCards((prev) => prev.filter((c) => c.id !== id));

    try {
      if (direction === 'right') {
        await approveWithdrawalSwipe(id);
        toast.success(`Approved: Rp ${item?.amount.toLocaleString()}`);
      } else {
        // Determine reason (could include a modal for custom reason)
        const reason = 'Quick Reject (Swipe)';
        await rejectWithdrawalSwipe(id, reason);
        toast.info(`Rejected: ${item?.email}`);
      }
    } catch (error) {
      console.error(error);
      toast.error('Failed to process action');
      // Revert changes if needed (complex in stack, usually just show error)
    }
  };

  if (cards.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-96 text-gray-500">
        <CheckCircle className="w-16 h-16 mb-4 text-green-500 opacity-50" />
        <p className="text-xl font-bold">All caught up!</p>
        <p className="text-sm">No pending withdrawals.</p>
      </div>
    );
  }

  return (
    <div className="relative w-full max-w-md mx-auto h-[500px] flex items-center justify-center">
      <AnimatePresence>
        {cards
          .map((card, index) => {
            const isFront = index === cards.length - 1;
            return (
              <Card
                key={card.id}
                data={card}
                active={isFront}
                onRemove={(dir) => handleSwipe(card.id, dir)}
              />
            );
          })
          .reverse()}
      </AnimatePresence>

      <div className="absolute -bottom-16 flex gap-8">
        <button className="p-4 bg-white rounded-full shadow-lg text-red-500 hover:bg-red-50 transition-colors">
          <XCircle className="w-8 h-8" />
        </button>
        <button className="p-4 bg-white rounded-full shadow-lg text-green-500 hover:bg-green-50 transition-colors">
          <CheckCircle className="w-8 h-8" />
        </button>
      </div>
    </div>
  );
}

function Card({
  data,
  active,
  onRemove,
}: {
  data: SwipeItem;
  active: boolean;
  onRemove: (dir: 'left' | 'right') => void;
}) {
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-25, 25]);
  const opacity = useTransform(x, [-200, -100, 0, 100, 200], [0, 1, 1, 1, 0]);

  // Background color change on drag
  // const bg = useTransform(x, [-150, 0, 150], ["rgb(254, 226, 226)", "rgb(255, 255, 255)", "rgb(220, 252, 231)"]);

  const handleDragEnd = (_: any, info: any) => {
    if (Math.abs(info.offset.x) > 100) {
      const direction = info.offset.x > 0 ? 'right' : 'left';
      onRemove(direction);
    }
  };

  return (
    <motion.div
      drag={active ? 'x' : false}
      dragConstraints={{ left: 0, right: 0 }}
      style={{ x, rotate, opacity }}
      onDragEnd={handleDragEnd}
      initial={{ scale: 0.95, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ x: x.get() < 0 ? -200 : 200, opacity: 0 }}
      className="absolute top-0 w-full bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden cursor-grab active:cursor-grabbing"
    >
      {/* Status Overlay */}
      <motion.div
        style={{ opacity: useTransform(x, [50, 150], [0, 1]) }}
        className="absolute top-8 left-8 border-4 border-green-500 text-green-500 px-4 py-2 rounded-xl text-4xl font-bold rotate-[-15deg] z-10"
      >
        APPROVE
      </motion.div>
      <motion.div
        style={{ opacity: useTransform(x, [-150, -50], [1, 0]) }}
        className="absolute top-8 right-8 border-4 border-red-500 text-red-500 px-4 py-2 rounded-xl text-4xl font-bold rotate-[15deg] z-10"
      >
        REJECT
      </motion.div>

      {/* Content */}
      <div className="p-8 h-[450px] flex flex-col">
        <div className="flex justify-between items-center mb-6">
          <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-bold">
            WITHRAWAL
          </span>
          <span className="text-gray-400 text-xs">
            {new Date(data.date).toLocaleDateString()}
          </span>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center text-center">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4 text-2xl font-bold text-gray-500">
            {data.email.charAt(0).toUpperCase()}
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-1">{data.email}</h3>
          <p className="text-3xl font-bold text-gray-900 mb-6">
            Rp {data.amount.toLocaleString('id-ID')}
          </p>

          <div className="w-full bg-gray-50 p-4 rounded-xl text-left mb-4">
            <div className="flex items-center gap-2 mb-2">
              <CreditCard className="w-4 h-4 text-gray-400" />
              <span className="text-sm font-semibold text-gray-700">
                Bank Details
              </span>
            </div>
            <p className="text-sm text-gray-600 break-words">
              {data.bankDetails}
            </p>
          </div>

          {data.riskScore > 50 && (
            <div className="flex items-center gap-2 text-red-600 bg-red-50 px-4 py-2 rounded-lg">
              <AlertTriangle className="w-4 h-4" />
              <span className="text-xs font-bold">
                High Risk Score: {data.riskScore}
              </span>
            </div>
          )}
        </div>

        <div className="text-center text-gray-400 text-xs mt-6">
          Swipe right to approve • Swipe left to reject
        </div>
      </div>
    </motion.div>
  );
}
