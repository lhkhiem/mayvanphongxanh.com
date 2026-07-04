'use client';

import React, { createContext, useContext, ReactNode } from 'react';

// Common setting keys: hotline, email, address, logo, facebook, zalo
type SettingsMap = Record<string, string>;

interface SettingsContextType {
  settings: SettingsMap;
  getSetting: (key: string, defaultValue?: string) => string;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ 
  children, 
  initialSettings = {} 
}: { 
  children: ReactNode; 
  initialSettings: SettingsMap;
}) {
  const getSetting = (key: string, defaultValue = '') => {
    return initialSettings[key] || defaultValue;
  };

  return (
    <SettingsContext.Provider value={{ settings: initialSettings, getSetting }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
}
