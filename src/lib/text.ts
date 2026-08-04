/** Remove acentos e caixa para comparação de busca tolerante (ex.: "Corvo" casa com "corvo-9"). */
export function normalize(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase();
}
