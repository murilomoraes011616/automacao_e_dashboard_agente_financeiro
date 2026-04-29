/**
 * ProtectedRoute
 * --------------
 * Componente "guardião" de rota. Como agora o login é automático e anônimo,
 * a única coisa que precisamos fazer é esperar o AuthProvider terminar de
 * inicializar (criar/recuperar a sessão) antes de renderizar a página filha.
 *
 * Enquanto carrega, exibe um spinner centralizado em tela cheia.
 */

import { useAuth } from "@/contexts/AuthContext";
import { Loader2 } from "lucide-react";

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  // Estado de boot: ainda não sabemos se há sessão ou estamos criando a anônima.
  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Sessão garantida — renderiza a tela protegida.
  return <>{children}</>;
}
