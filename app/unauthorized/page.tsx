'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ShieldAlert, ArrowLeft } from 'lucide-react';
import '../styles/unauthorized.css';

export default function UnauthorizedPage() {
  return (
    <div className="unauthorized-page">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="unauthorized-content"
      >
        <motion.div
          initial={{ scale: 0.8, rotate: -5, opacity: 0 }}
          animate={{ scale: 1, rotate: 0, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 120, damping: 14 }}
          className="unauthorized-icon"
        >
          <ShieldAlert className="w-14 h-14 text-white" />
        </motion.div>
        <h1 className="unauthorized-title">
          Accès Refusé
        </h1>
        <p className="unauthorized-message">
          Cette zone est réservée aux administrateurs. Votre compte est authentifié mais ne possède pas les autorisations nécessaires.
        </p>
        <div className="unauthorized-actions">
          <Link href="/">
            <Button className="unauthorized-btn-primary">
              <ArrowLeft className="mr-2 w-5 h-5" /> Retour à l&apos;accueil
            </Button>
          </Link>
          <Link href="/sign-in">
            <Button variant="outline" className="unauthorized-btn-secondary">
              Changer de compte
            </Button>
          </Link>
        </div>
        <div className="unauthorized-code">
          Code: 403 UNAUTHORIZED
        </div>
      </motion.div>
    </div>
  );
}
