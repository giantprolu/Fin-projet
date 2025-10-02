'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ShieldAlert, ArrowLeft } from 'lucide-react';

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-white to-copper-50 px-4 py-24">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-lg text-center"
      >
        <motion.div
          initial={{ scale: 0.8, rotate: -5, opacity: 0 }}
          animate={{ scale: 1, rotate: 0, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 120, damping: 14 }}
          className="w-28 h-28 mx-auto mb-8 rounded-3xl bg-gradient-to-br from-teal to-copper shadow-xl flex items-center justify-center"
        >
          <ShieldAlert className="w-14 h-14 text-white" />
        </motion.div>
        <h1 className="text-4xl font-extrabold mb-4 bg-gradient-to-r from-teal via-copper to-gray-900 bg-clip-text text-transparent">
          Accès Refusé
        </h1>
        <p className="text-gray-600 text-lg leading-relaxed mb-8">
          Cette zone est réservée aux administrateurs. Votre compte est authentifié mais ne possède pas les autorisations nécessaires.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/">
            <Button className="bg-copper hover:bg-copper-600 text-white font-semibold px-6 py-5 rounded-xl">
              <ArrowLeft className="mr-2 w-5 h-5" /> Retour à l&apos;accueil
            </Button>
          </Link>
          <Link href="/sign-in">
            <Button variant="outline" className="border-2 border-teal text-teal hover:bg-teal hover:text-white font-semibold px-6 py-5 rounded-xl">
              Changer de compte
            </Button>
          </Link>
        </div>
        <div className="mt-10 text-xs text-gray-400 tracking-wide">
          Code: 403 UNAUTHORIZED
        </div>
      </motion.div>
    </div>
  );
}
