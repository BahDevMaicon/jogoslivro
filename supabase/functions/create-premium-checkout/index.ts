// Cria uma preferência de pagamento (Checkout Pro) no Mercado Pago para o
// plano premium escolhido, e devolve o link (`init_point`) para o navegador
// redirecionar. Chamada autenticada (supabase.functions.invoke já encaminha
// o JWT do usuário logado) — o MP_ACCESS_TOKEN nunca sai deste servidor.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const PLAN_CONFIG: Record<string, { title: string; amount: number }> = {
  monthly: { title: "LivroQuest Premium — 30 dias", amount: 9.9 },
  annual: { title: "LivroQuest Premium — 1 ano", amount: 89.9 },
};

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const { plan } = await req.json();
    const config = PLAN_CONFIG[plan];
    if (!config) return jsonResponse({ error: "Plano inválido." }, 400);

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return jsonResponse({ error: "Não autenticado." }, 401);

    const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError || !userData.user) return jsonResponse({ error: "Não autenticado." }, 401);
    const userId = userData.user.id;

    const externalReference = crypto.randomUUID();

    const { error: insertError } = await supabase
      .from("premium_purchases")
      .insert({ user_id: userId, plan, amount: config.amount, external_reference: externalReference });
    if (insertError) return jsonResponse({ error: insertError.message }, 500);

    const siteUrl = Deno.env.get("SITE_URL") ?? "http://localhost:5173";
    const projectUrl = Deno.env.get("SUPABASE_URL")!;

    const mpResponse = await fetch("https://api.mercadopago.com/checkout/preferences", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${Deno.env.get("MP_ACCESS_TOKEN")}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        items: [{ title: config.title, quantity: 1, currency_id: "BRL", unit_price: config.amount }],
        external_reference: externalReference,
        back_urls: {
          success: `${siteUrl}/premium/retorno?status=approved`,
          pending: `${siteUrl}/premium/retorno?status=pending`,
          failure: `${siteUrl}/premium/retorno?status=failure`,
        },
        notification_url: `${projectUrl}/functions/v1/mp-webhook`,
      }),
    });

    const mpData = await mpResponse.json();
    if (!mpResponse.ok) {
      return jsonResponse({ error: mpData.message ?? "Falha ao criar pagamento no Mercado Pago." }, 502);
    }

    await supabase.from("premium_purchases").update({ mp_preference_id: mpData.id }).eq("external_reference", externalReference);

    // O Mercado Pago sempre devolve os dois links (`init_point` e
    // `sandbox_init_point`), mesmo com credencial de produção — não dá pra
    // diferenciar pela presença do campo. Por isso o ambiente é explícito
    // via secret `MP_ENV` ("production" | "test", default "test" por
    // segurança — errar pro lado do sandbox nunca cobra ninguém à toa).
    const isProduction = Deno.env.get("MP_ENV") === "production";
    const checkoutUrl = isProduction ? mpData.init_point : mpData.sandbox_init_point ?? mpData.init_point;

    return jsonResponse({ init_point: checkoutUrl });
  } catch (err) {
    return jsonResponse({ error: String(err) }, 500);
  }
});
