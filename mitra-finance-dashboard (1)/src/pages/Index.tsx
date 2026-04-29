/**
 * Página Index — dashboard financeiro principal.
 *
 * Fluxo geral:
 *  1. Lê o usuário atual do AuthContext (login automático/anônimo).
 *  2. Busca entradas e saídas do Supabase para esse usuário.
 *  3. Inscreve-se em mudanças realtime nas tabelas `entradas` e `saidas`,
 *     re-buscando os dados sempre que algo muda.
 *  4. Aplica um filtro de período (15/45 dias, ano, mês a mês) sobre as
 *     transações antes de calcular totais e renderizar gráficos.
 */
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { TransactionForm } from "@/components/TransactionForm";
import { SummaryCards } from "@/components/SummaryCards";
import { TransactionHistory } from "@/components/TransactionHistory";
import { ChartsSection } from "@/components/ChartsSection";
import { ThemeToggle } from "@/components/ThemeToggle";
import { PeriodFilter, PeriodType } from "@/components/PeriodFilter";
import { GoalForm } from "@/components/GoalForm";
import { GoalProgress } from "@/components/GoalProgress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RefreshCw, LogOut, Settings as SettingsIcon, Mail, Instagram } from "lucide-react";
import { useNavigate as useNavigateIndex } from "react-router-dom";
import { toast } from "sonner";
import mitraLogo from "@/assets/mitra-logo.jpeg";

interface Transaction {
  id: string;
  type: "entrada" | "saida";
  date: string;
  category: string;
  amount: number;
  description?: string;
}

