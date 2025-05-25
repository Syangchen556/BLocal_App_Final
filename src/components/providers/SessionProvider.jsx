'use client';

import { SessionProvider } from 'next-auth/react';

export default function AuthProvider({ children }) {
  return (
    <SessionProvider
      // Re-fetch session every hour
      refetchInterval={3600}
      // Re-fetch session when window focuses
      refetchOnWindowFocus={true}
    >
      {children}
    </SessionProvider>
  );
}