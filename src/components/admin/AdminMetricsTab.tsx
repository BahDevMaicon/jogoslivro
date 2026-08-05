import { useEffect, useState, type ReactNode } from "react";
import { BarChart3, Bookmark, BookOpen, MessageSquare, PenSquare, Wallet } from "lucide-react";
import { SelectField } from "@/components/editor/fields";
import { MiniBarChart } from "@/components/admin/MiniBarChart";
import {
  fetchAuthorMetrics,
  fetchCommunityMetrics,
  fetchFinancialMetrics,
  fetchLibraryMetrics,
  fetchOverviewMetrics,
  fetchReadingMetrics,
  type AuthorMetrics,
  type CommunityMetrics,
  type FinancialMetrics,
  type LibraryMetrics,
  type MetricsPeriod,
  type OverviewMetrics,
  type ReadingMetrics,
} from "@/engine/adminMetricsEngine";
import { STATUS_LABEL as BOOK_STATUS_LABEL } from "@/lib/bookStatus";
import { STATUS_LABEL as TICKET_STATUS_LABEL } from "@/lib/supportStatus";

const PERIOD_OPTIONS = [
  { value: "7d", label: "Últimos 7 dias" },
  { value: "30d", label: "Últimos 30 dias" },
  { value: "90d", label: "Últimos 90 dias" },
  { value: "all", label: "Todo o período" },
];

const READING_STATUS_LABEL: Record<string, string> = {
  not_started: "Não iniciado",
  in_progress: "Em andamento",
  completed: "Concluído",
};

const PURCHASE_STATUS_LABEL: Record<string, string> = {
  pending: "Pendente",
  approved: "Aprovada",
  declined: "Recusada",
  cancelled: "Cancelada",
};

const PLAN_LABEL: Record<string, string> = { monthly: "Mensal", annual: "Anual" };

function StatTile({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-md border border-parchment-700/30 bg-nightwood-900/40 p-3 text-center">
      <p className="font-display text-2xl text-parchment-50">{value}</p>
      <p className="text-xs uppercase tracking-wide text-parchment-400">{label}</p>
    </div>
  );
}

function ProportionalBars({ data, labels }: { data: Record<string, number>; labels: Record<string, string> }) {
  const entries = Object.entries(data);
  const total = entries.reduce((sum, [, v]) => sum + v, 0);
  if (total === 0) return <p className="text-sm text-parchment-400/70">Sem dados.</p>;

  return (
    <div className="flex flex-col gap-1.5">
      {entries.map(([key, value]) => (
        <div key={key} className="flex items-center gap-2 text-xs">
          <span className="w-28 shrink-0 text-parchment-300">{labels[key] ?? key}</span>
          <div className="h-2 flex-1 overflow-hidden rounded-full bg-nightwood-900">
            <div className="h-full rounded-full bg-ember-500" style={{ width: `${(value / total) * 100}%` }} />
          </div>
          <span className="w-8 shrink-0 text-right text-parchment-400">{value}</span>
        </div>
      ))}
    </div>
  );
}

function Section({ icon: Icon, title, children }: { icon: typeof BarChart3; title: string; children: ReactNode }) {
  return (
    <div className="parchment-card p-5">
      <h3 className="mb-4 flex items-center gap-2 font-display text-base text-parchment-50">
        <Icon className="h-4 w-4 text-ember-400" aria-hidden="true" /> {title}
      </h3>
      {children}
    </div>
  );
}

