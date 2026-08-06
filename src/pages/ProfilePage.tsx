import { useEffect, useState, type FormEvent } from "react";
import { Save, ShieldAlert, ShieldCheck, UserCircle } from "lucide-react";
import { SiteNav } from "@/components/layout/SiteNav";
import { useAuthStore } from "@/stores/authStore";
import { supabase } from "@/lib/supabaseClient";
import { ImageUrlField } from "@/components/editor/ImageUrlField";

const ROLE_LABEL: Record<string, string> = {
  admin: "Administrador geral",
  premium: "Usuário premium",
  normal: "Usuário",
};

export default function ProfilePage() {
  const currentUser = useAuthStore((s) => s.currentUser);
  const refreshProfile = useAuthStore((s) => s.refreshProfile);

  const [displayName, setDisplayName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [description, setDescription] = useState("");
  const [biography, setBiography] = useState("");
  const [city, setCity] = useState("");
  const [country, setCountry] = useState("");
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ kind: "success" | "error"; message: string } | null>(null);

  useEffect(() => {
    if (!currentUser || !supabase) return;
    supabase
      .from("profiles")
      .select("display_name, avatar_url, description, biography, city, country")
      .eq("id", currentUser.id)
      .single()
      .then(({ data }) => {
        if (!data) return;
        const row = data as {
          display_name: string | null;
          avatar_url: string | null;
          description: string | null;
          biography: string | null;
          city: string | null;
          country: string | null;
        };
        setDisplayName(row.display_name ?? "");
        setAvatarUrl(row.avatar_url ?? "");
        setDescription(row.description ?? "");
        setBiography(row.biography ?? "");
        setCity(row.city ?? "");
        setCountry(row.country ?? "");
      });
  }, [currentUser]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!currentUser || !supabase) return;

    setSaving(true);
    setFeedback(null);
    const { error } = await supabase
      .from("profiles")
      .update({
        display_name: displayName.trim() || null,
        avatar_url: avatarUrl.trim() || null,
        description: description.trim() || null,
        biography: biography.trim() || null,
        city: city.trim() || null,
        country: country.trim() || null,
      })
      .eq("id", currentUser.id);

    setSaving(false);
    if (error) {
      setFeedback({ kind: "error", message: "Não foi possível salvar o perfil. Tente novamente." });
      return;
    }
    await refreshProfile();
    setFeedback({ kind: "success", message: "Perfil atualizado." });
  }

  if (!currentUser) return null;

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
      <SiteNav />

      <header className="mb-8 text-center">
        <div className="mb-3 flex items-center justify-center gap-2 text-ember-400">
          <UserCircle className="h-6 w-6" aria-hidden="true" />
        </div>
        <h1 className="font-display text-2xl text-parchment-50 sm:text-3xl">Meu perfil</h1>
        <p className="mt-2 font-serif text-sm text-parchment-300/70">
          {currentUser.email} &middot; {ROLE_LABEL[currentUser.role] ?? currentUser.role}
        </p>
      </header>

      <div className="parchment-card p-6 sm:p-8">
        {feedback && (
          <p
            className={`mb-4 flex items-center gap-2 rounded-md border p-2 text-sm ${
              feedback.kind === "success"
                ? "border-moss-700/40 bg-moss-950/20 text-moss-200"
                : "border-red-800/50 bg-red-950/30 text-red-200"
            }`}
          >
            {feedback.kind === "success" ? (
              <ShieldCheck className="h-4 w-4 shrink-0" aria-hidden="true" />
            ) : (
              <ShieldAlert className="h-4 w-4 shrink-0" aria-hidden="true" />
            )}
            {feedback.message}
          </p>
        )}

        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          <label className="block">
            <span className="mb-1 block font-display text-sm uppercase tracking-wide text-ember-400">
              Nome de exibição
            </span>
            <input
              type="text"
              className="w-full rounded-md border border-parchment-700/40 bg-nightwood-900 px-4 py-3 font-serif text-parchment-50 outline-none focus-visible:border-ember-400"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
            />
          </label>

          <ImageUrlField label="URL do avatar" value={avatarUrl} onChange={setAvatarUrl} />

          <div className="grid grid-cols-2 gap-4">
            <label className="block">
              <span className="mb-1 block font-display text-sm uppercase tracking-wide text-ember-400">Cidade</span>
              <input
                type="text"
                className="w-full rounded-md border border-parchment-700/40 bg-nightwood-900 px-4 py-3 font-serif text-parchment-50 outline-none focus-visible:border-ember-400"
                value={city}
                onChange={(e) => setCity(e.target.value)}
              />
            </label>
            <label className="block">
              <span className="mb-1 block font-display text-sm uppercase tracking-wide text-ember-400">País</span>
              <input
                type="text"
                className="w-full rounded-md border border-parchment-700/40 bg-nightwood-900 px-4 py-3 font-serif text-parchment-50 outline-none focus-visible:border-ember-400"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
              />
            </label>
          </div>

          <label className="block">
            <span className="mb-1 block font-display text-sm uppercase tracking-wide text-ember-400">
              Descrição curta
            </span>
            <input
              type="text"
              maxLength={160}
              className="w-full rounded-md border border-parchment-700/40 bg-nightwood-900 px-4 py-3 font-serif text-parchment-50 outline-none focus-visible:border-ember-400"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </label>

          <label className="block">
            <span className="mb-1 block font-display text-sm uppercase tracking-wide text-ember-400">Biografia</span>
            <textarea
              rows={4}
              className="w-full rounded-md border border-parchment-700/40 bg-nightwood-900 px-4 py-3 font-serif text-parchment-50 outline-none focus-visible:border-ember-400"
              value={biography}
              onChange={(e) => setBiography(e.target.value)}
            />
          </label>

          <button type="submit" className="btn-primary mt-2" disabled={saving}>
            <Save className="h-4 w-4" aria-hidden="true" />
            {saving ? "Salvando..." : "Salvar perfil"}
          </button>
        </form>
      </div>
    </div>
  );
}
