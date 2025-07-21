
"use client";

import * as React from 'react';
import { useData } from './data-context';

interface RefreshContextType {
  refreshKey: number;
  triggerRefresh: () => void;
}

const RefreshContext = React.createContext<RefreshContextType | undefined>(undefined);

export function RefreshProvider({ children }: { children: React.ReactNode }) {
  const { triggerRefresh: triggerDataRefresh } = useData();
  const [refreshKey, setRefreshKey] = React.useState(0);
  
  const triggerRefresh = () => {
    setRefreshKey(prevKey => prevKey + 1);
    triggerDataRefresh();
  };

  return (
    <RefreshContext.Provider value={{ refreshKey, triggerRefresh }}>
      {children}
    </RefreshContext.Provider>
  );
}

export function useRefresh() {
  const context = React.useContext(RefreshContext);
  if (context === undefined) {
    throw new Error('useRefresh must be used within a RefreshProvider');
  }
  return context;
}
