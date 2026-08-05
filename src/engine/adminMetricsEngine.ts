import { supabase } from "@/lib/supabaseClient";

export type MetricsPeriod = "7d" | "30d" | "90d" | "all";

function periodSince(period: MetricsPeriod): string | null {
  if (period === "all") return null;
  const days = period === "7d" ? 7 : period === "30d" ? 30 : 90;
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString();
}

export interface OverviewMetrics {
  totalAccesses: number;
  activeUsers: number;
  newSignups: number;
  dailyAccesses: { label: string; value: number }[];
}

const EMPTY_OVERVIEW: OverviewMetrics = { totalAccesses: 0, activeUsers: 0, newSignups: 0, dailyAccesses: [] };

export async function fetchOverviewMetrics(period: MetricsPeriod): Promise<OverviewMetrics> {
  if (!supabase) return EMPTY_OVERVIEW;
  try {
    const since = periodSince(period);

    const accessQuery = since
      ? supabase.from("page_views").select("*", { count: "exact", head: true }).gte("created_at", since)
      : supabase.from("page_views").select("*", { count: "exact", head: true });
    const { count: totalAccesses } = await accessQuery;

    const usersQuery = since
      ? supabase.from("page_views").select("user_id").gte("created_at", since)
      : supabase.from("page_views").select("user_id");
    const { data: userRows } = await usersQuery;
    const activeUsers = new Set((userRows ?? []).map((r) => r.user_id).filter(Boolean)).size;

    const signupQuery = since
      ? supabase.from("profiles").select("*", { count: "exact", head: true }).gte("created_at", since)
      : supabase.from("profiles").select("*", { count: "exact", head: true });
    const { count: newSignups } = await signupQuery;

    const dailyQuery = since
      ? supabase.from("page_views").select("created_at").gte("created_at", since)
      : supabase.from("page_views").select("created_at");
    const { data: dailyRows } = await dailyQuery;
    const byDay = new Map<string, number>();
    for (const row of dailyRows ?? []) {
      const day = (row.created_at as string).slice(0, 10);
      byDay.set(day, (byDay.get(day) ?? 0) + 1);
    }
    const dailyAccesses = Array.from(byDay.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([day, value]) => ({
        label: new Date(`${day}T00:00:00`).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" }),
        value,
      }));

    return {
      totalAccesses: totalAccesses ?? 0,
      activeUsers,
      newSignups: newSignups ?? 0,
      dailyAccesses,
    };
  } catch {
    return EMPTY_OVERVIEW;
  }
}

export interface LibraryMetrics {
  totalBooks: number;
  byStatus: Record<string, number>;
  free: number;
  paid: number;
  newBooks: number;
  totalRatings: number;
}

const EMPTY_LIBRARY: LibraryMetrics = { totalBooks: 0, byStatus: {}, free: 0, paid: 0, newBooks: 0, totalRatings: 0 };

export async function fetchLibraryMetrics(period: MetricsPeriod): Promise<LibraryMetrics> {
  if (!supabase) return EMPTY_LIBRARY;
  try {
    const since = periodSince(period);

    const { count: totalBooks } = await supabase.from("books").select("*", { count: "exact", head: true });

    const { data: statusRows } = await supabase.from("books").select("status, is_free");
    const byStatus: Record<string, number> = {};
    let free = 0;
    let paid = 0;
    for (const row of statusRows ?? []) {
      byStatus[row.status] = (byStatus[row.status] ?? 0) + 1;
      if (row.is_free) free++;
      else paid++;
    }

    const newBooksQuery = since
      ? supabase.from("books").select("*", { count: "exact", head: true }).gte("created_at", since)
      : supabase.from("books").select("*", { count: "exact", head: true });
    const { count: newBooks } = await newBooksQuery;

    const { count: totalRatings } = await supabase.from("book_ratings").select("*", { count: "exact", head: true });

    return {
      totalBooks: totalBooks ?? 0,
      byStatus,
      free,
      paid,
      newBooks: newBooks ?? 0,
      totalRatings: totalRatings ?? 0,
    };
  } catch {
    return EMPTY_LIBRARY;
  }
}

export interface ReadingMetrics {
  totalEntries: number;
  byStatus: Record<string, number>;
  avgProgress: number;
  newEntries: number;
}

const EMPTY_READING: ReadingMetrics = { totalEntries: 0, byStatus: {}, avgProgress: 0, newEntries: 0 };

export async function fetchReadingMetrics(period: MetricsPeriod): Promise<ReadingMetrics> {
  if (!supabase) return EMPTY_READING;
  try {
    const since = periodSince(period);

    const { data: rows } = await supabase.from("user_library").select("reading_status, progress");
    const byStatus: Record<string, number> = {};
    let progressSum = 0;
    for (const row of rows ?? []) {
      byStatus[row.reading_status] = (byStatus[row.reading_status] ?? 0) + 1;
      progressSum += row.progress ?? 0;
    }
    const totalEntries = rows?.length ?? 0;
    const avgProgress = totalEntries > 0 ? progressSum / totalEntries : 0;

    const newQuery = since
      ? supabase.from("user_library").select("*", { count: "exact", head: true }).gte("acquired_at", since)
      : supabase.from("user_library").select("*", { count: "exact", head: true });
    const { count: newEntries } = await newQuery;

    return { totalEntries, byStatus, avgProgress, newEntries: newEntries ?? 0 };
  } catch {
    return EMPTY_READING;
  }
}

export interface CommunityMetrics {
  totalComments: number;
  totalLikes: number;
  totalReports: number;
  ticketsByStatus: Record<string, number>;
  newComments: number;
}

