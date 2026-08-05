import { supabase } from "@/lib/supabaseClient";
import type { TicketCategory, TicketStatus } from "@/lib/supportStatus";

export interface SupportTicket {
  id: string;
  category: TicketCategory;
  subject: string | null;
  message: string;
  status: TicketStatus;
  adminResponse: string | null;
  createdAt: string;
  respondedAt: string | null;
}

export interface AdminSupportTicket extends SupportTicket {
  userId: string;
  displayName: string | null;
}

export async function sendSupportMessage(
  userId: string,
  category: TicketCategory,
  subject: string,
  message: string
): Promise<{ success: boolean; error?: string }> {
  if (!supabase) return { success: false, error: "Backend não configurado." };
  const trimmed = message.trim();
  if (!trimmed) return { success: false, error: "Escreva sua mensagem antes de enviar." };
  const { error } = await supabase
    .from("support_messages")
    .insert({ user_id: userId, category, subject: subject.trim() || null, message: trimmed });
  if (error) return { success: false, error: error.message };
  return { success: true };
}

export async function fetchMyTickets(userId: string): Promise<SupportTicket[]> {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("support_messages")
    .select("id, category, subject, message, status, admin_response, created_at, responded_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  if (error || !data) return [];
  return data.map((row) => ({
    id: row.id,
    category: row.category,
    subject: row.subject,
    message: row.message,
    status: row.status,
    adminResponse: row.admin_response,
    createdAt: row.created_at,
    respondedAt: row.responded_at,
  }));
}

/** Uso do admin — resolve o nome de quem abriu via `public_profiles` (mesmo padrão de `ratingEngine`/`discussionEngine`, já que `profiles` não é mais legível publicamente desde a Etapa 4). */
export async function fetchAllTickets(): Promise<AdminSupportTicket[]> {
  if (!supabase) return [];
  const { data: rows, error } = await supabase
    .from("support_messages")
    .select("id, user_id, category, subject, message, status, admin_response, created_at, responded_at")
    .order("created_at", { ascending: false });
  if (error || !rows || rows.length === 0) return [];

  const userIds = Array.from(new Set(rows.map((r) => r.user_id)));
  const { data: profiles } = await supabase.from("public_profiles").select("id, display_name").in("id", userIds);
  const nameById = new Map((profiles ?? []).map((p) => [p.id as string, p.display_name as string | null]));

  return rows.map((row) => ({
    id: row.id,
    userId: row.user_id,
    displayName: nameById.get(row.user_id) ?? null,
    category: row.category,
    subject: row.subject,
    message: row.message,
    status: row.status,
    adminResponse: row.admin_response,
    createdAt: row.created_at,
    respondedAt: row.responded_at,
  }));
}

export async function updateTicketStatus(id: string, status: TicketStatus): Promise<{ success: boolean; error?: string }> {
  if (!supabase) return { success: false, error: "Backend não configurado." };
  const { error } = await supabase.from("support_messages").update({ status }).eq("id", id);
  if (error) return { success: false, error: error.message };
  return { success: true };
}

/** Grava a resposta e já marca como respondido numa ação só. */
export async function respondToTicket(id: string, response: string): Promise<{ success: boolean; error?: string }> {
  if (!supabase) return { success: false, error: "Backend não configurado." };
  const trimmed = response.trim();
  if (!trimmed) return { success: false, error: "Escreva uma resposta antes de enviar." };
  const { error } = await supabase
    .from("support_messages")
    .update({ admin_response: trimmed, status: "answered", responded_at: new Date().toISOString() })
    .eq("id", id);
  if (error) return { success: false, error: error.message };
  return { success: true };
}
