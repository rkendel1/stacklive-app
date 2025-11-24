import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';

interface HideUIContextType {
  hideUI: boolean;
  setHideUI: (value: boolean) => void;
  hideSearchBar: boolean;
  setHideSearchBar: (value: boolean) => void;
}

const HideUIContext = createContext<HideUIContextType | undefined>(undefined);

export function HideUIProvider({ children }: { children: ReactNode }) {
  const [hideUI, setHideUI] = useState(false);
  const [hideSearchBar, setHideSearchBar] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem('hideSearchBar').then((val) => {
      if (val !== null) {
        setHideSearchBar(JSON.parse(val));
      }
    });
  }, []);

  useEffect(() => {
    AsyncStorage.setItem('hideSearchBar', JSON.stringify(hideSearchBar));
  }, [hideSearchBar]);

  return (
    <HideUIContext.Provider value={{ hideUI, setHideUI, hideSearchBar, setHideSearchBar }}>
      {children}
    </HideUIContext.Provider>
  );
}

export function useHideUI() {
  const context = useContext(HideUIContext);
  if (context === undefined) {
    throw new Error('useHideUI must be used within a HideUIProvider');
  }
  return context;
}