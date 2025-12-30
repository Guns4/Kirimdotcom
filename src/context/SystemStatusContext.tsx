'use client';

import {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
} from 'react';

type SystemStatus = 'normal' | 'degraded' | 'down';

interface SystemStatusContextType {
  status: SystemStatus;
  reportError: () => void;
  resetStatus: () => void;
}

const SystemStatusContext = createContext<SystemStatusContextType | undefined>(
  undefined
);

export function SystemStatusProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<SystemStatus>('normal');

  const reportError = () => {
    // Only escalate if not already down
    if (status !== 'down') {
      setStatus('degraded');
      // Auto reset after 5 minutes? Or keep it for session.
      // Let's keep it for session to persist the "transparency"
    }
  };

  const resetStatus = () => {
    setStatus('normal');
  };

  return (
    <SystemStatusContext.Provider value={{ status, reportError, resetStatus }}>
      {children}
    </SystemStatusContext.Provider>
  );
}

export function useSystemStatus() {
  const context = useContext(SystemStatusContext);
  if (context === undefined) {
    throw new Error(
      'useSystemStatus must be used within a SystemStatusProvider'
    );
  }
  return context;
}
