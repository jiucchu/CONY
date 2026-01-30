'use client';

import React from 'react';
import { motion, Variants } from 'framer-motion';
import AlertItem from './AlertItem';

interface AlertData {
  id: number;
  type: 'EXPIRATION' | 'LOCATION';
  brandName: string;
  productName: string;
  imageUrl: string;
  userName: string;
  remainingDays?: number;
  distance?: number;
}

interface AlertListProps {
  alerts: AlertData[];
}

const itemVariants: Variants = {
  offscreen: { opacity: 0, y: 10 },
  onscreen: { 
    opacity: 1, 
    y: 0,
    transition: { 
      duration: 0.3, 
      ease: "easeOut"
    }
  },
};

const AlertList = ({ alerts }: AlertListProps) => {
  if (!alerts || alerts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-gray-400">
        <p className="text-sm">새로운 알림이 없습니다.</p>
      </div>
    );
  }

  return (
    <div 
      className="flex-1 w-full overflow-y-auto bg-white no-scrollbar" 
      style={{ msOverflowStyle: 'none', scrollbarWidth: 'none' }}
    >
      <style jsx>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
      `}</style>
      
      <div className="flex flex-col w-full pb-10">
        {alerts.map((alert) => (
          <motion.div 
            key={alert.id}
            initial="offscreen"
            whileInView="onscreen"
            viewport={{ once: true, amount: 0.2 }}
            variants={itemVariants}
          >
            <AlertItem {...alert} />
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default AlertList;