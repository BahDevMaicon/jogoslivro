import { Check, Eye, FolderOpen, Globe, Image, Library, PenSquare, Rocket, Wrench, type LucideIcon } from "lucide-react";

export interface PremiumFeature {
  icon: LucideIcon;
  label: string;
}

/** Fonte única das vantagens do plano Premium — usada na Home (tabela de planos) e em `/premium`. */
export const PREMIUM_FEATURES: PremiumFeature[] = [
  { icon: Check, label: "Tudo do plano básico" },
  { icon: PenSquare, label: "Criar livros" },
  { icon: Globe, label: "Publicar livros" },
  { icon: Library, label: "Biblioteca ilimitada" },
  { icon: Image, label: "Upload de capas e imagens" },
  { icon: FolderOpen, label: "Organização por coleções" },
  { icon: Eye, label: "Publicação pública ou privada" },
  { icon: Wrench, label: "Ferramentas avançadas de criação" },
  { icon: Rocket, label: "Acesso antecipado a novos recursos" },
];
