/**
 * GoalForm — versão demo. Salva metas no localStore.
 */
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { CalendarIcon, Target } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { toast } from "sonner";
import { useGoals } from "@/lib/localStore";

const formSchema = z.object({
  goal_name: z.string().min(1, "Nome da meta é obrigatório").max(100),
  target_amount: z.string().refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
    message: "Valor deve ser maior que zero",
  }),
  deadline: z.date({ required_error: "Prazo é obrigatório" }),
});

export function GoalForm() {
  const { add } = useGoals();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { goal_name: "", target_amount: "", deadline: undefined },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true);
    try {
      add({
        goal_name: values.goal_name,
        target_amount: Number(values.target_amount),
        deadline: format(values.deadline, "yyyy-MM-dd"),
      });
      toast.success("Meta adicionada com sucesso!");
      form.reset();
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <FormField
            control={form.control}
            name="goal_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nome da Meta</FormLabel>
                <FormControl>
                  <Input placeholder="Ex: Comprar um carro" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="target_amount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Valor (R$)</FormLabel>
                <FormControl>
                  <Input
                    placeholder="0,00"
                    value={field.value}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, "");
                      if (value === "") {
                        field.onChange("");
                        return;
                      }
                      const numberValue = Number(value) / 100;
                      field.onChange(numberValue.toFixed(2));
                    }}
                    onBlur={() => {
                      const numValue = Number(field.value);
                      if (!isNaN(numValue) && numValue > 0) {
                        field.onChange(numValue.toFixed(2));
                      }
                    }}
                  />
                </FormControl>
                <div className="text-sm text-muted-foreground mt-1">
                  {field.value &&
                    !isNaN(Number(field.value)) &&
                    new Intl.NumberFormat("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                    }).format(Number(field.value))}
                </div>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="deadline"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Prazo</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        className={cn(
                          "pl-3 text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        {field.value ? (
                          format(field.value, "PPP", { locale: ptBR })
                        ) : (
                          <span>Selecione o prazo</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      disabled={(date) => date < new Date()}
                      initialFocus
                      className="pointer-events-auto"
                      locale={ptBR}
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <Button type="submit" className="w-full" disabled={isSubmitting}>
          <Target className="mr-2 h-4 w-4" />
          {isSubmitting ? "Adicionando..." : "Adicionar Meta"}
        </Button>
      </form>
    </Form>
  );
}
