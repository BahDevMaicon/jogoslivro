import { useEffect, useState } from "react";
import { Users } from "lucide-react";
import type { LibraryBookEntry } from "@/stores/libraryStore";
import { supabase } from "@/lib/supabaseClient";

interface BookStatsTabProps {
  entry: LibraryBookEntry;
}

/** Preview honesto: só a contagem de leitores existe de verdade hoje. Taxa de conclusão, finais encontrados e favoritos chegam na Etapa 9. */
export function BookStatsTab({ entry }: BookStatsTabProps) {
  const [memberCount, setMemberCount] = useState<number | null>(null);

  useEffect(() => {
    if (!supabase || !entry.supabaseBookId) return;
    supabase
      .from("user_library")
      .select("id", { count: "exact", head: true })
      .eq("book_id", entry.supabaseBookId)
      .then(({ count }) => setMemberCount(count ?? 0));
  }, [entry.supabaseBookId]);

  return (
    <div className="flex flex-col gap-4">
      {memberCount !== null && (
        <p className="flex items-center gap-2 text-sm text-parchment-200">
          <Users className="h-4 w-4 text-ember-400" aria-hidden="true" />
          {memberCount === 1 ? "1 pessoa tem este livro na biblioteca." : `${memberCount} pessoas têm este livro na biblioteca.`}
        </p>
      )}
      <p className="text-sm text-parchment-400/70">Em breve: taxa de conclusão, finais encontrados e favoritos.</p>
    </div>
  );
}
