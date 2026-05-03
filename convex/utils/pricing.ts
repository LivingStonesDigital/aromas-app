// Utils for pricing calculations

// Normaliza margem: aceita decimal (0.5 para 50%) ou percentual (50 para 50%, 100 para 100%)
export function normalizeMargin(margin: number): number {
  if (!isFinite(margin) || margin < 0) throw new Error("profitMargin inválido");
  return margin > 1 ? margin / 100 : margin;
}

// Calcula preço sugerido com base no totalCost e margem (markup sobre o custo)
export function computeSuggestedPrice(totalCost: number, profitMargin: number): number {
  if (!isFinite(totalCost) || totalCost < 0) throw new Error("totalCost inválido");
  const marginDecimal = normalizeMargin(profitMargin);
  return totalCost * (1 + marginDecimal);
}
