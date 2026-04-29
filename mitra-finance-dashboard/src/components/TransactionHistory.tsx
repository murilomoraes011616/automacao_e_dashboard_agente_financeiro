import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { ArrowDownCircle, ArrowUpCircle, Trash2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useState } from "react";

interface Transaction {
  id: string;
  type: "entrada" | "saida";
  date: string;
  category: string;
  amount: number;
  description?: string;
}

interface TransactionHistoryProps {
  transactions: Transaction[];
}

export function TransactionHistory({ transactions }: TransactionHistoryProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const handleDelete = async (id: string, type: "entrada" | "saida") => {
    setDeletingId(id);
    try {
      const tableName = type === "entrada" ? "entradas" : "saidas";
      const { error } = await supabase
        .from(tableName)
        .delete()
        .eq("id", id);

      if (error) throw error;
      toast.success("Transação excluída com sucesso!");
    } catch (error) {
      console.error("Error deleting transaction:", error);
      toast.error("Erro ao excluir transação");
    } finally {
      setDeletingId(null);
    }
  };

  const sortedTransactions = [...transactions].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Histórico de Transações</CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px] pr-4">
          {sortedTransactions.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              Nenhuma transação encontrada
            </p>
          ) : (
            <div className="space-y-3">
              {sortedTransactions.map((transaction) => (
                <div
                  key={transaction.id}
                  className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors group"
                >
                  <div className="flex items-center gap-4 flex-1">
                    {transaction.type === "entrada" ? (
                      <ArrowUpCircle className="h-8 w-8 text-success flex-shrink-0" />
                    ) : (
                      <ArrowDownCircle className="h-8 w-8 text-destructive flex-shrink-0" />
                    )}
                    <div className="flex-1">
                      <p className="font-medium">{transaction.category}</p>
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(transaction.date), "PPP", { locale: ptBR })}
                      </p>
                      {transaction.description && (
                        <p className="text-xs text-muted-foreground mt-1">
                          {transaction.description}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div
                      className={`text-lg font-bold ${
                        transaction.type === "entrada" ? "text-success" : "text-destructive"
                      }`}
                    >
                      {transaction.type === "entrada" ? "+" : "-"}
                      {formatCurrency(transaction.amount)}
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(transaction.id, transaction.type)}
                      disabled={deletingId === transaction.id}
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
