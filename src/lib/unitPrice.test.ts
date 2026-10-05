import { describe, expect, it } from "vitest";
import { calculateUnitPrice, getBestValueIds, type Product } from "./unitPrice";

describe("calculateUnitPrice", () => {
  it("calculates a per-item price", () => {
    expect(calculateUnitPrice(398, 4, "個")).toBe(99.5);
  });

  it("normalizes grams and kilograms to a 100g price", () => {
    expect(calculateUnitPrice(298, 400, "g")).toBe(74.5);
    expect(calculateUnitPrice(298, 0.4, "kg")).toBe(74.5);
  });

  it("normalizes milliliters and liters to a 100ml price", () => {
    expect(calculateUnitPrice(198, 500, "ml")).toBe(39.6);
    expect(calculateUnitPrice(198, 0.5, "L")).toBe(39.6);
  });

  it("rejects non-positive and non-finite values", () => {
    expect(calculateUnitPrice(0, 100, "g")).toBeNull();
    expect(calculateUnitPrice(100, 0, "g")).toBeNull();
    expect(calculateUnitPrice(-1, 100, "g")).toBeNull();
    expect(calculateUnitPrice(100, Number.POSITIVE_INFINITY, "g")).toBeNull();
  });
});

describe("getBestValueIds", () => {
  const products: Product[] = [
    { id: "small", name: "小袋", price: 180, amount: 200, unit: "g" },
    { id: "large", name: "大袋", price: 298, amount: 400, unit: "g" },
    { id: "oil", name: "オイル", price: 398, amount: 500, unit: "ml" },
    { id: "match", name: "同額", price: 149, amount: 200, unit: "g" },
  ];

  it("finds the best price separately within each category and includes ties", () => {
    expect(getBestValueIds(products)).toEqual(
      new Set(["large", "match", "oil"]),
    );
  });
});
