'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { Gamepad2, Chrome as Home, Trophy, DollarSign, ChartBar as BarChart3, Shield } from 'lucide-react';
import { UserButton, SignInButton, useUser } from '@clerk/nextjs';

const navItems = [
  { href: '/', label: 'Accueil', icon: Home },
  { href: '/matchs', label: 'Matchs', icon: Gamepad2 },
  { href: '/parier', label: 'Parier', icon: DollarSign },
  { href: '/resultats', label: 'Résultats', icon: BarChart3 },
];

const adminItems = [
  { href: '/admin/equipes', label: 'Équipes', icon: Shield },
  { href: '/admin/matchs', label: 'Admin Matchs', icon: Trophy },
];

export default function Navigation() {
  const pathname = usePathname();
  const { isSignedIn, user } = useUser();

  // Déterminer si l'utilisateur est admin (publicMetadata.role ou liste d'IDs côté client)
  const adminIds = (process.env.NEXT_PUBLIC_ADMIN_USER_IDS || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
  const isAdmin = !!(
    isSignedIn && (
      (user?.publicMetadata as any)?.role === 'admin' ||
      (user?.id && adminIds.includes(user.id))
    )
  );

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-lg border-b border-gray-200"
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link href="/">
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="flex items-center space-x-2"
            >
              <Gamepad2 className="w-8 h-8 text-copper" />
              <span className="text-2xl font-bold bg-gradient-to-r from-copper to-teal bg-clip-text text-transparent">
                GrandPari
              </span>
            </motion.div>
          </Link>

          <div className="flex items-center space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;

              return (
                <Link key={item.href} href={item.href}>
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                      isActive
                        ? 'bg-copper text-white'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="font-medium">{item.label}</span>
                  </motion.div>
                </Link>
              );
            })}

            <div className="w-px h-6 bg-gray-300 mx-2" />

            {isAdmin && (
              <>
                {adminItems.map((item) => {
                  const Icon = item.icon;
                  const active = pathname === item.href;
                  return (
                    <Link key={item.href} href={item.href}>
                      <motion.div
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                          active
                            ? 'bg-teal text-white'
                            : 'text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        <span className="font-medium text-sm">{item.label}</span>
                      </motion.div>
                    </Link>
                  );
                })}
              </>
            )}

            <div className="w-px h-6 bg-gray-300 mx-2" />

            <div className="flex items-center space-x-3">
              {isSignedIn ? (
                <div className="flex items-center space-x-3">
                  <div className="flex flex-col items-end leading-tight">
                    <span className="text-sm text-gray-600">
                      Bonjour, {user?.firstName || 'Utilisateur'}
                    </span>
                    {isAdmin && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-teal text-white font-semibold tracking-wide">
                        ADMIN
                      </span>
                    )}
                  </div>
                  <UserButton 
                    appearance={{
                      elements: {
                        avatarBox: 'w-8 h-8',
                      }
                    }}
                  />
                </div>
              ) : (
                <SignInButton mode="modal">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="bg-gradient-to-r from-copper to-copper-600 hover:from-copper-600 hover:to-copper-700 text-white px-4 py-2 rounded-lg font-medium"
                  >
                    Se connecter
                  </motion.button>
                </SignInButton>
              )}
            </div>
          </div>
        </div>
      </div>
    </motion.nav>
  );
}