const Index = () => {
  const { user, signOut } = useAuth();
  const navigateIndex = useNavigateIndex();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([]);
  const [activePeriod, setActivePeriod] = useState<PeriodType>("45days");
  const [isLoading, setIsLoading] = useState(true);

  const fetchTransactions = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      // Buscar entradas e saídas das tabelas separadas
      const [entradasResult, saidasResult] = await Promise.all([
        supabase.from("entradas").select("*").eq("user_id", user.id).order("date", { ascending: false }),
        supabase.from("saidas").select("*").eq("user_id", user.id).order("date", { ascending: false })
      ]);

      if (entradasResult.error) throw entradasResult.error;
      if (saidasResult.error) throw saidasResult.error;

      const entradasWithType = (entradasResult.data || []).map(item => ({
        ...item,
        type: "entrada" as const
      }));

      const saidasWithType = (saidasResult.data || []).map(item => ({
        ...item,
        type: "saida" as const
      }));

      const allTransactions = [...entradasWithType, ...saidasWithType].sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      );

      setTransactions(allTransactions);
    } catch (error) {
      console.error("Error fetching transactions:", error);
      toast.error("Erro ao carregar transações");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchTransactions();

      // Configurar realtime para ambas as tabelas
      const entradasChannel = supabase
        .channel("entradas-changes")
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "entradas",
          },
          () => {
            fetchTransactions();
          }
        )
        .subscribe();

      const saidasChannel = supabase
        .channel("saidas-changes")
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "saidas",
          },
          () => {
            fetchTransactions();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(entradasChannel);
        supabase.removeChannel(saidasChannel);
      };
    }
  }, [user]);

  useEffect(() => {
    const now = new Date();
    let filtered = [...transactions];

    switch (activePeriod) {
      case "15days":
        const fifteenDaysAgo = new Date(now);
        fifteenDaysAgo.setDate(now.getDate() - 15);
        filtered = transactions.filter(
          (t) => new Date(t.date) >= fifteenDaysAgo
        );
        break;

      case "45days":
        const fortyFiveDaysAgo = new Date(now);
        fortyFiveDaysAgo.setDate(now.getDate() - 45);
        filtered = transactions.filter(
          (t) => new Date(t.date) >= fortyFiveDaysAgo
        );
        break;

      case "year":
        const startOfYear = new Date(now.getFullYear(), 0, 1);
        filtered = transactions.filter(
          (t) => new Date(t.date) >= startOfYear
        );
        break;

      case "monthly":
        // Para visão mês a mês, mostramos todos os dados
        filtered = transactions;
        break;
    }

    setFilteredTransactions(filtered);
  }, [transactions, activePeriod]);

  const totalEntradas = filteredTransactions
    .filter((t) => t.type === "entrada")
    .reduce((sum, t) => sum + t.amount, 0);

  const totalSaidas = filteredTransactions
    .filter((t) => t.type === "saida")
    .reduce((sum, t) => sum + t.amount, 0);

  const saldo = totalEntradas - totalSaidas;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img 
                src={mitraLogo} 
                alt="Mitra Logo" 
                className="h-10 w-10 rounded-full object-cover"
              />
              <div>
                <h1 className="text-2xl font-bold">Dashboard Financeiro da Mitra</h1>
                <p className="text-sm text-muted-foreground">
                  Mael - Mitra | Gerencie suas finanças de forma inteligente
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-wrap justify-end">
              <span className="text-sm text-muted-foreground hidden lg:inline">
                {user?.email}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={fetchTransactions}
                disabled={isLoading}
                className="hidden sm:flex"
              >
                <RefreshCw className={`h-4 w-4 sm:mr-2 ${isLoading ? "animate-spin" : ""}`} />
                <span className="hidden sm:inline">Atualizar</span>
              </Button>
              <Button
                variant="default"
                size="sm"
                onClick={() => navigateIndex("/settings")}
                className="gap-2 bg-primary hover:bg-primary/90 font-semibold"
              >
                <SettingsIcon className="h-4 w-4" />
                <span>NÚMERO</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={signOut}
                className="gap-2"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">Sair</span>
              </Button>
              <ThemeToggle />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="space-y-8">
          {/* Filtros de Período */}
          <div className="flex justify-center md:justify-end">
            <PeriodFilter
              activePeriod={activePeriod}
              onPeriodChange={setActivePeriod}
            />
          </div>

          {/* Cards de Resumo */}
          <SummaryCards
            totalEntradas={totalEntradas}
            totalSaidas={totalSaidas}
            saldo={saldo}
          />

          {/* Progresso da Meta */}
          <GoalProgress currentBalance={saldo} />

          {/* Formulário de Nova Transação */}
          <Card>
            <CardHeader>
              <CardTitle>Nova Transação</CardTitle>
            </CardHeader>
            <CardContent>
              <TransactionForm onSuccess={fetchTransactions} />
            </CardContent>
          </Card>

          {/* Gráficos */}
          <ChartsSection transactions={filteredTransactions} />

          {/* Histórico */}
          <TransactionHistory transactions={filteredTransactions} />

          {/* Adicionar Meta Financeira */}
          <Card>
            <CardHeader>
              <CardTitle>Adicionar Meta Financeira</CardTitle>
            </CardHeader>
            <CardContent>
              <GoalForm onSuccess={fetchTransactions} />
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t bg-card mt-8">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="text-sm text-muted-foreground">
              © 2025 Dashboard Financeiro Mitra. Todos os direitos reservados.
            </div>
            <div className="flex items-center gap-4">
              <a 
                href="mailto:assessoria.mitra0@gmail.com" 
                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors group"
              >
                <Mail className="h-4 w-4 text-green-800 dark:text-white group-hover:text-green-600 dark:group-hover:text-green-300 transition-colors" />
                <span className="text-green-800 dark:text-white group-hover:text-green-600 dark:group-hover:text-green-300 transition-colors">
                  assessoria.mitra0@gmail.com
                </span>
              </a>
              <a 
                href="https://www.instagram.com/mitra_assessoria.ia/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors group"
              >
                <Instagram className="h-4 w-4 text-green-800 dark:text-white group-hover:text-green-600 dark:group-hover:text-green-300 transition-colors" />
                <span className="text-green-800 dark:text-white group-hover:text-green-600 dark:group-hover:text-green-300 transition-colors">
                  @mitra_assessoria.ia
                </span>
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;