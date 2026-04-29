/**
 * App.tsx
 * -------
 * Componente raiz da aplicação. Aqui montamos os providers globais e
 * declaramos as rotas. Não existe mais rota /auth — o login é feito de
 * forma automática (anônima) dentro do AuthProvider, então o usuário cai
 * direto no dashboard.
 */

import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import Index from "./pages/Index";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";

// Cliente do React Query — gerencia cache e estado de chamadas assíncronas.
const queryClient = new QueryClient();

const App = () => (
  // QueryClientProvider: disponibiliza o cache do React Query para toda a árvore.
  <QueryClientProvider client={queryClient}>
    {/* TooltipProvider: necessário pelo Radix para tooltips funcionarem em qualquer lugar. */}
    <TooltipProvider>
      {/* Dois sistemas de toast distintos: shadcn (Toaster) e Sonner. */}
      <Toaster />
      <Sonner />
      <BrowserRouter>
        {/* AuthProvider envolve as rotas para que `useAuth()` esteja disponível. */}
        <AuthProvider>
          <Routes>
            {/* Rota principal — protegida: aguarda existir um usuário (anônimo ou não). */}
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <Index />
                </ProtectedRoute>
              }
            />
            <Route
              path="/settings"
              element={
                <ProtectedRoute>
                  <Settings />
                </ProtectedRoute>
              }
            />
            {/* Catch-all: qualquer rota desconhecida cai aqui. Mantenha por último. */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
