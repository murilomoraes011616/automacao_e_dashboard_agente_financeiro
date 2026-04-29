/**
 * AuthContext
 * -----------
 * Contexto global de autenticação da aplicação.
 *
 * Responsabilidades:
 *  1. Manter o `user` e a `session` atuais do Supabase em estado React,
 *     disponibilizando-os para qualquer componente via o hook `useAuth()`.
 *  2. Escutar mudanças de autenticação (login / logout / refresh de token)
 *     através de `onAuthStateChange`.
 *  3. Fazer **login anônimo automático** sempre que não houver sessão ativa,
 *     de modo que o usuário nunca veja uma tela de login. Isso exige que o
 *     provedor "Anonymous sign-ins" esteja habilitado no Lovable Cloud
 *     (Cloud → Users → Auth settings).
 *  4. Sincronizar o número de WhatsApp do perfil nas tabelas de dados
 *     (entradas, saidas, metas, categories) quando o usuário entra.
 */

import { createContext, useContext, useEffect, useState } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

// Formato do valor exposto pelo contexto. Mantemos `signOut` para permitir
// "trocar" de usuário anônimo, mas não há mais signUp/signIn manuais.
interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  // Estado local — espelha a sessão atual do Supabase.
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  // `loading` fica true até sabermos se existe sessão (e, se não, até criarmos uma anônima).
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1) Registrar o listener ANTES de buscar a sessão atual.
    //    Isso garante que qualquer evento que ocorra durante o boot seja capturado.
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);

        // Quando o usuário acaba de logar, propagamos seu whatsapp_number
        // para as linhas antigas que ainda estavam sem essa informação.
        // Usamos setTimeout(0) para evitar chamar APIs do Supabase de dentro
        // do próprio callback (recomendação da doc para prevenir deadlocks).
        if (session?.user && event === "SIGNED_IN") {
          setTimeout(() => {
            updateWhatsAppInTables(session.user.id);
          }, 0);
        }
      }
    );

    // 2) Verificar se já existe sessão persistida no localStorage.
    //    Se não houver, criamos uma sessão anônima automaticamente para que
    //    o usuário entre direto no app, sem ver tela de login.
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session) {
        setSession(session);
        setUser(session.user);
        setLoading(false);
      } else {
        const { data, error } = await supabase.auth.signInAnonymously();
        if (error) {
          console.error("Falha no login anônimo:", error);
          setLoading(false);
        } else {
          setSession(data.session);
          setUser(data.user);
          setLoading(false);
        }
      }
    });

    // Cleanup: cancelar o listener quando o provider desmonta.
    return () => subscription.unsubscribe();
  }, []);

  /**
   * Após o SIGNED_IN, copia o `whatsapp_number` do perfil para as linhas
   * de dados do usuário que ainda não tenham esse campo preenchido.
   * Útil para registros criados antes do número ser cadastrado.
   */
  const updateWhatsAppInTables = async (userId: string) => {
    try {
      const { data: profile } = await supabase
        .from("profiles")
        .select("whatsapp_number")
        .eq("id", userId)
        .single();

      if (!profile?.whatsapp_number) return;

      const whatsapp = profile.whatsapp_number;
      const userLid = `${whatsapp}@s.whatsapp.net`;

      // Atualiza em paralelo todas as tabelas relevantes.
      await Promise.all([
        supabase.from("entradas").update({ whatsapp_number: whatsapp, user_lid: userLid }).eq("user_id", userId).is("whatsapp_number", null),
        supabase.from("saidas").update({ whatsapp_number: whatsapp, user_lid: userLid }).eq("user_id", userId).is("whatsapp_number", null),
        supabase.from("metas").update({ whatsapp_number: whatsapp, user_lid: userLid }).eq("user_id", userId).is("whatsapp_number", null),
        supabase.from("categories").update({ whatsapp_number: whatsapp, user_lid: userLid }).eq("user_id", userId).is("whatsapp_number", null),
      ]);
    } catch (error) {
      console.error("Erro ao atualizar whatsapp_number:", error);
    }
  };

  /**
   * Faz logout. Em seguida o listener `onAuthStateChange` dispara,
   * `user` vira null, e o efeito acima cria uma nova sessão anônima.
   */
  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

/** Hook utilitário para consumir o AuthContext de forma type-safe. */
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
