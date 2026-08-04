import {
  BookOpen,
  FlaskConical,
  Gem,
  Key,
  Package,
  Shield,
  Sword,
  Utensils,
  type LucideIcon,
} from "lucide-react";
import type { ItemKind, StoryItem } from "@/types/story";

/** Chaves de ícone reconhecidas em `StoryItem.icon` — usadas tanto no inventário quanto no seletor do editor. */
export const ITEM_ICONS: Record<string, LucideIcon> = {
  sword: Sword,
  shield: Shield,
  potion: FlaskConical,
  food: Utensils,
  book: BookOpen,
  key: Key,
  gem: Gem,
  misc: Package,
};

export const KIND_FALLBACK_ICON: Record<ItemKind, LucideIcon> = {
  weapon: Sword,
  armor: Shield,
  consumable: FlaskConical,
  key: Key,
  misc: Package,
};

export function resolveItemIcon(item: Pick<StoryItem, "icon" | "kind">): LucideIcon {
  if (item.icon && ITEM_ICONS[item.icon]) return ITEM_ICONS[item.icon];
  return KIND_FALLBACK_ICON[item.kind] ?? Package;
}
