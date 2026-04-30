/**
 * AuthContext (modo demo, sem login)
 * ----------------------------------
 * Não há autenticação. Mantido apenas para compatibilidade — alguns
 * componentes ainda importam `useAuth`, mas nenhum dado real depende dele.
 */
import { createContext, useContext } from "react";

interface AuthContextType {
  user: { id: string; email: string };
  loading: boolean;
  signOut: () => Promise<void>;
}

const demoUser = { id: "demo-user", email: "demo@mitra.app" };

const AuthContext = createContext<AuthContextType>({
  user: demoUser,
  loading: false,
  signOut: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  return (
    <AuthContext.Provider value={{ user: demoUser, loading: false, signOut: async () => {} }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
