import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from "recharts";

interface Transaction {
  id: string;
  type: "entrada" | "saida";
  date: string;
  category: string;
  amount: number;
}

interface ChartsSectionProps {
  transactions: Transaction[];
}

const COLORS = {
  entrada: "hsl(var(--success))",
  saida: "hsl(var(--destructive))",
};

// Paleta de cores usada no gráfico de pizza/colunas por categoria.
const PIE_COLORS = [
  "hsl(280 65% 60%)",  // Roxo
  "hsl(200 80% 55%)",  // Azul ciano
  "hsl(30 90% 60%)",   // Laranja
  "hsl(340 75% 60%)",  // Rosa
  "hsl(160 70% 50%)",  // Verde água
  "hsl(50 95% 55%)",   // Amarelo
  "hsl(260 70% 65%)",  // Violeta
  "hsl(180 60% 55%)",  // Turquesa
  "hsl(15 85% 60%)",   // Coral
  "hsl(120 60% 50%)",  // Verde limão
];

/**
 * ChartsSection — Seção com os três gráficos do dashboard:
 *  1) Barras: comparação Entrada x Saída por mês.
 *  2) Pizza/Colunas: distribuição por categoria (alterna entre entradas e saídas).
 *  3) Linha: evolução do saldo acumulado ao longo do tempo.
 */
export function ChartsSection({ transactions }: ChartsSectionProps) {
  // Estado: alterna entre exibir despesas ou entradas no gráfico de categorias.
  const [pieChartMode, setPieChartMode] = useState<"saida" | "entrada">("saida");
  // Estado: alterna a visualização entre Pizza (false) e Colunas (true).
  const [showColumnChart, setShowColumnChart] = useState(false);

  // Agrega os valores por mês para o gráfico de barras Entrada x Saída.
  const barChartData = transactions.reduce((acc, t) => {
    const month = new Date(t.date).toLocaleDateString("pt-BR", { month: "short" });
    const existing = acc.find((item) => item.month === month);
    
    if (existing) {
      if (t.type === "entrada") {
        existing.entrada += t.amount;
      } else {
        existing.saida += t.amount;
      }
    } else {
      acc.push({
        month,
        entrada: t.type === "entrada" ? t.amount : 0,
        saida: t.type === "saida" ? t.amount : 0,
      });
    }
    
    return acc;
  }, [] as { month: string; entrada: number; saida: number }[]);

  // Dados para o gráfico de pizza (por categoria)
  const pieChartData = transactions
    .filter((t) => t.type === pieChartMode)
    .reduce((acc, t) => {
      const existing = acc.find((item) => item.name === t.category);
      if (existing) {
        existing.value += t.amount;
      } else {
        acc.push({ name: t.category, value: t.amount });
      }
      return acc;
    }, [] as { name: string; value: number }[]);

  // Dados para o gráfico de linha (evolução do saldo)
  const lineChartData = transactions
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .reduce((acc, t) => {
      const date = new Date(t.date).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" });
      const lastBalance = acc.length > 0 ? acc[acc.length - 1].saldo : 0;
      const newBalance = lastBalance + (t.type === "entrada" ? t.amount : -t.amount);
      
      acc.push({
        date,
        saldo: newBalance,
      });
      
      return acc;
    }, [] as { date: string; saldo: number }[]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
      minimumFractionDigits: 0,
    }).format(value);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Entrada vs Saída</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={barChartData}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
              <XAxis dataKey="month" />
              <YAxis tickFormatter={formatCurrency} />
              <Tooltip formatter={(value) => formatCurrency(Number(value))} />
              <Legend />
              <Bar dataKey="entrada" fill={COLORS.entrada} name="Entradas" radius={[8, 8, 0, 0]} />
              <Bar dataKey="saida" fill={COLORS.saida} name="Saídas" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>
            Distribuição por Categoria - {pieChartMode === "saida" ? (
              <span className="text-destructive">Despesas</span>
            ) : (
              <span className="text-success">Entradas</span>
            )}
          </CardTitle>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Switch
                id="chart-type"
                checked={showColumnChart}
                onCheckedChange={setShowColumnChart}
              />
              <Label htmlFor="chart-type" className="cursor-pointer text-sm">
                {showColumnChart ? "📊 Colunas" : "🍕 Pizza"}
              </Label>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPieChartMode(pieChartMode === "saida" ? "entrada" : "saida")}
            >
              Alternar
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            {showColumnChart ? (
              <BarChart data={pieChartData}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                <XAxis dataKey="name" />
                <YAxis tickFormatter={formatCurrency} />
                <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                <Bar 
                  dataKey="value" 
                  fill={pieChartMode === "entrada" ? COLORS.entrada : COLORS.saida}
                  name={pieChartMode === "entrada" ? "Entradas" : "Saídas"}
                  radius={[8, 8, 0, 0]}
                >
                  {pieChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            ) : (
              <PieChart>
                <Pie
                  data={pieChartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {pieChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => formatCurrency(Number(value))} />
              </PieChart>
            )}
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>Evolução do Saldo</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={lineChartData}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
              <XAxis dataKey="date" />
              <YAxis tickFormatter={formatCurrency} />
              <Tooltip formatter={(value) => formatCurrency(Number(value))} />
              <Line
                type="monotone"
                dataKey="saldo"
                stroke="hsl(var(--primary))"
                strokeWidth={3}
                dot={{ fill: "hsl(var(--primary))", r: 4 }}
                name="Saldo"
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
