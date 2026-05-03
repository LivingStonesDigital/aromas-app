import { describe, it, expect } from "vitest";
import { normalizeMargin, computeSuggestedPrice } from "../convex/utils/pricing";

describe("pricing utils", () => {
  it("computes price for decimal margin", () => {
    const price = computeSuggestedPrice(25.66, 1.0);
    expect(price).toBeCloseTo(51.32, 2);
  });

  it("computes price for decimal 0.5", () => {
    const price = computeSuggestedPrice(28.5, 0.5);
    expect(price).toBeCloseTo(42.75, 2);
  });

  it("normalizes margin 50 to 0.5", () => {
    const m = normalizeMargin(50);
    expect(m).toBeCloseTo(0.5);
  });

  it("normalizes margin 0.75 stays 0.75", () => {
    const m = normalizeMargin(0.75);
    expect(m).toBeCloseTo(0.75);
  });
});
