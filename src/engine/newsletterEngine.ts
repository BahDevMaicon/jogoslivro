/**
 * Inscrição de novidades — apenas local por enquanto (sem envio real a
 * nenhum serviço de email). Guarda os emails em `localStorage` para permitir
 * validar a interface até uma ferramenta de verdade ser conectada.
 */

const SIGNUPS_KEY = "livro-jogo:newsletter-signups";

interface NewsletterSignup {
  email: string;
  subscribedAt: string;
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function readSignups(): NewsletterSignup[] {
  try {
    const raw = window.localStorage.getItem(SIGNUPS_KEY);
    return raw ? (JSON.parse(raw) as NewsletterSignup[]) : [];
  } catch {
    return [];
  }
}

export interface SubscribeResult {
  success: boolean;
  error?: string;
}

export function subscribeEmail(email: string): SubscribeResult {
  const normalized = email.trim().toLowerCase();
  if (!EMAIL_PATTERN.test(normalized)) {
    return { success: false, error: "Digite um email válido." };
  }

  const signups = readSignups();
  if (!signups.some((s) => s.email === normalized)) {
    signups.push({ email: normalized, subscribedAt: new Date().toISOString() });
    window.localStorage.setItem(SIGNUPS_KEY, JSON.stringify(signups));
  }

  return { success: true };
}