const EMPTY_COMMUNITY: CommunityMetrics = {
  totalComments: 0,
  totalLikes: 0,
  totalReports: 0,
  ticketsByStatus: {},
  newComments: 0,
};

export async function fetchCommunityMetrics(period: MetricsPeriod): Promise<CommunityMetrics> {
  if (!supabase) return EMPTY_COMMUNITY;
  try {
    const since = periodSince(period);

    const { count: totalComments } = await supabase.from("book_comments").select("*", { count: "exact", head: true });
    const { count: totalLikes } = await supabase.from("comment_likes").select("*", { count: "exact", head: true });
    const { count: totalReports } = await supabase.from("comment_reports").select("*", { count: "exact", head: true });

    const { data: ticketRows } = await supabase.from("support_messages").select("status");
    const ticketsByStatus: Record<string, number> = {};
    for (const row of ticketRows ?? []) {
      ticketsByStatus[row.status] = (ticketsByStatus[row.status] ?? 0) + 1;
    }

    const newCommentsQuery = since
      ? supabase.from("book_comments").select("*", { count: "exact", head: true }).gte("created_at", since)
      : supabase.from("book_comments").select("*", { count: "exact", head: true });
    const { count: newComments } = await newCommentsQuery;

    return {
      totalComments: totalComments ?? 0,
      totalLikes: totalLikes ?? 0,
      totalReports: totalReports ?? 0,
      ticketsByStatus,
      newComments: newComments ?? 0,
    };
  } catch {
    return EMPTY_COMMUNITY;
  }
}

export interface TopAuthor {
  ownerId: string;
  displayName: string | null;
  bookCount: number;
}

export interface TopBook {
  id: string;
  title: string;
  ratingAvg: number;
  ratingCount: number;
}

export interface AuthorMetrics {
  totalAuthors: number;
  topAuthors: TopAuthor[];
  topBooks: TopBook[];
}

const EMPTY_AUTHORS: AuthorMetrics = { totalAuthors: 0, topAuthors: [], topBooks: [] };

/** Sem filtro de período — ranking é sempre "hoje", não faz sentido limitar por data. */
export async function fetchAuthorMetrics(): Promise<AuthorMetrics> {
  if (!supabase) return EMPTY_AUTHORS;
  try {
    const { data: bookRows } = await supabase.from("books").select("owner_id").not("owner_id", "is", null);
    const countByOwner = new Map<string, number>();
    for (const row of bookRows ?? []) {
      if (!row.owner_id) continue;
      countByOwner.set(row.owner_id, (countByOwner.get(row.owner_id) ?? 0) + 1);
    }
    const totalAuthors = countByOwner.size;

    const topOwnerIds = Array.from(countByOwner.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([id]) => id);

    const { data: profileRows } = topOwnerIds.length
      ? await supabase.from("public_profiles").select("id, display_name").in("id", topOwnerIds)
      : { data: [] as { id: string; display_name: string | null }[] };
    const nameById = new Map((profileRows ?? []).map((p) => [p.id as string, p.display_name as string | null]));

    const topAuthors: TopAuthor[] = topOwnerIds.map((id) => ({
      ownerId: id,
      displayName: nameById.get(id) ?? null,
      bookCount: countByOwner.get(id) ?? 0,
    }));

    const { data: topBookRows } = await supabase
      .from("books")
      .select("id, title, rating_avg, rating_count")
      .gt("rating_count", 0)
      .order("rating_avg", { ascending: false })
      .limit(5);

    const topBooks: TopBook[] = (topBookRows ?? []).map((b) => ({
      id: b.id,
      title: b.title,
      ratingAvg: b.rating_avg,
      ratingCount: b.rating_count,
    }));

    return { totalAuthors, topAuthors, topBooks };
  } catch {
    return EMPTY_AUTHORS;
  }
}

export interface FinancialMetrics {
  totalRevenue: number;
  periodRevenue: number;
  activeSubscribers: number;
  byPlan: Record<string, number>;
  byStatus: Record<string, number>;
}

const EMPTY_FINANCIAL: FinancialMetrics = {
  totalRevenue: 0,
  periodRevenue: 0,
  activeSubscribers: 0,
  byPlan: {},
  byStatus: {},
};

export async function fetchFinancialMetrics(period: MetricsPeriod): Promise<FinancialMetrics> {
  if (!supabase) return EMPTY_FINANCIAL;
  try {
    const since = periodSince(period);

    const { data: rows } = await supabase.from("premium_purchases").select("plan, amount, status, approved_at");
    let totalRevenue = 0;
    let periodRevenue = 0;
    const byPlan: Record<string, number> = {};
    const byStatus: Record<string, number> = {};
    for (const row of rows ?? []) {
      byStatus[row.status] = (byStatus[row.status] ?? 0) + 1;
      if (row.status === "approved") {
        byPlan[row.plan] = (byPlan[row.plan] ?? 0) + 1;
        totalRevenue += row.amount ?? 0;
        if (!since || (row.approved_at && row.approved_at >= since)) {
          periodRevenue += row.amount ?? 0;
        }
      }
    }

    const { count: activeSubscribers } = await supabase
      .from("profiles")
      .select("*", { count: "exact", head: true })
      .eq("role", "premium")
      .gt("premium_until", new Date().toISOString());

    return { totalRevenue, periodRevenue, activeSubscribers: activeSubscribers ?? 0, byPlan, byStatus };
  } catch {
    return EMPTY_FINANCIAL;
  }
}
