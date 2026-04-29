import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Target, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toast } from "sonner";

interface Goal {
  id: string;
  goal_name: string;
  target_amount: number;
  deadline: string;
}

interface GoalProgressProps {
  currentBalance: number;
}

export function GoalProgress({ currentBalance }: GoalProgressProps) {
  const { user } = useAuth();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchGoals = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from("metas")
        .select("*")
        .eq("user_id", user.id)
        .order("deadline", { ascending: true });

      if (error) throw error;
      setGoals((data || []) as Goal[]);
    } catch (error) {
      console.error("Error fetching goals:", error);
    }
  };

  useEffect(() => {
    fetchGoals();

    const channel = supabase
      .channel("metas-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "metas",
        },
        () => {
          fetchGoals();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
      minimumFractionDigits: 0,
    }).format(value);
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      const { error } = await supabase
        .from("metas")
        .delete()
        .eq("id", id);

      if (error) throw error;
      toast.success("Meta removida com sucesso!");
    } catch (error) {
      console.error("Error deleting goal:", error);
      toast.error("Erro ao remover meta");
    } finally {
      setDeletingId(null);
    }
  };

  if (goals.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Target className="h-4 w-4" />
          Progresso das Metas
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {goals.map((goal) => {
          const progress = Math.min((currentBalance / goal.target_amount) * 100, 100);
          
          return (
            <div key={goal.id} className="space-y-2">
              <div className="flex justify-between items-start gap-2">
                <div className="flex-1">
                  <p className="font-semibold text-sm">{goal.goal_name}</p>
                  <p className="text-xs text-muted-foreground">
                    {format(new Date(goal.deadline), "PPP", { locale: ptBR })}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-muted-foreground">Meta</p>
                  <p className="font-semibold text-sm">{formatCurrency(goal.target_amount)}</p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDelete(goal.id)}
                  disabled={deletingId === goal.id}
                  className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10 flex-shrink-0"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>

              {/* Barra de Progresso Compacta */}
              <div className="relative">
                <div className="h-6 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-primary to-primary-light transition-all duration-500 ease-out"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                
                {/* Indicador do Saldo Atual */}
                <div
                  className="absolute -top-1 flex flex-col items-center transition-all duration-500"
                  style={{ left: `${Math.min(progress, 95)}%` }}
                >
                  <div className="w-2 h-8 bg-foreground rounded-full shadow-md" />
                  <div className="mt-0.5 bg-card border border-foreground rounded px-1.5 py-0.5 shadow-sm">
                    <p className="text-xs font-bold">{progress.toFixed(0)}%</p>
                  </div>
                </div>
              </div>

              {/* Legenda Compacta */}
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>R$ 0</span>
                <span className="font-medium text-primary">
                  Faltam {formatCurrency(Math.max(goal.target_amount - currentBalance, 0))}
                </span>
                <span>{formatCurrency(goal.target_amount)}</span>
              </div>
              
              {goals.length > 1 && goal.id !== goals[goals.length - 1].id && (
                <div className="border-b border-border mt-2" />
              )}
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
