// Frontend utilities for pricing calculations

// Normalizes margin input to decimal. Accepts decimal (e.g. 0.5) or percentual (e.g. 50 for 50%).
export function normalizeMargin(margin: number): number {
  if (!isFinite(margin) || margin < 0) throw new Error("profitMargin inválido");
  return margin > 1 ? margin / 100 : margin;
}

// Computes suggested price given totalCost and profitMargin (as decimal or percent)
export function computeSuggestedPrice(totalCost: number, profitMargin: number): number {
  if (!isFinite(totalCost) || totalCost < 0) throw new Error("totalCost inválido");
  const marginDecimal = normalizeMargin(profitMargin);
  return totalCost * (1 + marginDecimal);
}
