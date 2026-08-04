import { useRef, useState } from "react";
import { Bot, Download, Upload, Trash2 } from "lucide-react";
import { useSettingsStore } from "@/stores/settingsStore";
import { useGameSessionStore } from "@/stores/gameSessionStore";
import { ConfirmDialog } from "@/components/layout/ConfirmDialog";
import { STORY_PROMPT_GUIDE } from "@/lib/storyPromptGuide";

export function SettingsPanel() {
  const { settings, updateSettings } = useSettingsStore();
  const exportCurrentSave = useGameSessionStore((s) => s.exportCurrentSave);
  const importSaveFile = useGameSessionStore((s) => s.importSaveFile);
  const deleteCurrentSave = useGameSessionStore((s) => s.deleteCurrentSave);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [importMessage, setImportMessage] = useState<{ text: string; error: boolean } | null>(null);

  function handleExport() {
    const json = exportCurrentSave();
    if (!json) return;
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "livro-jogo-save.json";
    a.click();
    URL.revokeObjectURL(url);
  }

  function handleExportGuide() {
    const blob = new Blob([STORY_PROMPT_GUIDE], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "como-criar-livro-jogo-ia.md";
    a.click();
    URL.revokeObjectURL(url);
  }

  async function handleImportFile(file: File) {
    const text = await file.text();
    const result = importSaveFile(text);
    if (!result.success) {
      setImportMessage({ text: result.error ?? "Não foi possível importar o save.", error: true });
    } else {
      setImportMessage({ text: "Save importado com sucesso! Atualize a página se a partida não recarregar.", error: false });
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <section>
        <h3 className="mb-3 font-display text-sm uppercase tracking-wide text-ember-400">Leitura</h3>
        <div className="flex flex-col gap-3">
          <SelectRow
            label="Tamanho da fonte"
            value={settings.fontSize}
            onChange={(v) => updateSettings({ fontSize: v as typeof settings.fontSize })}
            options={[
              { value: "small", label: "Pequena" },
              { value: "medium", label: "Média" },
              { value: "large", label: "Grande" },
              { value: "xlarge", label: "Extra grande" },
            ]}
          />
          <SelectRow
            label="Fonte do texto"
            value={settings.fontFamily}
            onChange={(v) => updateSettings({ fontFamily: v as typeof settings.fontFamily })}
            options={[
              { value: "garamond", label: "Cormorant Garamond" },
              { value: "ebGaramond", label: "EB Garamond" },
              { value: "baskerville", label: "Libre Baskerville" },
            ]}
          />
          <ToggleRow label="Negrito no texto" checked={settings.textBold} onChange={(v) => updateSettings({ textBold: v })} />
          <SelectRow
            label="Espaçamento do texto"
            value={settings.textSpacing}
            onChange={(v) => updateSettings({ textSpacing: v as typeof settings.textSpacing })}
            options={[
              { value: "compact", label: "Compacto" },
              { value: "normal", label: "Normal" },
              { value: "relaxed", label: "Relaxado" },
            ]}
          />
          <SelectRow
            label="Tema"
            value={settings.theme}
            onChange={(v) => updateSettings({ theme: v as typeof settings.theme })}
            options={[
              { value: "dark", label: "Escuro" },
              { value: "parchment", label: "Pergaminho" },
            ]}
          />
        </div>
      </section>

      <section>
        <h3 className="mb-3 font-display text-sm uppercase tracking-wide text-ember-400">Jogabilidade</h3>
        <div className="flex flex-col gap-3">
          <ToggleRow
            label="Efeitos sonoros"
            checked={settings.soundEffects}
            onChange={(v) => updateSettings({ soundEffects: v })}
          />
          <ToggleRow
            label="Animações"
            checked={settings.animations}
            onChange={(v) => updateSettings({ animations: v })}
          />
          <ToggleRow
            label="Confirmar antes de reiniciar"
            checked={settings.confirmBeforeRestart}
            onChange={(v) => updateSettings({ confirmBeforeRestart: v })}
          />
          <SelectRow
            label="Modo de rolagem"
            value={settings.diceRollMode}
            onChange={(v) => updateSettings({ diceRollMode: v as typeof settings.diceRollMode })}
            options={[
              { value: "manual", label: "Manual" },
              { value: "automatic", label: "Automática" },
            ]}
          />
        </div>
      </section>

      <section>
        <h3 className="mb-3 font-display text-sm uppercase tracking-wide text-ember-400">Salvamento</h3>
        <div className="flex flex-col gap-2">
          <button className="btn-secondary" onClick={handleExport}>
            <Download className="h-4 w-4" aria-hidden="true" /> Exportar save (JSON)
          </button>
          <button className="btn-secondary" onClick={() => fileInputRef.current?.click()}>
            <Upload className="h-4 w-4" aria-hidden="true" /> Importar save (JSON)
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="application/json"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleImportFile(file);
              e.target.value = "";
            }}
          />
          {importMessage && (
            <p className={`text-sm ${importMessage.error ? "text-red-300" : "text-emerald-300"}`}>
              {importMessage.text}
            </p>
          )}
          <button className="btn-secondary text-red-300" onClick={() => setDeleteConfirmOpen(true)}>
            <Trash2 className="h-4 w-4" aria-hidden="true" /> Excluir save
          </button>
        </div>
      </section>

      <section>
        <h3 className="mb-3 font-display text-sm uppercase tracking-wide text-ember-400">Criar novo livro</h3>
        <div className="flex flex-col gap-2">
          <button className="btn-secondary" onClick={handleExportGuide}>
            <Bot className="h-4 w-4" aria-hidden="true" /> Exportar instruções para IA
          </button>
          <p className="text-xs text-parchment-400">
            Baixa um guia em Markdown com o formato completo do <code>story.json</code> (seções, condições, ações,
            itens, inimigos) para colar numa IA e gerar um novo livro-jogo compatível com esta engine.
          </p>
        </div>
      </section>

      <ConfirmDialog
        open={deleteConfirmOpen}
        title="Excluir save"
        message="Isso apagará permanentemente a partida salva. Continuar?"
        confirmLabel="Excluir"
        danger
        onCancel={() => setDeleteConfirmOpen(false)}
        onConfirm={() => {
          deleteCurrentSave();
          setDeleteConfirmOpen(false);
        }}
      />
    </div>
  );
}

function SelectRow({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <label className="flex items-center justify-between gap-3">
      <span className="text-parchment-200">{label}</span>
      <select
        className="rounded-md border border-parchment-700/40 bg-nightwood-900 px-3 py-2 text-parchment-50"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </label>
  );
}

function ToggleRow({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <label className="flex items-center justify-between gap-3">
      <span className="text-parchment-200">{label}</span>
      <input
        type="checkbox"
        className="h-5 w-5 accent-ember-500"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
      />
    </label>
  );
}
