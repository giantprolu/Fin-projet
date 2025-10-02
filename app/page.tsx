'use client';

import { motion, useScroll, useTransform } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Trophy, Users, Shield, Zap, TrendingUp, Award, ArrowRight, Target, Gamepad2 } from 'lucide-react';
import Link from 'next/link';
import { useRef } from 'react';

const features = [
  {
    icon: Trophy,
    title: 'Compétitions Premium',
    description: 'Accédez aux plus grands tournois esports du monde',
  },
  {
    icon: Shield,
    title: 'Sécurité Maximale',
    description: 'Vos paris et données sont protégés par cryptage avancé',
  },
  {
    icon: Zap,
    title: 'Paris en Temps Réel',
    description: 'Pariez pendant les matchs avec des cotes actualisées',
  },
  {
    icon: TrendingUp,
    title: 'Analyses Détaillées',
    description: 'Statistiques et insights pour optimiser vos paris',
  },
];

const steps = [
  {
    number: '01',
    title: 'Créez votre compte',
    description: 'Inscription rapide et sécurisée en quelques clics',
    icon: Users,
  },
  {
    number: '02',
    title: 'Choisissez vos matchs',
    description: 'Explorez les compétitions et sélectionnez vos favoris',
    icon: Gamepad2,
  },
  {
    number: '03',
    title: 'Gagnez des récompenses',
    description: 'Suivez vos gains et débloquez des bonus exclusifs',
    icon: Award,
  },
];

const partners = [
  'RIOT GAMES',
  'VALORANT',
  'CS:GO',
  'LEAGUE OF LEGENDS',
  'DOTA 2',
  'OVERWATCH',
];

