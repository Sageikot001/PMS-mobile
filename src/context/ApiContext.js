import React, { createContext, useContext, useMemo } from 'react';
import api, { AuthService } from '../lib/api';

const ApiContext = createContext(null);

export const ApiProvider = ({ children }) => {
  // Expose unified api and selected auth helpers
  const value = useMemo(() => ({
    api,
    auth: AuthService,
  }), []);

  return (
    <ApiContext.Provider value={value}>
      {children}
    </ApiContext.Provider>
  );
};

export const useApiClient = () => {
  const ctx = useContext(ApiContext);
  if (!ctx) throw new Error('useApiClient must be used within an ApiProvider');
  return ctx;
};

export default ApiContext;



