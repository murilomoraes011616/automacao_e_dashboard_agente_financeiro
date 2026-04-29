import { Button } from "@/components/ui/button";
import { Calendar, Clock } from "lucide-react";

export type PeriodType = "15days" | "45days" | "year" | "monthly";

interface PeriodFilterProps {
  activePeriod: PeriodType;
  onPeriodChange: (period: PeriodType) => void;
}

export function PeriodFilter({ activePeriod, onPeriodChange }: PeriodFilterProps) {
  const periods = [
    { value: "15days" as PeriodType, label: "15 dias" },
    { value: "45days" as PeriodType, label: "45 dias" },
    { value: "year" as PeriodType, label: "Ano atual" },
    { value: "monthly" as PeriodType, label: "Mês a mês" },
  ];

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <Calendar className="h-5 w-5 text-muted-foreground" />
      {periods.map((period) => (
        <Button
          key={period.value}
          variant={activePeriod === period.value ? "default" : "outline"}
          size="sm"
          onClick={() => onPeriodChange(period.value)}
        >
          {period.label}
        </Button>
      ))}
    </div>
  );
}
