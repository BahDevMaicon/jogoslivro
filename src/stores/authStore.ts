import { create } from "zustand";
import { supabase } from "@/lib/supabaseClient";
import { useLibraryStore } from "@/stores/libraryStore";
import { useBookEditorStore } from "@/stores/bookEditorStore";

export type UserRole = "admin" | "premium" | "normal";
export type UserStatus = "active" | "blocked" | "pending" | "deleted";

export interface CurrentUser {
  id: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  displayName: string | null;
  avatarUrl: string | null;
}

interface ProfileRow {
  role: UserRole;
  status: UserStatus;
  display_name: string | null;
  avatar_url: string | null;
}

interface AuthState {
  /** `null` enquanto deslogado. Carregado do Supabase Auth + tabela `profiles` (papel/status reais, não confiáveis só no frontend). */
  currentUser: CurrentUser | null;
  /** `true` até a sessão inicial do Supabase ser resolvida — evita redirecionar para /login antes de saber se já existe sessão. */
  initializing: boolean;
  loading: boolean;
  error: string | null;
  /** `true` quando o cadastro exige confirmação por email (configuração do projeto Supabase) antes de liberar sessão. */
  pendingConfirmation: boolean;
  register: (email: string, password: string) => Promise<boolean>;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

function translateAuthError(message: string): string {
  if (message.includes("Invalid login credentials")) return "Email ou senha incorretos.";
  if (message.includes("Email not confirmed")) return "Confirme seu email antes de entrar (verifique sua caixa de entrada).";
  if (message.includes("already registered")) return "Já existe uma conta com este email.";
  if (message.includes("Password should be at least")) return "A senha precisa ter ao menos 6 caracteres.";
  if (message.includes("valid email")) return "Digite um email válido.";
  return message;
}

async function loadProfile(userId: string, email: string): Promise<CurrentUser | null> {
  if (!supabase) return null;
  const { data, error } = await supabase
    .from("profiles")
    .select("role, status, display_name, avatar_url")
    .eq("id", userId)
    .single();
  if (error || !data) return null;
  const row = data as ProfileRow;
  return {
    id: userId,
    email,
    role: row.role,
    status: row.status,
    displayName: row.display_name,
    avatarUrl: row.avatar_url,
  };
}

export const useAuthStore = create<AuthState>()((set, get) => {
  if (supabase) {
    supabase.auth.getSession().then(async ({ data }) => {
      const session = data.session;
      if (session?.user) {
        const profile = await loadProfile(session.user.id, session.user.email ?? "");
        set({ currentUser: profile, initializing: false });
      } else {
        set({ initializing: false });
      }
    });

    supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        const profile = await loadProfile(session.user.id, session.user.email ?? "");
        set({ currentUser: profile });
      } else {
        set({ currentUser: null });
      }
    });
  }

  return {
    currentUser: null,
    initializing: Boolean(supabase),
    loading: false,
    error: null,
    pendingConfirmation: false,

    register: async (email, password) => {
      if (!supabase) {
        set({ error: "Backend não configurado (faltam as variáveis de ambiente do Supabase)." });
        return false;
      }
      set({ loading: true, error: null, pendingConfirmation: false });
      const { data, error } = await supabase.auth.signUp({
        email: email.trim().toLowerCase(),
        password,
      });
      if (error) {
        set({ loading: false, error: translateAuthError(error.message) });
        return false;
      }
      if (data.session && data.user) {
        const profile = await loadProfile(data.user.id, data.user.email ?? "");
        set({ loading: false, error: null, currentUser: profile });
        return true;
      }
      // Projeto com confirmação por email habilitada: sem sessão até o usuário confirmar.
      set({ loading: false, error: null, pendingConfirmation: true });
      return false;
    },

    login: async (email, password) => {
      if (!supabase) {
        set({ error: "Backend não configurado (faltam as variáveis de ambiente do Supabase)." });
        return false;
      }
      set({ loading: true, error: null, pendingConfirmation: false });
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password,
      });
      if (error) {
        set({ loading: false, error: translateAuthError(error.message) });
        return false;
      }
      const profile = await loadProfile(data.user.id, data.user.email ?? "");
      if (profile && (profile.status === "blocked" || profile.status === "deleted")) {
        await supabase.auth.signOut();
        set({ loading: false, error: "Esta conta está bloqueada ou foi removida.", currentUser: null });
        return false;
      }
      set({ loading: false, error: null, currentUser: profile });
      return true;
    },

    logout: async () => {
      if (supabase) await supabase.auth.signOut();
      set({ currentUser: null, error: null });
      // Limpa contexto de conta: rascunhos locais e livro em edição não podem
      // continuar visíveis para quem loga em seguida no mesmo navegador.
      useLibraryStore.getState().resetLibrary();
      void useLibraryStore.getState().loadLibrary();
      useBookEditorStore.getState().loadForCreate();
    },

    refreshProfile: async () => {
      const user = get().currentUser;
      if (!user || !supabase) return;
      const profile = await loadProfile(user.id, user.email);
      if (profile) set({ currentUser: profile });
    },
  };
});
