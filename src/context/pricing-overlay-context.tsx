"use client";

import React, { createContext, useContext, useState, ReactNode } from 'react';

interface PricingOverlayContextType {
  isOpen: boolean;
  openOverlay: () => void;
  closeOverlay: () => void;
}

const PricingOverlayContext = createContext<PricingOverlayContextType | undefined>(undefined);

export const usePricingOverlay = () => {
  const context = useContext(PricingOverlayContext);
  if (!context) {
    throw new Error('usePricingOverlay must be used within a PricingOverlayProvider');
  }
  return context;
};

interface PricingOverlayProviderProps {
  children: ReactNode;
}

export const PricingOverlayProvider = ({ children }: PricingOverlayProviderProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const openOverlay = () => setIsOpen(true);
  const closeOverlay = () => setIsOpen(false);

  return (
    <PricingOverlayContext.Provider value={{ isOpen, openOverlay, closeOverlay }}>
      {children}
    </PricingOverlayContext.Provider>
  );
};
