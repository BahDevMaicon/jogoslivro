export type TicketCategory = "livro" | "bug" | "reembolso" | "duvida" | "outro";
export type TicketStatus = "sent" | "in_review" | "answered";

export const CATEGORY_LABEL: Record<TicketCategory, string> = {
  livro: "Livro com problema",
  bug: "Bug ou erro técnico",
  reembolso: "Pedir reembolso",
  duvida: "Dúvida",
  outro: "Outro",
};

export const STATUS_LABEL: Record<TicketStatus, string> = {
  sent: "Enviado",
  in_review: "Em análise",
  answered: "Respondido",
};

export const STATUS_BADGE_CLASS: Record<TicketStatus, string> = {
  sent: "border-parchment-700/40 text-parchment-300",
  in_review: "border-amber-700/40 text-amber-300",
  answered: "border-moss-600/40 text-moss-400",
};
