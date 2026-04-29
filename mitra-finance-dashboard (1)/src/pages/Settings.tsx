/**
 * Página Settings — configurações do usuário.
 *
 * Hoje cobre apenas a vinculação do número de WhatsApp ao perfil, usado
 * pela integração com n8n para registrar transações por mensagem.
 *
 * - O número é digitado de forma livre, mas armazenamos apenas dígitos.
 * - A formatação visual é feita por `formatWhatsApp` (ex: +55 (11) 99999-9999).
 * - A validação final usa um schema Zod exigindo 12 a 15 dígitos.
 */
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Smartphone, Save, ArrowLeft, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { z } from "zod";

// Função para formatar número WhatsApp
const formatWhatsApp = (value: string) => {
  const numbers = value.replace(/\D/g, '');
  if (numbers.length === 0) return '';
  if (numbers.length <= 2) return `+${numbers}`;
  if (numbers.length <= 4) return `+${numbers.slice(0, 2)} (${numbers.slice(2)}`;
  if (numbers.length <= 9) return `+${numbers.slice(0, 2)} (${numbers.slice(2, 4)}) ${numbers.slice(4)}`;
  return `+${numbers.slice(0, 2)} (${numbers.slice(2, 4)}) ${numbers.slice(4, 9)}-${numbers.slice(9, 13)}`;
};

const whatsappSchema = z.string()
  .regex(/^[0-9]{12,15}$/, "Formato inválido. Complete o número corretamente")
  .optional()
  .or(z.literal(""));

export default function Settings() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [whatsappNumber, setWhatsappNumber] = useState("");
  const [whatsappDisplay, setWhatsappDisplay] = useState("");
  const [originalNumber, setOriginalNumber] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);

  useEffect(() => {
    fetchCurrentNumber();
  }, [user]);

  const fetchCurrentNumber = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("whatsapp_number")
        .eq("id", user.id)
        .single();

      if (error) throw error;

      if (data?.whatsapp_number) {
        setWhatsappNumber(data.whatsapp_number);
        setOriginalNumber(data.whatsapp_number);
        setWhatsappDisplay(formatWhatsApp(data.whatsapp_number));
      } else {
        setWhatsappDisplay("+55 ");
      }
    } catch (error) {
      console.error("Erro ao buscar número:", error);
      setWhatsappDisplay("+55 ");
    } finally {
      setIsFetching(false);
    }
  };

  const handleWhatsAppChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const numbers = value.replace(/\D/g, '');
    
    // Armazenar apenas números
    setWhatsappNumber(numbers);
    
    // Formatar para exibição
    setWhatsappDisplay(formatWhatsApp(numbers));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) return;

    // Extrair apenas os números
    const numbersOnly = whatsappNumber.replace(/\D/g, '');
    
    try {
      if (numbersOnly) {
        whatsappSchema.parse(numbersOnly);
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast.error(error.errors[0].message);
        return;
      }
    }

    setIsLoading(true);

    try {
      const { error } = await supabase
        .from("profiles")
        .update({ whatsapp_number: numbersOnly || null })
        .eq("id", user.id);

      if (error) {
        if (error.message.includes("unique")) {
          toast.error("Este número WhatsApp já está em uso por outro usuário");
        } else if (error.message.includes("whatsapp_number_format")) {
          toast.error("Formato inválido. Complete o número corretamente");
        } else {
          throw error;
        }
      } else {
        setOriginalNumber(numbersOnly);
        toast.success(
          numbersOnly 
            ? "Número WhatsApp vinculado com sucesso!" 
            : "Número WhatsApp removido com sucesso!"
        );
      }
    } catch (error) {
      console.error("Erro ao salvar:", error);
      toast.error("Erro ao salvar número WhatsApp");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemove = () => {
    setWhatsappNumber("");
    setWhatsappDisplay("+55 ");
  };

  const hasChanges = whatsappNumber !== originalNumber;

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/")}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold">Configurações</h1>
              <p className="text-sm text-muted-foreground">
                Gerencie suas preferências e integrações
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="flex justify-center">
          <Card className="w-full max-w-2xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Smartphone className="h-5 w-5" />
                Integração WhatsApp
              </CardTitle>
              <CardDescription>
                Vincule seu número WhatsApp para receber transações automaticamente via n8n
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isFetching ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <form onSubmit={handleSave} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="whatsapp">
                      Número WhatsApp (com código do país)
                    </Label>
                    <div className="relative">
                      <Smartphone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="whatsapp"
                        type="text"
                        placeholder="+55 (11) 99999-9999"
                        className="pl-9"
                        value={whatsappDisplay}
                        onChange={handleWhatsAppChange}
                        maxLength={19}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Digite o número com DDD (será formatado automaticamente)
                    </p>
                  </div>

                  {originalNumber && (
                    <div className="rounded-lg bg-muted p-4 space-y-2">
                      <p className="text-sm font-medium">Número atual:</p>
                      <p className="text-sm font-mono">{formatWhatsApp(originalNumber)}</p>
                    </div>
                  )}

                  <div className="flex gap-2">
                    <Button 
                      type="submit" 
                      disabled={isLoading || !hasChanges}
                      className="flex-1"
                    >
                      {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      <Save className="mr-2 h-4 w-4" />
                      Salvar
                    </Button>
                    
                    {whatsappNumber && (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleRemove}
                        disabled={isLoading}
                      >
                        Limpar
                      </Button>
                    )}
                  </div>

                  <div className="rounded-lg border border-amber-200 bg-amber-50 dark:bg-amber-950 dark:border-amber-800 p-4 space-y-3">
                    <p className="text-sm font-semibold text-amber-900 dark:text-amber-100 flex items-center gap-2">
                      ⚠️ IMPORTANTE - Integração n8n
                    </p>
                    <div className="space-y-2">
                      <p className="text-xs text-amber-800 dark:text-amber-200 font-medium">
                        Formato correto para envio pelo n8n:
                      </p>
                      <div className="bg-amber-100 dark:bg-amber-900 rounded px-3 py-2 font-mono text-xs text-amber-900 dark:text-amber-100">
                        {whatsappNumber || "5519953309697"}
                      </div>
                      <ul className="text-xs text-amber-800 dark:text-amber-200 space-y-1.5">
                        <li className="flex items-start gap-2">
                          <span className="text-amber-600 dark:text-amber-400 mt-0.5">✓</span>
                          <span><strong>Use apenas números</strong> (sem +, espaços, parênteses ou traços)</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-amber-600 dark:text-amber-400 mt-0.5">✓</span>
                          <span><strong>Inclua o código do país:</strong> 55</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-red-600 dark:text-red-400 mt-0.5">✗</span>
                          <span><strong>NÃO use Group ID</strong> (ex: 191551632355397@lid)</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-amber-600 dark:text-amber-400 mt-0.5">✓</span>
                          <span>O n8n deve enviar o <strong>número de telefone direto</strong></span>
                        </li>
                      </ul>
                    </div>
                  </div>

                  <div className="rounded-lg border border-blue-200 bg-blue-50 dark:bg-blue-950 dark:border-blue-800 p-4 space-y-2">
                    <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                      💡 Como funciona:
                    </p>
                    <ul className="text-xs text-blue-800 dark:text-blue-200 space-y-1 list-disc list-inside">
                      <li>Após vincular o número, você pode enviar transações via WhatsApp</li>
                      <li>Configure o n8n para enviar dados para a API do Supabase</li>
                      <li>As transações aparecerão automaticamente no dashboard</li>
                      <li>Todas as transações (WhatsApp + Dashboard) ficam no mesmo lugar</li>
                    </ul>
                  </div>
                </form>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}