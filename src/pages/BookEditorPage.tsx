import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useBookEditorStore } from "@/stores/bookEditorStore";
import { EditorLayout, type EditorTab } from "@/components/editor/EditorLayout";
import { BookInfoTab } from "@/components/editor/BookInfoTab";
import { ItemsTab } from "@/components/editor/ItemsTab";
import { EnemiesTab } from "@/components/editor/EnemiesTab";
import { SectionsTab } from "@/components/editor/SectionsTab";

export default function BookEditorPage() {
  const { bookId } = useParams<{ bookId?: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<EditorTab>("info");

  const loading = useBookEditorStore((s) => s.loading);
  const loadError = useBookEditorStore((s) => s.loadError);
  const loadForCreate = useBookEditorStore((s) => s.loadForCreate);
  const loadForEdit = useBookEditorStore((s) => s.loadForEdit);

  useEffect(() => {
    setActiveTab("info");
    if (bookId) {
      loadForEdit(bookId);
    } else {
      loadForCreate();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bookId]);

  if (loading) {
    return <p className="p-10 text-center font-serif text-parchment-300">Carregando livro para edição...</p>;
  }

  if (loadError) {
    return (
      <div className="mx-auto flex max-w-lg flex-col items-center gap-4 px-6 py-16 text-center">
        <p className="font-serif text-red-300">{loadError}</p>
        <button className="btn-secondary" onClick={() => navigate("/biblioteca")}>
          Voltar à biblioteca
        </button>
      </div>
    );
  }

  return (
    <EditorLayout activeTab={activeTab} onTabChange={setActiveTab}>
      {activeTab === "info" && <BookInfoTab />}
      {activeTab === "items" && <ItemsTab />}
      {activeTab === "enemies" && <EnemiesTab />}
      {activeTab === "sections" && <SectionsTab />}
    </EditorLayout>
  );
}
