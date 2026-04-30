/**
 * GoalProgress — versão demo. Lista metas do localStore.
 */
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Target, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toast } from "sonner";
import { useGoals } from "@/lib/localStore";

interface GoalProgressProps {
  currentBalance: number;
}

export function GoalProgress({ currentBalance }: GoalProgressProps) {
  const { goals, remove } = useGoals();

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
      minimumFractionDigits: 0,
    }).format(value);

  const handleDelete = (id: string) => {
    remove(id);
    toast.success("Meta removida com sucesso!");
  };

  if (goals.length === 0) return null;

  const sorted = [...goals].sort(
    (a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime()
  );

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Target className="h-4 w-4" />
          Progresso das Metas
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {sorted.map((goal, idx) => {
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
                  className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10 flex-shrink-0"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>

              <div className="relative">
                <div className="h-6 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-primary to-primary-light transition-all duration-500 ease-out"
                    style={{ width: `${progress}%` }}
                  />
                </div>
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

              <div className="flex justify-between text-xs text-muted-foreground">
                <span>R$ 0</span>
                <span className="font-medium text-primary">
                  Faltam {formatCurrency(Math.max(goal.target_amount - currentBalance, 0))}
                </span>
                <span>{formatCurrency(goal.target_amount)}</span>
              </div>

              {sorted.length > 1 && idx !== sorted.length - 1 && (
                <div className="border-b border-border mt-2" />
              )}
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
