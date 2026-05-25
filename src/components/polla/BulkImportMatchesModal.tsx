"use client";

import { useState, useRef } from "react";
import * as XLSX from "xlsx";
import { getSuggestedFixture, bulkCreatePollaMatches } from "@/actions/polla";
import type { FixtureMatch } from "@/types/polla";
import type { MatchStage } from "@/types/polla";

const STAGE_LABELS: Record<string, string> = {
  group: "Fase de Grupos",
  round_of_16: "Octavos de Final",
  quarterfinal: "Cuartos de Final",
  semifinal: "Semifinal",
  final: "Final",
};

const STAGE_ORDER = [
  "group",
  "round_of_16",
  "quarterfinal",
  "semifinal",
  "final",
];

interface Props {
  groupId: string;
  onClose: () => void;
  onSuccess: () => void;
}

export default function BulkImportMatchesModal({
  groupId,
  onClose,
  onSuccess,
}: Props) {
  const [tab, setTab] = useState<"fixture" | "excel">("fixture");

  // Fixture suggestion state
  const [fixture, setFixture] = useState<FixtureMatch[] | null>(null);
  const [loadingFixture, setLoadingFixture] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());

  // Excel state
  const [excelMatches, setExcelMatches] = useState<FixtureMatch[] | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Shared
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // ── Fixture tab ──────────────────────────────────────────
  async function loadFixture() {
    setLoadingFixture(true);
    setError("");
    try {
      const data = await getSuggestedFixture();
      setFixture(data);
      setSelectedIds(new Set(data.map((_, i) => i)));
    } catch {
      setError("No se pudo cargar el fixture sugerido.");
    } finally {
      setLoadingFixture(false);
    }
  }

  function toggleMatch(idx: number) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.has(idx) ? next.delete(idx) : next.add(idx);
      return next;
    });
  }

  function toggleStage(stage: string, indices: number[]) {
    const allSelected = indices.every((i) => selectedIds.has(i));
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (allSelected) indices.forEach((i) => next.delete(i));
      else indices.forEach((i) => next.add(i));
      return next;
    });
  }

  // ── Excel tab ────────────────────────────────────────────
  function downloadTemplate() {
    const ws = XLSX.utils.aoa_to_sheet([
      ["stage", "matchday", "homeTeam", "awayTeam", "matchDate", "venue"],
      [
        "group",
        1,
        "Argentina",
        "España",
        "2026-06-11T18:00:00Z",
        "Ciudad de México",
      ],
    ]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Partidos");
    XLSX.writeFile(wb, "plantilla_partidos.xlsx");
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    setError("");
    setExcelMatches(null);
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const data = new Uint8Array(ev.target!.result as ArrayBuffer);
        const wb = XLSX.read(data, { type: "array" });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(ws);
        const matches: FixtureMatch[] = rows.map((r) => ({
          stage: String(r.stage || "group"),
          matchday: r.matchday ? Number(r.matchday) : undefined,
          homeTeam: String(r.homeTeam || ""),
          awayTeam: String(r.awayTeam || ""),
          matchDate: r.matchDate ? String(r.matchDate) : undefined,
          venue: r.venue ? String(r.venue) : undefined,
        }));
        setExcelMatches(matches);
      } catch {
        setError("No se pudo leer el archivo. Asegúrate de usar la plantilla.");
      }
    };
    reader.readAsArrayBuffer(file);
  }

  // ── Import ───────────────────────────────────────────────
  async function handleImport(matches: FixtureMatch[]) {
    if (!matches.length) return;
    setLoading(true);
    setError("");
    try {
      await bulkCreatePollaMatches(groupId, matches);
      onSuccess();
      onClose();
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : "Error al importar partidos.",
      );
    } finally {
      setLoading(false);
    }
  }

  // ── Grouped fixture ──────────────────────────────────────
  const byStage =
    fixture &&
    STAGE_ORDER.reduce<Record<string, { match: FixtureMatch; idx: number }[]>>(
      (acc, stage) => {
        const items = fixture
          .map((m, i) => ({ match: m, idx: i }))
          .filter((x) => x.match.stage === stage);
        if (items.length) acc[stage] = items;
        return acc;
      },
      {},
    );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="bg-background-elevated border border-border rounded-xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-border">
          <h2 className="text-lg font-semibold text-foreground">
            Importar Partidos en Lote
          </h2>
          <button
            onClick={onClose}
            className="text-foreground-muted hover:text-foreground transition-colors text-xl leading-none"
          >
            ✕
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-border">
          {(["fixture", "excel"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex-1 py-3 text-sm font-medium transition-colors ${
                tab === t
                  ? "border-b-2 border-primary text-primary"
                  : "text-foreground-muted hover:text-foreground"
              }`}
            >
              {t === "fixture"
                ? "⚽ Fixture Sugerido (Mundial 2026)"
                : "📊 Subir Excel"}
            </button>
          ))}
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {error && (
            <p className="text-sm text-danger bg-danger/10 rounded-lg px-4 py-2">
              {error}
            </p>
          )}

          {tab === "fixture" && (
            <>
              {!fixture ? (
                <div className="text-center py-10">
                  <p className="text-foreground-muted text-sm mb-4">
                    Carga el fixture oficial del Mundial 2026 (70 partidos).
                  </p>
                  <button
                    onClick={loadFixture}
                    disabled={loadingFixture}
                    className="px-5 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/90 disabled:opacity-50 transition-colors"
                  >
                    {loadingFixture ? "Cargando…" : "Cargar Fixture"}
                  </button>
                </div>
              ) : (
                <>
                  <p className="text-sm text-foreground-muted">
                    {selectedIds.size} / {fixture.length} partidos seleccionados
                  </p>
                  {byStage &&
                    Object.entries(byStage).map(([stage, items]) => {
                      const idxs = items.map((x) => x.idx);
                      const allSel = idxs.every((i) => selectedIds.has(i));
                      return (
                        <div key={stage}>
                          <button
                            onClick={() => toggleStage(stage, idxs)}
                            className="flex items-center gap-2 w-full text-left text-sm font-semibold text-foreground mb-2 hover:text-primary transition-colors"
                          >
                            <span
                              className={`w-4 h-4 rounded border flex items-center justify-center text-xs ${
                                allSel
                                  ? "bg-primary border-primary text-white"
                                  : "border-border"
                              }`}
                            >
                              {allSel && "✓"}
                            </span>
                            {STAGE_LABELS[stage] ?? stage} ({items.length})
                          </button>
                          <div className="space-y-1 ml-6">
                            {items.map(({ match, idx }) => (
                              <label
                                key={idx}
                                className="flex items-center gap-3 cursor-pointer group"
                              >
                                <input
                                  type="checkbox"
                                  checked={selectedIds.has(idx)}
                                  onChange={() => toggleMatch(idx)}
                                  className="accent-primary"
                                />
                                <span className="text-sm text-foreground group-hover:text-primary transition-colors">
                                  {match.homeTeam} vs {match.awayTeam}
                                  {match.matchday && (
                                    <span className="text-foreground-muted ml-1 text-xs">
                                      (J{match.matchday})
                                    </span>
                                  )}
                                </span>
                              </label>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                </>
              )}
            </>
          )}

          {tab === "excel" && (
            <div className="space-y-4">
              <div className="bg-background rounded-lg border border-border p-4 text-sm text-foreground-muted space-y-2">
                <p className="font-medium text-foreground">Instrucciones:</p>
                <ol className="list-decimal list-inside space-y-1">
                  <li>Descarga la plantilla de Excel.</li>
                  <li>
                    Rellena los partidos (stage, homeTeam, awayTeam son
                    obligatorios).
                  </li>
                  <li>
                    Valores válidos para{" "}
                    <code className="text-primary">stage</code>:{" "}
                    <code className="text-xs">
                      group | round_of_16 | quarterfinal | semifinal | final
                    </code>
                  </li>
                  <li>Sube el archivo y confirma la importación.</li>
                </ol>
              </div>
              <button
                onClick={downloadTemplate}
                className="flex items-center gap-2 px-4 py-2 border border-border rounded-lg text-sm text-foreground hover:border-primary hover:text-primary transition-colors"
              >
                ⬇️ Descargar Plantilla
              </button>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Subir Excel
                </label>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".xlsx,.xls,.csv"
                  onChange={handleFileChange}
                  className="block w-full text-sm text-foreground-muted file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:bg-primary file:text-white hover:file:bg-primary/90 file:cursor-pointer"
                />
              </div>
              {excelMatches && (
                <div className="space-y-2">
                  <p className="text-sm font-medium text-foreground">
                    Vista previa — {excelMatches.length} partidos:
                  </p>
                  <div className="max-h-60 overflow-y-auto space-y-1 border border-border rounded-lg p-3">
                    {excelMatches.map((m, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between text-sm"
                      >
                        <span className="text-foreground">
                          {m.homeTeam} vs {m.awayTeam}
                        </span>
                        <span className="text-xs text-foreground-muted">
                          {STAGE_LABELS[m.stage] ?? m.stage}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 p-5 border-t border-border">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-foreground-muted hover:text-foreground transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={() => {
              if (tab === "fixture" && fixture) {
                const selected = fixture.filter((_, i) => selectedIds.has(i));
                handleImport(selected);
              } else if (tab === "excel" && excelMatches) {
                handleImport(excelMatches);
              }
            }}
            disabled={
              loading ||
              (tab === "fixture" && (!fixture || selectedIds.size === 0)) ||
              (tab === "excel" && !excelMatches)
            }
            className="px-5 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/90 disabled:opacity-50 transition-colors"
          >
            {loading
              ? "Importando…"
              : `Importar${
                  tab === "fixture" && fixture
                    ? ` (${selectedIds.size})`
                    : tab === "excel" && excelMatches
                      ? ` (${excelMatches.length})`
                      : ""
                }`}
          </button>
        </div>
      </div>
    </div>
  );
}
