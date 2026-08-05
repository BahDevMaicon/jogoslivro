import { useState } from "react";
import { BarChart3, BookOpen, LifeBuoy, Shield, Users } from "lucide-react";
import { SiteNav } from "@/components/layout/SiteNav";
import { AdminUsersTab } from "@/components/admin/AdminUsersTab";
import { AdminBooksTab } from "@/components/admin/AdminBooksTab";
import { AdminSupportTab } from "@/components/admin/AdminSupportTab";
import { AdminMetricsTab } from "@/components/admin/AdminMetricsTab";

type AdminTab = "metricas" | "usuarios" | "livros" | "suporte";

export default function AdminPage() {
  const [tab, setTab] = useState<AdminTab>("metricas");

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <SiteNav />
      <header className="mb-6 flex items-center gap-3">
        <Shield className="h-6 w-6 text-ember-400" aria-hidden="true" />
        <h1 className="font-display text-2xl text-parchment-50 sm:text-3xl">Administração</h1>
      </header>

      <nav className="mb-6 flex gap-2 border-b border-parchment-700/30 pb-3">
        <button
          type="button"
          className={`flex items-center gap-2 rounded-md px-3 py-2 text-sm transition ${
            tab === "metricas" ? "bg-ember-600/20 text-ember-300" : "text-parchment-300 hover:bg-nightwood-800"
          }`}
          onClick={() => setTab("metricas")}
        >
          <BarChart3 className="h-4 w-4" aria-hidden="true" /> Métricas
        </button>
        <button
          type="button"
          className={`flex items-center gap-2 rounded-md px-3 py-2 text-sm transition ${
            tab === "usuarios" ? "bg-ember-600/20 text-ember-300" : "text-parchment-300 hover:bg-nightwood-800"
          }`}
          onClick={() => setTab("usuarios")}
        >
          <Users className="h-4 w-4" aria-hidden="true" /> Usuários
        </button>
        <button
          type="button"
          className={`flex items-center gap-2 rounded-md px-3 py-2 text-sm transition ${
            tab === "livros" ? "bg-ember-600/20 text-ember-300" : "text-parchment-300 hover:bg-nightwood-800"
          }`}
          onClick={() => setTab("livros")}
        >
          <BookOpen className="h-4 w-4" aria-hidden="true" /> Livros
        </button>
        <button
          type="button"
          className={`flex items-center gap-2 rounded-md px-3 py-2 text-sm transition ${
            tab === "suporte" ? "bg-ember-600/20 text-ember-300" : "text-parchment-300 hover:bg-nightwood-800"
          }`}
          onClick={() => setTab("suporte")}
        >
          <LifeBuoy className="h-4 w-4" aria-hidden="true" /> Suporte
        </button>
      </nav>

      {tab === "metricas" ? (
        <AdminMetricsTab />
      ) : (
        <div className="parchment-card p-5">
          {tab === "usuarios" && <AdminUsersTab />}
          {tab === "livros" && <AdminBooksTab />}
          {tab === "suporte" && <AdminSupportTab />}
        </div>
      )}
    </div>
  );
}
