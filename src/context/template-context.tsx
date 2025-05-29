"use client";
import { getLatexTemplates, TemplateEntry } from "@/types/latex-template";
import React, { createContext, useContext, useEffect, useState } from "react";

interface TemplateContextType {
  templates: TemplateEntry[] | null;
  loading: boolean;
  error: Error | null;
}

const TemplateContext = createContext<TemplateContextType | undefined>(undefined);

export const TemplateProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [templates, setTemplates] = useState<TemplateEntry[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        const data = await getLatexTemplates();
        setTemplates(data);
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    fetchTemplates();
  }, []);

  return (
    <TemplateContext.Provider value={{ templates, loading, error }}>
      {children}
    </TemplateContext.Provider>
  );
};

export const useTemplateContext = () => {
  const context = useContext(TemplateContext);
  if (!context) {
    throw new Error("useTemplateContext must be used within a TemplateProvider");
  }
  return context;
};
