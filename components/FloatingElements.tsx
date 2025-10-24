'use client';

import { motion } from 'framer-motion';
import { Hexagon, Sparkles, Zap, Circle } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function FloatingElements() {
  const [particles, setParticles] = useState<Array<{ left: string; top: string; duration: number; delay: number }>>([]);
  
  useEffect(() => {
    // Générer les particules côté client uniquement
    const generatedParticles = [...Array(20)].map((_, i) => ({
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      duration: 2 + Math.random() * 3,
      delay: Math.random() * 2,
    }));
    setParticles(generatedParticles);
  }, []);

  const elements = [
    { Icon: Hexagon, delay: 0, x: '10%', y: '20%', duration: 8 },
    { Icon: Sparkles, delay: 1, x: '80%', y: '15%', duration: 6 },
    { Icon: Zap, delay: 2, x: '15%', y: '70%', duration: 7 },
    { Icon: Circle, delay: 0.5, x: '85%', y: '65%', duration: 9 },
    { Icon: Hexagon, delay: 1.5, x: '50%', y: '80%', duration: 7.5 },
    { Icon: Sparkles, delay: 3, x: '25%', y: '45%', duration: 8.5 },
  ];

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {/* Fond animé avec particules */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        {/* Particules lumineuses animées */}
        {particles.map((particle, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-copper rounded-full"
            style={{
              left: particle.left,
              top: particle.top,
            }}
            animate={{
              opacity: [0, 1, 0],
              scale: [0, 1, 0],
            }}
            transition={{
              duration: particle.duration,
              repeat: Infinity,
              delay: particle.delay,
            }}
          />
        ))}
      </div>

      {/* Éléments flottants existants */}
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
        className="absolute top-1/4 left-1/4 w-96 h-96 bg-copper/10 rounded-full blur-3xl"
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.6, 0.3],
          x: [0, 50, 0],
          y: [0, -30, 0],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
        }}
      />

      <motion.div
        className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-teal/10 rounded-full blur-3xl"
        animate={{
          scale: [1.2, 1, 1.2],
          opacity: [0.5, 0.3, 0.5],
          x: [0, -40, 0],
          y: [0, 40, 0],
        }}
        transition={{
          duration: 12,
          repeat: Infinity,
        }}
      />

      {/* Vagues animées */}
      <motion.div
        className="absolute top-0 left-0 w-full h-full"
        style={{
          background: `radial-gradient(circle at 20% 80%, rgba(217, 121, 67, 0.15) 0%, transparent 50%),
                       radial-gradient(circle at 80% 20%, rgba(82, 117, 117, 0.15) 0%, transparent 50%),
                       radial-gradient(circle at 40% 40%, rgba(217, 121, 67, 0.1) 0%, transparent 50%)`,
        }}
        animate={{
          opacity: [0.5, 0.8, 0.5],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
        }}
      />

      {/* Lignes de mouvement */}
      <motion.div
        className="absolute inset-0"
        style={{
          background: `linear-gradient(45deg, transparent 49%, rgba(217, 121, 67, 0.1) 50%, transparent 51%),
                       linear-gradient(-45deg, transparent 49%, rgba(82, 117, 117, 0.1) 50%, transparent 51%)`,
          backgroundSize: '100px 100px',
        }}
        animate={{
          backgroundPosition: ['0px 0px', '100px 100px'],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: 'linear',
        }}
      />
    </div>
  );
}
