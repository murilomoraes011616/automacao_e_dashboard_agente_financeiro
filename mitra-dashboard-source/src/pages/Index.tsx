/**
 * Página Index — dashboard financeiro (modo demo, sem backend).
 * Lê transações do store local (localStorage) via `useTransactions`.
 */
import { useEffect, useState } from "react";
import { TransactionForm } from "@/components/TransactionForm";
import { SummaryCards } from "@/components/SummaryCards";
import { TransactionHistory } from "@/components/TransactionHistory";
import { ChartsSection } from "@/components/ChartsSection";
import { ThemeToggle } from "@/components/ThemeToggle";
import { PeriodFilter, PeriodType } from "@/components/PeriodFilter";
import { GoalForm } from "@/components/GoalForm";
import { GoalProgress } from "@/components/GoalProgress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail, Instagram } from "lucide-react";
import { useTransactions, Transaction } from "@/lib/localStore";
import mitraLogo from "@/assets/mitra-logo.jpeg";

const Index = () => {
  const { transactions } = useTransactions();
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([]);
  const [activePeriod, setActivePeriod] = useState<PeriodType>("45days");

  useEffect(() => {
    const now = new Date();
    let filtered = [...transactions];

    switch (activePeriod) {
      case "15days": {
        const d = new Date(now);
        d.setDate(now.getDate() - 15);
        filtered = transactions.filter((t) => new Date(t.date) >= d);
        break;
      }
      case "45days": {
        const d = new Date(now);
        d.setDate(now.getDate() - 45);
        filtered = transactions.filter((t) => new Date(t.date) >= d);
        break;
      }
      case "year": {
        const start = new Date(now.getFullYear(), 0, 1);
        filtered = transactions.filter((t) => new Date(t.date) >= start);
        break;
      }
      case "monthly":
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
      {/* Cabeçalho */}
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
              <ThemeToggle />
            </div>
          </div>
        </div>
      </header>

      {/* Conteúdo Principal */}
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="space-y-8">
          <div className="flex justify-center md:justify-end">
            <PeriodFilter activePeriod={activePeriod} onPeriodChange={setActivePeriod} />
          </div>

          <SummaryCards totalEntradas={totalEntradas} totalSaidas={totalSaidas} saldo={saldo} />

          <GoalProgress currentBalance={saldo} />

          <Card>
            <CardHeader>
              <CardTitle>Nova Transação</CardTitle>
            </CardHeader>
            <CardContent>
              <TransactionForm />
            </CardContent>
          </Card>

          <ChartsSection transactions={filteredTransactions} />

          <TransactionHistory transactions={filteredTransactions} />

          <Card>
            <CardHeader>
              <CardTitle>Nova Meta Financeira</CardTitle>
            </CardHeader>
            <CardContent>
              <GoalForm />
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Rodapé */}
      <footer className="border-t bg-card mt-8">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="text-sm text-muted-foreground">
              Desenvolvido com IA Mael da Mitra
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