export function AdminMetricsTab() {
  const [period, setPeriod] = useState<MetricsPeriod>("30d");
  const [loading, setLoading] = useState(true);
  const [overview, setOverview] = useState<OverviewMetrics | null>(null);
  const [library, setLibrary] = useState<LibraryMetrics | null>(null);
  const [reading, setReading] = useState<ReadingMetrics | null>(null);
  const [community, setCommunity] = useState<CommunityMetrics | null>(null);
  const [authors, setAuthors] = useState<AuthorMetrics | null>(null);
  const [financial, setFinancial] = useState<FinancialMetrics | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    Promise.all([
      fetchOverviewMetrics(period),
      fetchLibraryMetrics(period),
      fetchReadingMetrics(period),
      fetchCommunityMetrics(period),
      fetchAuthorMetrics(),
      fetchFinancialMetrics(period),
    ]).then(([o, l, r, c, a, f]) => {
      if (cancelled) return;
      setOverview(o);
      setLibrary(l);
      setReading(r);
      setCommunity(c);
      setAuthors(a);
      setFinancial(f);
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [period]);

  return (
    <div className="flex flex-col gap-4">
      <SelectField label="Período" value={period} onChange={(v) => setPeriod(v as MetricsPeriod)} options={PERIOD_OPTIONS} />

      {loading && <p className="font-serif text-parchment-300">Carregando...</p>}

      {!loading && overview && (
        <Section icon={BarChart3} title="Visão geral">
          <div className="mb-4 grid grid-cols-3 gap-3">
            <StatTile label="Acessos" value={overview.totalAccesses} />
            <StatTile label="Usuários ativos" value={overview.activeUsers} />
            <StatTile label="Novos cadastros" value={overview.newSignups} />
          </div>
          <MiniBarChart data={overview.dailyAccesses} />
        </Section>
      )}

      {!loading && library && (
        <Section icon={BookOpen} title="Biblioteca">
          <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <StatTile label="Total de livros" value={library.totalBooks} />
            <StatTile label="Novos no período" value={library.newBooks} />
            <StatTile label="Gratuitos" value={library.free} />
            <StatTile label="Pagos" value={library.paid} />
          </div>
          <ProportionalBars data={library.byStatus} labels={BOOK_STATUS_LABEL} />
        </Section>
      )}

      {!loading && reading && (
        <Section icon={Bookmark} title="Leitura">
          <div className="mb-4 grid grid-cols-3 gap-3">
            <StatTile label="Entradas na biblioteca" value={reading.totalEntries} />
            <StatTile label="Novas no período" value={reading.newEntries} />
            <StatTile label="Progresso médio" value={`${reading.avgProgress.toFixed(0)}%`} />
          </div>
          <ProportionalBars data={reading.byStatus} labels={READING_STATUS_LABEL} />
        </Section>
      )}

      {!loading && community && (
        <Section icon={MessageSquare} title="Comunidade">
          <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <StatTile label="Comentários" value={community.totalComments} />
            <StatTile label="Curtidas" value={community.totalLikes} />
            <StatTile label="Denúncias" value={community.totalReports} />
            <StatTile label="Novos comentários" value={community.newComments} />
          </div>
          <ProportionalBars data={community.ticketsByStatus} labels={TICKET_STATUS_LABEL} />
        </Section>
      )}

      {!loading && authors && (
        <Section icon={PenSquare} title="Autores">
          <div className="mb-4">
            <StatTile label="Total de autores" value={authors.totalAuthors} />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <p className="mb-2 text-xs uppercase tracking-wide text-parchment-400">Top autores por nº de livros</p>
              <ol className="flex flex-col gap-1 text-sm text-parchment-200/85">
                {authors.topAuthors.length === 0 && <li className="text-parchment-400/70">Sem dados.</li>}
                {authors.topAuthors.map((a) => (
                  <li key={a.ownerId} className="flex justify-between">
                    <span>{a.displayName || "(sem nome)"}</span>
                    <span className="text-parchment-400">{a.bookCount}</span>
                  </li>
                ))}
              </ol>
            </div>
            <div>
              <p className="mb-2 text-xs uppercase tracking-wide text-parchment-400">Top livros por avaliação</p>
              <ol className="flex flex-col gap-1 text-sm text-parchment-200/85">
                {authors.topBooks.length === 0 && <li className="text-parchment-400/70">Sem dados.</li>}
                {authors.topBooks.map((b) => (
                  <li key={b.id} className="flex justify-between">
                    <span>{b.title}</span>
                    <span className="text-parchment-400">
                      {b.ratingAvg.toFixed(1)} ({b.ratingCount})
                    </span>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </Section>
      )}

      {!loading && financial && (
        <Section icon={Wallet} title="Financeiro">
          <div className="mb-4 grid grid-cols-3 gap-3">
            <StatTile label="Receita total" value={`R$ ${financial.totalRevenue.toFixed(2)}`} />
            <StatTile label="Receita no período" value={`R$ ${financial.periodRevenue.toFixed(2)}`} />
            <StatTile label="Assinantes ativos" value={financial.activeSubscribers} />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <p className="mb-2 text-xs uppercase tracking-wide text-parchment-400">Compras por plano</p>
              <ProportionalBars data={financial.byPlan} labels={PLAN_LABEL} />
            </div>
            <div>
              <p className="mb-2 text-xs uppercase tracking-wide text-parchment-400">Compras por status</p>
              <ProportionalBars data={financial.byStatus} labels={PURCHASE_STATUS_LABEL} />
            </div>
          </div>
        </Section>
      )}
    </div>
  );
}
