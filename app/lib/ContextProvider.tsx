'use client';

import React, { createContext, useContext, useState } from 'react';
import { Industry, UserPersona } from './types';

interface AppContextType {
  industry: string;
  setIndustry: (industry: string) => void;
  companyName: string;
  setCompanyName: (name: string) => void;
  country: string;
  setCountry: (country: string) => void;
  userPersona: string;
  setUserPersona: (persona: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppContextProvider({ children }: { children: React.ReactNode }) {
  const [industry, setIndustry] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [country, setCountry] = useState("United States");
  const [userPersona, setUserPersona] = useState('');

  return (
    <AppContext.Provider
      value={{
        industry,
        setIndustry,
        companyName,
        setCompanyName,
        country,
        setCountry,
        userPersona,
        setUserPersona,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppContextProvider');
  }
  return context;
}