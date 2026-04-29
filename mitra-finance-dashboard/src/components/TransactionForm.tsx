import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { CalendarIcon, Plus, PlusCircle } from "lucide-react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface Category {
  id: string;
  name: string;
  type: "entrada" | "saida";
}

const formSchema = z.object({
  type: z.enum(["entrada", "saida"]),
  date: z.date(),
  category: z.string().min(1, "Categoria é obrigatória"),
  amount: z.string().refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
    message: "Valor deve ser maior que zero",
  }),
  description: z.string().optional(),
});


export function TransactionForm({ onSuccess }: { onSuccess?: () => void }) {
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [showCategoryDialog, setShowCategoryDialog] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      type: "entrada",
      date: new Date(),
      category: "",
      amount: "",
      description: "",
    },
  });

  const selectedType = form.watch("type");

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from("categories")
        .select("*")
        .order("name");

      if (error) throw error;
      setCategories((data || []) as Category[]);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  useEffect(() => {
    fetchCategories();

    const channel = supabase
      .channel("categories-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "categories",
        },
        () => {
          fetchCategories();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const handleAddCategory = async () => {
    if (!newCategoryName.trim()) {
      toast.error("Digite o nome da categoria");
      return;
    }

    if (!user) {
      toast.error("Você precisa estar logado");
      return;
    }

    setIsAddingCategory(true);
    try {
      // Buscar whatsapp_number do perfil
      const { data: profile } = await supabase
        .from('profiles')
        .select('whatsapp_number')
        .eq('id', user.id)
        .single();

      const userLid = profile?.whatsapp_number ? `${profile.whatsapp_number}@s.whatsapp.net` : null;

      const { error } = await supabase.from("categories").insert({
        name: newCategoryName.trim(),
        type: selectedType,
        user_id: user.id,
        whatsapp_number: profile?.whatsapp_number || null,
        user_lid: userLid,
      });

      if (error) {
        if (error.code === "23505") {
          toast.error("Esta categoria já existe");
        } else {
          throw error;
        }
        return;
      }

      toast.success("Categoria adicionada com sucesso!");
      setNewCategoryName("");
      setShowCategoryDialog(false);
      form.setValue("category", newCategoryName.trim());
    } catch (error) {
      console.error("Error adding category:", error);
      toast.error("Erro ao adicionar categoria");
    } finally {
      setIsAddingCategory(false);
    }
  };

  const filteredCategories = categories.filter((cat) => cat.type === selectedType);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!user) return;
    
    setIsSubmitting(true);
    try {
      // Buscar whatsapp_number do perfil
      const { data: profile } = await supabase
        .from('profiles')
        .select('whatsapp_number')
        .eq('id', user.id)
        .single();

      const userLid = profile?.whatsapp_number ? `${profile.whatsapp_number}@s.whatsapp.net` : null;

      const tableName = values.type === "entrada" ? "entradas" : "saidas";
      const { error } = await supabase.from(tableName).insert({
        date: values.date.toISOString(),
        category: values.category,
        amount: Number(values.amount),
        description: values.description || null,
        user_id: user.id,
        whatsapp_number: profile?.whatsapp_number || null,
        user_lid: userLid,
      });

      if (error) throw error;

      toast.success("Transação adicionada com sucesso!");
      form.reset();
      onSuccess?.();
    } catch (error) {
      console.error("Error inserting transaction:", error);
      toast.error("Erro ao adicionar transação");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tipo</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o tipo" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="entrada">Entrada</SelectItem>
                    <SelectItem value="saida">Saída</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="date"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Data</FormLabel>
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
                          <span>Selecione a data</span>
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

          <FormField
            control={form.control}
            name="category"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Categoria</FormLabel>
                <div className="flex gap-2">
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger className="flex-1">
                        <SelectValue placeholder="Selecione a categoria" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {filteredCategories.map((cat) => (
                        <SelectItem key={cat.id} value={cat.name}>
                          {cat.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Dialog open={showCategoryDialog} onOpenChange={setShowCategoryDialog}>
                    <DialogTrigger asChild>
                      <Button type="button" variant="outline" size="icon">
                        <PlusCircle className="h-4 w-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Adicionar Nova Categoria</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4 pt-4">
                        <div>
                          <label className="text-sm font-medium">Nome da Categoria</label>
                          <Input
                            value={newCategoryName}
                            onChange={(e) => setNewCategoryName(e.target.value)}
                            placeholder="Ex: Investimentos"
                            className="mt-2"
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                e.preventDefault();
                                handleAddCategory();
                              }
                            }}
                          />
                        </div>
                        <Button
                          onClick={handleAddCategory}
                          disabled={isAddingCategory}
                          className="w-full"
                        >
                          {isAddingCategory ? "Adicionando..." : "Adicionar Categoria"}
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="amount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Valor (R$)</FormLabel>
                <FormControl>
                  <Input
                    placeholder="0,00"
                    value={field.value}
                    onChange={(e) => {
                      // Remove tudo exceto dígitos
                      const value = e.target.value.replace(/\D/g, "");
                      
                      if (value === "") {
                        field.onChange("");
                        return;
                      }
                      
                      // Converte para número com centavos
                      const numberValue = Number(value) / 100;
                      
                      // Formata com . para milhares e , para centavos
                      const formatted = new Intl.NumberFormat("pt-BR", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      }).format(numberValue);
                      
                      // Armazena o valor numérico formatado com ponto decimal para o backend
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
                  {field.value && !isNaN(Number(field.value)) && 
                    new Intl.NumberFormat("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                    }).format(Number(field.value))
                  }
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Descrição (opcional)</FormLabel>
              <FormControl>
                <Input placeholder="Adicione uma descrição..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full" disabled={isSubmitting}>
          <Plus className="mr-2 h-4 w-4" />
          {isSubmitting ? "Adicionando..." : "Adicionar Transação"}
        </Button>
      </form>
    </Form>
  );
}
