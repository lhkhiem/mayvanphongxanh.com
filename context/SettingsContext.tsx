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
    let val = initialSettings[key];
    if (!val && key === 'site_logo') val = initialSettings['company_logo'];
    if (!val && key === 'company_logo') val = initialSettings['site_logo'];
    if (!val && key === 'site_favicon') val = initialSettings['company_favicon'];
    if (!val && key === 'company_favicon') val = initialSettings['site_favicon'];
    val = val || defaultValue;

    if (val && typeof val === 'string') {
      val = val.replace(/^https?:\/\/(0\.0\.0\.0|localhost|127\.0\.0\.1)(:\d+)?/i, '');
    }
    return val;
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