export default function Home() {
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ['start start', 'end start'],
  });

  const y = useTransform(scrollYProgress, [0, 1], ['0%', '50%']);
  const opacity = useTransform(scrollYProgress, [0, 1], [1, 0]);

  return (
    <div className="min-h-screen">
      <section
        ref={heroRef}
        className="relative h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-gray-50 via-white to-copper-50"
      >
        <motion.div
          style={{ y, opacity }}
          className="relative z-10 text-center px-4 max-w-5xl mx-auto"
        >
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="mb-6"
          >
            <span className="inline-block px-6 py-2 bg-copper/10 rounded-full text-copper font-semibold text-sm mb-6">
              Plateforme de Paris Esports #1
            </span>
          </motion.div>

          <motion.h1
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-6xl md:text-7xl lg:text-8xl font-bold mb-6 leading-tight"
          >
            <span className="bg-gradient-to-r from-gray-900 via-copper to-teal bg-clip-text text-transparent">
              L&apos;Arène des
            </span>
            <br />
            <span className="bg-gradient-to-r from-teal via-copper to-gray-900 bg-clip-text text-transparent">
              Champions
            </span>
          </motion.h1>

          <motion.p
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-xl md:text-2xl text-gray-600 mb-12 max-w-3xl mx-auto leading-relaxed"
          >
            Plongez dans l&apos;univers électrisant des paris esports.
            Analyses en temps réel, cotes premium et expérience immersive.
          </motion.p>

          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          >
            <Link href="/matchs">
              <Button
                size="lg"
                className="bg-copper hover:bg-copper-600 text-white px-8 py-6 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all group"
              >
                Commencer Maintenant
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Link href="/matchs">
              <Button
                size="lg"
                variant="outline"
                className="border-2 border-teal text-teal hover:bg-teal hover:text-white px-8 py-6 text-lg font-semibold rounded-xl transition-all"
              >
                Explorer les Matchs
              </Button>
            </Link>
          </motion.div>
        </motion.div>

        <motion.div
          className="absolute bottom-0 left-0 w-full h-48 bg-gradient-to-t from-white to-transparent"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
        />
      </section>

      <section className="py-24 px-4 bg-white">
        <div className="container mx-auto max-w-7xl">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-5xl font-bold mb-4 text-gray-900">
              Pourquoi <span className="text-copper">GrandPari</span> ?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Une expérience de paris esports révolutionnaire
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                >
                  <Card className="p-8 h-full hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border-2 border-transparent hover:border-copper/20 bg-gradient-to-br from-white to-gray-50">
                    <motion.div
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      className="w-16 h-16 bg-gradient-to-br from-copper to-copper-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg"
                    >
                      <Icon className="w-8 h-8 text-white" />
                    </motion.div>
                    <h3 className="text-2xl font-bold mb-4 text-gray-900">
                      {feature.title}
                    </h3>
                    <p className="text-gray-600 leading-relaxed">
                      {feature.description}
                    </p>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="py-24 px-4 bg-gradient-to-br from-gray-50 to-copper-50">
        <div className="container mx-auto max-w-7xl">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-20"
          >
            <h2 className="text-5xl font-bold mb-4 text-gray-900">
              Comment ça <span className="text-teal">marche</span> ?
            </h2>
            <p className="text-xl text-gray-600">
              Trois étapes simples pour commencer
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-12 relative">
            {steps.map((step, index) => {
              const Icon = step.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.2 }}
                  className="relative"
                >
                  <div className="text-center">
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      className="relative inline-block mb-8"
                    >
                      <div className="w-24 h-24 bg-gradient-to-br from-copper to-teal rounded-3xl flex items-center justify-center mx-auto shadow-2xl">
                        <Icon className="w-12 h-12 text-white" />
                      </div>
                      <div className="absolute -top-4 -right-4 w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-lg border-4 border-copper">
                        <span className="text-2xl font-bold text-copper">
                          {step.number}
                        </span>
                      </div>
                    </motion.div>
                    <h3 className="text-2xl font-bold mb-4 text-gray-900">
                      {step.title}
                    </h3>
                    <p className="text-gray-600 text-lg leading-relaxed">
                      {step.description}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="py-24 px-4 bg-gradient-to-br from-teal-900 to-teal-700 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzRjMC0yIDItNCAyLTRzMiAyIDIgNHYyYzAgMi0yIDQtMiA0cy0yLTItMi00di0yem0wLTMwYzAtMiAyLTQgMi00czIgMiAyIDR2MmMwIDItMiA0LTIgNHMtMi0yLTItNHYtMnpNMCA0YzAtMiAyLTQgMi00czIgMiAyIDR2MmMwIDItMiA0LTIgNHMtMi0yLTItNHYtMnoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-20" />

        <div className="container mx-auto max-w-7xl relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-5xl font-bold mb-6">
              Rejoignez la <span className="text-copper-300">Communauté</span>
            </h2>
            <p className="text-xl text-teal-100 max-w-3xl mx-auto">
              Des milliers de joueurs font confiance à GrandPari pour vivre leur passion
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8 mb-16">
            {[
              { value: '50K+', label: 'Joueurs Actifs' },
              { value: '1M+', label: 'Paris Placés' },
              { value: '98%', label: 'Satisfaction' },
            ].map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="text-center"
              >
                <div className="text-6xl font-bold text-copper-300 mb-2">
                  {stat.value}
                </div>
                <div className="text-xl text-teal-200">{stat.label}</div>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="text-center"
          >
            <Link href="/parier">
              <Button
                size="lg"
                className="bg-copper hover:bg-copper-600 text-white px-10 py-6 text-lg font-semibold rounded-xl shadow-2xl hover:shadow-copper-500/50 transition-all group"
              >
                <Target className="mr-2 w-5 h-5" />
                Placer votre premier pari
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      <section className="py-20 px-4 bg-white">
        <div className="container mx-auto max-w-7xl">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl font-bold mb-4 text-gray-900">
              Nos <span className="text-copper">Partenaires</span>
            </h2>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="flex flex-wrap justify-center items-center gap-12"
          >
            {partners.map((partner, index) => (
              <motion.div
                key={index}
                whileHover={{ scale: 1.1, y: -5 }}
                className="text-2xl font-bold text-gray-400 hover:text-copper transition-colors"
              >
                {partner}
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      <footer className="bg-gray-900 text-white py-12 px-4">
        <div className="container mx-auto max-w-7xl">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Gamepad2 className="w-8 h-8 text-copper" />
                <span className="text-2xl font-bold">GrandPari</span>
              </div>
              <p className="text-gray-400">
                La plateforme de paris esports nouvelle génération
              </p>
            </div>

            <div>
              <h4 className="font-bold mb-4">Liens Rapides</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/matchs" className="hover:text-copper transition-colors">Matchs</Link></li>
                <li><Link href="/parier" className="hover:text-copper transition-colors">Parier</Link></li>
                <li><Link href="/resultats" className="hover:text-copper transition-colors">Résultats</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold mb-4">Support</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-copper transition-colors">FAQ</a></li>
                <li><a href="#" className="hover:text-copper transition-colors">Contact</a></li>
                <li><a href="#" className="hover:text-copper transition-colors">Aide</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold mb-4">Légal</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-copper transition-colors">Conditions</a></li>
                <li><a href="#" className="hover:text-copper transition-colors">Confidentialité</a></li>
                <li><a href="#" className="hover:text-copper transition-colors">Responsable</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-8 text-center text-gray-400">
            <p>© 2025 GrandPari. Tous droits réservés.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
