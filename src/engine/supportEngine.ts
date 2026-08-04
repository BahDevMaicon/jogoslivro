import { supabase } from "@/lib/supabaseClient";

export async function sendSupportMessage(
  userId: string,
  subject: string,
  message: string
): Promise<{ success: boolean; error?: string }> {
  if (!supabase) return { success: false, error: "Backend não configurado." };
  const trimmed = message.trim();
  if (!trimmed) return { success: false, error: "Escreva sua mensagem antes de enviar." };
  const { error } = await supabase
    .from("support_messages")
    .insert({ user_id: userId, subject: subject.trim() || null, message: trimmed });
  if (error) return { success: false, error: error.message };
  return { success: true };
}
