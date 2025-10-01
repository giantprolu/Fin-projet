'use client';

import { motion } from 'framer-motion';
import { Hexagon, Sparkles, Zap, Circle } from 'lucide-react';

export default function FloatingElements() {
  const elements = [
    { Icon: Hexagon, delay: 0, x: '10%', y: '20%', duration: 8 },
    { Icon: Sparkles, delay: 1, x: '80%', y: '15%', duration: 6 },
    { Icon: Zap, delay: 2, x: '15%', y: '70%', duration: 7 },
    { Icon: Circle, delay: 0.5, x: '85%', y: '65%', duration: 9 },
    { Icon: Hexagon, delay: 1.5, x: '50%', y: '80%', duration: 7.5 },
  ];

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden">
      {elements.map((element, index) => {
        const Icon = element.Icon;
        return (
          <motion.div
            key={index}
            initial={{ opacity: 0 }}
            animate={{
              opacity: [0.1, 0.3, 0.1],
              y: [0, -30, 0],
              rotate: [0, 180, 360],
            }}
            transition={{
              duration: element.duration,
              repeat: Infinity,
              delay: element.delay,
            }}
            style={{
              position: 'absolute',
              left: element.x,
              top: element.y,
            }}
          >
            <Icon className="w-16 h-16 text-copper/20" />
          </motion.div>
        );
      })}

      <motion.div
        className="absolute top-1/4 left-1/4 w-96 h-96 bg-copper/5 rounded-full blur-3xl"
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
        }}
      />

      <motion.div
        className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-teal/5 rounded-full blur-3xl"
        animate={{
          scale: [1.2, 1, 1.2],
          opacity: [0.5, 0.3, 0.5],
        }}
        transition={{
          duration: 12,
          repeat: Infinity,
        }}
      />
    </div>
  );
}
