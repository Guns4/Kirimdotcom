'use client';

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from 'react';

interface LiteModeContextType {
  isLiteMode: boolean;
  toggleLiteMode: () => void;
}

const LiteModeContext = createContext<LiteModeContextType | undefined>(
  undefined
);

export function LiteModeProvider({ children }: { children: ReactNode }) {
  const [isLiteMode, setIsLiteMode] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem('lite_mode');
    if (saved === 'true') setIsLiteMode(true);
  }, []);

  const toggleLiteMode = () => {
    const newVal = !isLiteMode;
    setIsLiteMode(newVal);
    localStorage.setItem('lite_mode', String(newVal));
  };

  // Prevent hydration mismatch by rendering simpler version or just returning children
  // Ideally, if it affects layout significantly, we might want to wait for mount
  // But for class toggles, it's fine.

  return (
    <LiteModeContext.Provider value={{ isLiteMode, toggleLiteMode }}>
      {children}
    </LiteModeContext.Provider>
  );
}

export const useLiteMode = () => {
  const context = useContext(LiteModeContext);
  if (!context)
    throw new Error('useLiteMode must be used within LiteModeProvider');
  return context;
};
