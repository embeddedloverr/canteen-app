'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { QrCode, ChefHat, Clock, Smartphone, ArrowRight, Star } from 'lucide-react';
import { Button } from '@/components/ui';

const features = [
  {
    icon: QrCode,
    title: 'Scan & Order',
    description: 'Simply scan the QR code at your table to start ordering instantly.',
  },
  {
    icon: Smartphone,
    title: 'Easy Menu',
    description: 'Browse our delicious menu with photos, descriptions, and prices.',
  },
  {
    icon: Clock,
    title: 'Real-time Tracking',
    description: 'Track your order status and get notified when its ready.',
  },
  {
    icon: ChefHat,
    title: 'Fresh & Fast',
    description: 'Our kitchen prepares your food fresh with estimated delivery times.',
  },
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gray-950">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-orange-500/20 via-transparent to-red-500/20" />
        <div className="absolute top-20 left-10 w-72 h-72 bg-orange-500/30 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-72 h-72 bg-red-500/30 rounded-full blur-3xl" />

        <div className="relative max-w-6xl mx-auto px-4 py-20 lg:py-32">
          <div className="text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-400 text-sm mb-6">
                <Star className="w-4 h-4" />
                Fast, Easy & Contactless Ordering
              </span>

              <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight">
                Order Food
                <span className="gradient-text block">Instantly</span>
              </h1>

              <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-10">
                Scan the QR code at your table, browse our menu, and place your order.
                Track your order in real-time and enjoy your meal!
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link href="/staff">
                  <Button size="lg" className="min-w-[200px]">
                    Staff Dashboard
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </Link>
                <Link href="/admin/menu">
                  <Button size="lg" variant="outline" className="min-w-[200px]">
                    Admin Panel
                  </Button>
                </Link>
              </div>
            </motion.div>

            {/* Floating QR Demo */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="mt-16"
            >
              <div className="relative inline-block">
                <div className="absolute inset-0 bg-gradient-to-r from-orange-500 to-red-500 rounded-3xl blur-2xl opacity-50" />
                <div className="relative bg-gray-900 border border-gray-800 rounded-3xl p-8 shadow-2xl">
                  <div className="w-48 h-48 bg-white rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <QrCode className="w-32 h-32 text-gray-900" />
                  </div>
                  <p className="text-gray-400 text-sm">Scan to start ordering</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              How It Works
            </h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              A seamless ordering experience from start to finish
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="relative group"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-orange-500/10 to-red-500/10 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative bg-gray-900/50 border border-gray-800 rounded-2xl p-6 hover:border-gray-700 transition-colors">
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-r from-orange-500 to-red-500 flex items-center justify-center mb-4">
                    <feature.icon className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">{feature.title}</h3>
                  <p className="text-gray-400">{feature.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="relative"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-orange-500 to-red-500 rounded-3xl blur-2xl opacity-30" />
            <div className="relative bg-gradient-to-r from-orange-500 to-red-500 rounded-3xl p-12 text-center">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                Ready to Get Started?
              </h2>
              <p className="text-white/80 text-lg mb-8 max-w-xl mx-auto">
                Access the admin panel to set up your menu and generate QR codes for your tables.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link href="/admin/menu">
                  <Button size="lg" className="bg-white text-orange-600 hover:bg-gray-100 min-w-[200px]">
                    Manage Menu
                  </Button>
                </Link>
                <Link href="/admin/tables">
                  <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10 min-w-[200px]">
                    Generate QR Codes
                  </Button>
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-800 py-8 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <p className="text-gray-500">
            © {new Date().getFullYear()} Canteen Express. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
