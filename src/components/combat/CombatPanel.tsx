import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Flame, Gift, Heart, LogOut, Shield, Sparkles, Sword, Utensils } from "lucide-react";
import { DiceFace } from "@/components/dice/DiceFace";
import { useCombat, useCombatActions, useLastRoundResult, useLuckTestAvailable } from "@/stores/combatStore";
import { useCharacter } from "@/stores/characterStore";
import { useGameSessionStore } from "@/stores/gameSessionStore";
import { useSettingsStore } from "@/stores/settingsStore";

/** Duração da animação de rolagem dos dados (ver DiceFace) + folga do stagger entre dados. */
const DICE_ROLL_MS = 2100;

function PulsingStamina({ value }: { value: number }) {
  const prevRef = useRef(value);
  const [flashKey, setFlashKey] = useState(0);

  useEffect(() => {
    if (value < prevRef.current) setFlashKey((k) => k + 1);
    prevRef.current = value;
  }, [value]);

  return (
    <motion.span
      key={flashKey}
      initial={flashKey > 0 ? { color: "#ef4444", scale: 1.6 } : false}
      animate={{ color: "#e0a94a", scale: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="inline-block"
    >
      {value}
    </motion.span>
  );
}

export function CombatPanel() {
  const combat = useCombat();
  const character = useCharacter();
  const book = useGameSessionStore((s) => s.book);
  const lastRound = useLastRoundResult();
  const luckTestAvailable = useLuckTestAvailable();
  const { playerAttack, useProvisionInCombat, fleeCombat, testCombatLuck } = useCombatActions();
  const animations = useSettingsStore((s) => s.settings.animations);

  const roundKey = lastRound ? `${combat?.round}-${lastRound.playerAttackStrength}-${lastRound.enemyAttackStrength}` : null;
  const [revealedKey, setRevealedKey] = useState<string | null>(null);

  useEffect(() => {
    if (!roundKey) return;
    if (!animations) {
      setRevealedKey(roundKey);
      return;
    }
    setRevealedKey(null);
    const timer = setTimeout(() => setRevealedKey(roundKey), DICE_ROLL_MS);
    return () => clearTimeout(timer);
  }, [roundKey, animations]);

  if (!combat || !character || !book) return null;

  const showResult = revealedKey === roundKey;

  const livingEnemies = combat.enemies.filter((e) => e.stamina > 0);
  const target = livingEnemies[0];
  const weapon = character.equippedWeapon ? book.items.find((i) => i.id === character.equippedWeapon) : undefined;
  const armor = character.equippedArmor ? book.items.find((i) => i.id === character.equippedArmor) : undefined;

  return (
    <div className="book-page paper-texture p-5 sm:p-6" aria-label="Painel de combate">
      <div className="mb-4 flex items-center gap-2 text-ember-400">
        <Flame className="h-5 w-5" aria-hidden="true" />
        <h2 className="font-display text-lg uppercase tracking-wide">Combate — Rodada {combat.round}</h2>
      </div>

      <div className="mb-5 grid grid-cols-2 gap-4">
        <div className="rounded-md border border-parchment-700/30 bg-nightwood-900/60 p-4 text-center">
          <p className="font-display text-sm text-parchment-200">{character.name}</p>
          <p className="mt-1 flex items-center justify-center gap-1 font-display text-2xl text-ember-400">
            <Heart className="h-5 w-5" aria-hidden="true" /> <PulsingStamina value={character.stats.stamina} />
          </p>
          <p className="text-xs text-parchment-400">Habilidade {character.stats.skill}</p>
          {(weapon?.damageBonus || armor?.defenseBonus) && (
            <div className="mt-2 flex flex-col gap-0.5 border-t border-parchment-700/20 pt-2 text-[11px] text-moss-400">
              {weapon?.damageBonus ? (
                <span className="flex items-center justify-center gap-1">
                  <Sword className="h-3 w-3" aria-hidden="true" /> {weapon.name} +{weapon.damageBonus} dano
                </span>
              ) : null}
              {armor?.defenseBonus ? (
                <span className="flex items-center justify-center gap-1">
                  <Shield className="h-3 w-3" aria-hidden="true" /> {armor.name} +{armor.defenseBonus} defesa
                </span>
              ) : null}
            </div>
          )}
        </div>
        {combat.enemies.map((enemy) => {
          const enemyDef = book.enemies.find((e) => e.id === enemy.id);
          const lootItem = enemyDef?.lootItemId ? book.items.find((i) => i.id === enemyDef.lootItemId) : undefined;
          return (
            <div
              key={enemy.id}
              className={`rounded-md border p-4 text-center ${
                enemy.stamina <= 0
                  ? "border-parchment-800/30 bg-nightwood-900/30 opacity-50"
                  : "border-parchment-700/30 bg-nightwood-900/60"
              }`}
            >
              {enemyDef?.image && (
                <img
                  src={enemyDef.image}
                  alt={enemy.name}
                  className={`mx-auto mb-2 h-24 w-24 rounded-md border border-parchment-700/30 object-cover ${
                    enemy.stamina <= 0 ? "grayscale" : ""
                  }`}
                />
              )}
              <p className="font-display text-sm text-parchment-200">{enemy.name}</p>
              <p className="mt-1 flex items-center justify-center gap-1 font-display text-2xl text-ember-400">
                <Heart className="h-5 w-5" aria-hidden="true" /> <PulsingStamina value={Math.max(enemy.stamina, 0)} />
              </p>
              <p className="text-xs text-parchment-400">Habilidade {enemy.skill}</p>
              {enemy.stamina <= 0 && <p className="mt-1 text-xs text-ember-500">Derrotado</p>}
              {enemy.stamina > 0 && lootItem && (
                <p className="mt-2 flex items-center justify-center gap-1 border-t border-parchment-700/20 pt-2 text-[11px] text-parchment-400">
                  <Gift className="h-3 w-3 text-ember-500" aria-hidden="true" />
                  Pode deixar algo ao ser derrotado
                </p>
              )}
            </div>
          );
        })}
      </div>

      <AnimatePresence mode="wait">
        {lastRound && (
          <motion.div
            key={`${combat.round}-${lastRound.playerAttackStrength}-${lastRound.enemyAttackStrength}`}
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mb-5 rounded-md border border-parchment-700/30 bg-nightwood-900/50 p-4"
          >
            <div className="flex items-center justify-around gap-4">
              <div className="text-center">
                <p className="mb-1 text-xs text-parchment-400">Você</p>
                <div className="flex gap-1.5">
                  {lastRound.playerRoll.rolls.map((r, i) => (
                    <DiceFace key={i} value={r} animate={animations} delay={i * 0.05} />
                  ))}
                </div>
                <p className="mt-1 font-display text-ember-400">{lastRound.playerAttackStrength}</p>
              </div>
              <span className="font-display text-parchment-500">vs</span>
              <div className="text-center">
                <p className="mb-1 text-xs text-parchment-400">Inimigo</p>
                <div className="flex gap-1.5">
                  {lastRound.enemyRoll.rolls.map((r, i) => (
                    <DiceFace key={i} value={r} animate={animations} delay={i * 0.05} />
                  ))}
                </div>
                <p className="mt-1 font-display text-ember-400">{lastRound.enemyAttackStrength}</p>
              </div>
            </div>
            <AnimatePresence>
              {showResult && (
                <motion.p
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="mt-3 text-center font-serif text-parchment-200"
                >
                  {lastRound.winner === "player" &&
                    (weapon?.damageBonus
                      ? `Você acerta e causa ${lastRound.damageDealt} de dano (${lastRound.damage} + ${weapon.damageBonus} da ${weapon.name})!`
                      : `Você acerta e causa ${lastRound.damageDealt} de dano!`)}
                  {lastRound.winner === "enemy" &&
                    (armor?.defenseBonus
                      ? `O inimigo acerta e causa ${lastRound.damageDealt} de dano (${lastRound.damage} − ${armor.defenseBonus} da ${armor.name}).`
                      : `O inimigo acerta e causa ${lastRound.damageDealt} de dano.`)}
                  {lastRound.winner === "tie" && "Empate — nenhum dano nesta rodada."}
                </motion.p>
              )}
            </AnimatePresence>

            {showResult && luckTestAvailable && (
              <div className="mt-3 flex justify-center">
                <button type="button" className="btn-secondary" onClick={testCombatLuck}>
                  <Sparkles className="h-4 w-4" aria-hidden="true" /> Testar a Sorte (-1 Sorte, +2 dano se bem-sucedido)
                </button>
              </div>
            )}

            {showResult && lastRound.luckBonus && (
              <p
                className={`mt-2 text-center font-serif text-sm ${lastRound.luckBonus.success ? "text-moss-400" : "text-red-400"}`}
                title="Testar a Sorte em combate: sucesso se a soma dos dados for ≤ sua Sorte atual (−1 Sorte sempre, +2 de dano extra só em caso de sucesso)."
              >
                {lastRound.luckBonus.success
                  ? `Sorte testada (${lastRound.luckBonus.total}): sucesso! +2 de dano extra.`
                  : `Sorte testada (${lastRound.luckBonus.total}): não ajudou desta vez.`}
              </p>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {combat.isActive ? (
        <div className="flex flex-col gap-3 sm:flex-row">
          <button className="btn-primary flex-1" onClick={playerAttack} disabled={!target}>
            <Sword className="h-4 w-4" aria-hidden="true" /> Atacar
          </button>
          <button
            className="btn-secondary flex-1"
            onClick={useProvisionInCombat}
            disabled={character.provisions <= 0}
          >
            <Utensils className="h-4 w-4" aria-hidden="true" /> Usar provisão
          </button>
          {combat.onFlee && (
            <button className="btn-secondary flex-1" onClick={fleeCombat}>
              <LogOut className="h-4 w-4" aria-hidden="true" /> Fugir
            </button>
          )}
        </div>
      ) : (
        <p className="text-center font-serif italic text-parchment-300">Combate encerrado...</p>
      )}
    </div>
  );
}
