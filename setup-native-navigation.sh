#!/bin/bash

# setup-native-navigation.sh
# User Experience (Phase 1911-1920)
# features: MobileNav (Native), Hide Web Elements, Tab Bar

echo ">>> Setting up Native Mobile Navigation..."

# 1. Update/Create useNativeUI Hook to handle Body Class & Detection
mkdir -p src/hooks
cat > src/hooks/useNativeUI.ts <<EOF
'use client';

import { useEffect, useState } from 'react';
import { Capacitor } from '@capacitor/core';

export function useNativeUI() {
  const [isNative, setIsNative] = useState(false);

  useEffect(() => {
    // Check if running on Capacitor Native Platform (Android/iOS)
    // Note: 'web' platform is returned when running via 'ionic serve' or browser
    const platform = Capacitor.getPlatform();
    const isCapacitor = platform === 'ios' || platform === 'android';
    
    setIsNative(isCapacitor);

    if (isCapacitor) {
      document.body.classList.add('native-app');
    } else {
      document.body.classList.remove('native-app');
    }
  }, []);

  return { isNative };
}
EOF

# 2. Create MobileNav Component (The Native Tab Bar)
mkdir -p src/components/layout
cat > src/components/layout/MobileNav.tsx <<EOF
'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Package, ScanLine, Wallet, User } from 'lucide-react';
import { useNativeUI } from '@/hooks/useNativeUI';
import { motion } from 'framer-motion';

export default function MobileNav() {
  const { isNative } = useNativeUI();
  const pathname = usePathname();

  // ONLY render if we are in Native App mode
  if (!isNative) return null;

  const tabs = [
    { id: 'home', label: 'Home', icon: Home, href: '/dashboard' },
    { id: 'track', label: 'Lacak', icon: Package, href: '/bulk-tracking' },
    { id: 'scan', label: 'Scan', icon: ScanLine, href: '/scan', isFab: true }, // Central FAB
    { id: 'wallet', label: 'Dompet', icon: Wallet, href: '/dashboard/wallet' },
    { id: 'profile', label: 'Akun', icon: User, href: '/dashboard/settings' },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[9999] bg-white border-t border-gray-200 pb-safe shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
      <div className="flex justify-between items-center h-16 px-4">
        {tabs.map((tab) => {
          const isActive = pathname === tab.href;
          const Icon = tab.icon;

          if (tab.isFab) {
            return (
              <div key={tab.id} className="relative -top-6">
                <Link href={tab.href}>
                  <div className="w-14 h-14 bg-gradient-to-br from-indigo-600 to-violet-600 rounded-full flex items-center justify-center text-white shadow-lg shadow-indigo-500/30 active:scale-95 transition-transform">
                    <Icon className="w-7 h-7" strokeWidth={2} />
                  </div>
                </Link>
              </div>
            );
          }

          return (
            <Link
              key={tab.id}
              href={tab.href}
              className="flex flex-col items-center justify-center w-12"
            >
              <div className={\`relative p-1 rounded-xl transition-all duration-300 \${isActive ? 'text-indigo-600' : 'text-gray-400'}\`}>
                <Icon className="w-6 h-6" strokeWidth={isActive ? 2.5 : 2} />
                {isActive && (
                  <motion.div
                     layoutId="native-tab"
                     className="absolute -bottom-2 w-1 h-1 bg-indigo-600 rounded-full left-1/2 -translate-x-1/2"
                  />
                )}
              </div>
              <span className={\`text-[10px] font-medium mt-1 \${isActive ? 'text-indigo-600' : 'text-gray-400'}\`}>
                {tab.label}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
EOF

# 3. Add CSS to Hide Web Elements in Native Mode
# We append to globals.css if not already present
if ! grep -q "native-app" src/app/globals.css; then
  echo "" >> src/app/globals.css
  echo "/* --- NATIVE APP MODE UTILITIES --- */" >> src/app/globals.css
  echo "/* Hides web navbar/footer when body has .native-app class (injected by useNativeUI) */" >> src/app/globals.css
  echo "body.native-app header," >> src/app/globals.css
  echo "body.native-app footer," >> src/app/globals.css
  echo "body.native-app .web-navbar," >> src/app/globals.css
  echo "body.native-app .web-footer," >> src/app/globals.css
  echo "body.native-app .web-bottom-nav { display: none !important; }" >> src/app/globals.css
  echo "" >> src/app/globals.css
  echo "/* Add padding for native bottom nav */" >> src/app/globals.css
  echo "body.native-app main { padding-bottom: 80px !important; margin-top: 0 !important; }" >> src/app/globals.css
fi

echo ">>> Components Created."
echo ">>> INSTRUCTIONS:"
echo "1. Open 'src/app/layout.tsx'."
echo "2. Import MobileNav: import MobileNav from '@/components/layout/MobileNav';"
echo "3. Place <MobileNav /> inside the <body>, preferably at the end."
echo "4. Ensure your Navbar/Footer components have className='web-navbar' / 'web-footer' if they aren't <header>/<footer> tags."
