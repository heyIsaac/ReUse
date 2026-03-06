import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Função utilitária para mesclar classes do Tailwind de forma inteligente,
 * resolvendo conflitos e permitindo renderização condicional.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
