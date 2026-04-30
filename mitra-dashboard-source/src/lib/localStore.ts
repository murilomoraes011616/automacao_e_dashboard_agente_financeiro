/**
 * localStore
 * ----------
 * Pequeno "banco" em memória + localStorage para o modo demo (sem Supabase).
 *
 * - Cada coleção (transactions, categories, goals) é persistida em uma chave
 *   distinta do localStorage.
 * - Mudanças disparam um evento global (CustomEvent) para que vários
 *   componentes que lêem a mesma coleção se atualizem em tempo real.
 * - O hook `useCollection` encapsula leitura, escrita e sincronização.
 */

import { useEffect, useState, useCallback } from "react";

const STORAGE_PREFIX = "mitra-demo:";
const EVENT_NAME = "mitra-demo-store-change";

// ============== Tipos ==============
export interface Transaction {
  id: string;
  type: "entrada" | "saida";
  date: string; // ISO
  category: string;
  amount: number;
  description?: string;
}

export interface Category {
  id: string;
  name: string;
  type: "entrada" | "saida";
}

export interface Goal {
  id: string;
  goal_name: string;
  target_amount: number;
  deadline: string; // yyyy-MM-dd
}

// ============== Seeds iniciais ==============
const DEFAULT_CATEGORIES: Category[] = [
  { id: "c1", name: "Salário", type: "entrada" },
  { id: "c2", name: "Freelance", type: "entrada" },
  { id: "c3", name: "Investimentos", type: "entrada" },
  { id: "c4", name: "Outros", type: "entrada" },
  { id: "c5", name: "Alimentação", type: "saida" },
  { id: "c6", name: "Transporte", type: "saida" },
  { id: "c7", name: "Moradia", type: "saida" },
  { id: "c8", name: "Lazer", type: "saida" },
  { id: "c9", name: "Saúde", type: "saida" },
  { id: "c10", name: "Educação", type: "saida" },
];

const SEEDS: Record<string, unknown> = {
  transactions: [],
  categories: DEFAULT_CATEGORIES,
  goals: [],
};

// ============== Helpers ==============
function read<T>(key: string): T {
  try {
    const raw = localStorage.getItem(STORAGE_PREFIX + key);
    if (raw === null) {
      const seed = SEEDS[key] as T;
      localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(seed));
      return seed;
    }
    return JSON.parse(raw) as T;
  } catch {
    return SEEDS[key] as T;
  }
}

function write<T>(key: string, value: T) {
  localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(value));
  window.dispatchEvent(new CustomEvent(EVENT_NAME, { detail: { key } }));
}

function genId() {
  return (
    Date.now().toString(36) + Math.random().toString(36).slice(2, 8)
  );
}

// ============== Hook genérico de coleção ==============
function useCollection<T>(key: string) {
  const [items, setItems] = useState<T[]>(() => read<T[]>(key));

  useEffect(() => {
    const onChange = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (detail?.key === key) {
        setItems(read<T[]>(key));
      }
    };
    const onStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_PREFIX + key) setItems(read<T[]>(key));
    };
    window.addEventListener(EVENT_NAME, onChange);
    window.addEventListener("storage", onStorage);
    return () => {
      window.removeEventListener(EVENT_NAME, onChange);
      window.removeEventListener("storage", onStorage);
    };
  }, [key]);

  const setAll = useCallback(
    (next: T[]) => {
      write(key, next);
    },
    [key]
  );

  return [items, setAll] as const;
}

// ============== APIs públicas ==============
export function useTransactions() {
  const [items, setAll] = useCollection<Transaction>("transactions");

  const add = (t: Omit<Transaction, "id">) => {
    setAll([{ ...t, id: genId() }, ...items]);
  };
  const remove = (id: string) => {
    setAll(items.filter((t) => t.id !== id));
  };

  return { transactions: items, add, remove };
}

export function useCategories() {
  const [items, setAll] = useCollection<Category>("categories");

  const add = (c: Omit<Category, "id">) => {
    if (
      items.some(
        (x) => x.name.toLowerCase() === c.name.toLowerCase() && x.type === c.type
      )
    ) {
      return { error: "Categoria já existe" as const };
    }
    setAll([...items, { ...c, id: genId() }]);
    return { error: null };
  };

  return { categories: items, add };
}

export function useGoals() {
  const [items, setAll] = useCollection<Goal>("goals");

  const add = (g: Omit<Goal, "id">) => {
    setAll([...items, { ...g, id: genId() }]);
  };
  const remove = (id: string) => {
    setAll(items.filter((g) => g.id !== id));
  };

  return { goals: items, add, remove };
}
