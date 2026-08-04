import type { LogEntry, LogEntryType } from "@/types/game";

let counter = 0;

/** Gera um id local simples, suficiente para chaves de lista e identificação de log. */
export function generateId(prefix = "id"): string {
  counter += 1;
  return `${prefix}-${Date.now().toString(36)}-${counter}`;
}

export function createLogEntry(type: LogEntryType, message: string): LogEntry {
  return {
    id: generateId("log"),
    type,
    message,
    timestamp: new Date().toISOString(),
  };
}
