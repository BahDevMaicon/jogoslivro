// Endpoint público que o Mercado Pago chama quando um pagamento muda de
// status. Nunca confia no corpo da notificação — sempre busca o pagamento
// de verdade na API do MP antes de liberar qualquer coisa. Usa a
// service_role key (injetada automaticamente pelo Supabase em toda Edge
// Function) para gravar em `profiles`/`premium_purchases` ignorando RLS —
// é o único lugar do sistema com esse poder, e só é chamado pelo próprio MP.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const PLAN_DAYS: Record<string, number> = { monthly: 30, annual: 365 };

Deno.serve(async (req) => {
  try {
    const url = new URL(req.url);
    let paymentId = url.searchParams.get("id") ?? url.searchParams.get("data.id");

    if (!paymentId && req.method === "POST") {
      const body = await req.json().catch(() => null);
      paymentId = body?.data?.id ?? body?.id ?? null;
    }

    // Sempre responde 200 mesmo quando não há nada a fazer — um erro aqui
    // faria o Mercado Pago reenviar a notificação em loop.
    if (!paymentId) return new Response("ok", { status: 200 });

    const paymentResponse = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
      headers: { Authorization: `Bearer ${Deno.env.get("MP_ACCESS_TOKEN")}` },
    });
    if (!paymentResponse.ok) return new Response("ok", { status: 200 });

    const payment = await paymentResponse.json();
    const externalReference: string | undefined = payment.external_reference;
    const status: string = payment.status;
    if (!externalReference) return new Response("ok", { status: 200 });

    const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

    const { data: purchase } = await supabase
      .from("premium_purchases")
      .select("id, user_id, plan, status")
      .eq("external_reference", externalReference)
      .maybeSingle();

    // Pedido desconhecido, ou já processado antes (o MP pode reenviar a
    // mesma notificação mais de uma vez — idempotência evita liberar de novo).
    if (!purchase || purchase.status === "approved") return new Response("ok", { status: 200 });

    if (status === "approved") {
      const days = PLAN_DAYS[purchase.plan] ?? 30;

      const { data: profile } = await supabase
        .from("profiles")
        .select("role, premium_until")
        .eq("id", purchase.user_id)
        .maybeSingle();

      // Renovar antes de vencer soma dias ao que já resta, em vez de reiniciar o contador.
      const base =
        profile?.premium_until && new Date(profile.premium_until) > new Date() ? new Date(profile.premium_until) : new Date();
      const expiresAt = new Date(base.getTime() + days * 24 * 60 * 60 * 1000);

      await supabase
        .from("premium_purchases")
        .update({
          status: "approved",
          mp_payment_id: String(paymentId),
          approved_at: new Date().toISOString(),
          expires_at: expiresAt.toISOString(),
        })
        .eq("id", purchase.id);

      // Nunca rebaixa um admin que por acaso passou pelo checkout.
      const nextRole = profile?.role === "admin" ? "admin" : "premium";
      await supabase.from("profiles").update({ role: nextRole, premium_until: expiresAt.toISOString() }).eq("id", purchase.user_id);
    } else if (status === "rejected" || status === "cancelled") {
      await supabase
        .from("premium_purchases")
        .update({ status: status === "rejected" ? "declined" : "cancelled", mp_payment_id: String(paymentId) })
        .eq("id", purchase.id);
    }
    // pending/in_process: aguarda a próxima notificação, nenhuma ação ainda.

    return new Response("ok", { status: 200 });
  } catch (err) {
    console.error(err);
    return new Response("ok", { status: 200 });
  }
});
