export type ProductCategory = "count" | "weight" | "volume";
export type ProductUnit = "個" | "g" | "kg" | "ml" | "L";

export interface Product {
  id: string;
  name: string;
  price: number;
  amount: number;
  unit: ProductUnit;
}

export function getCategory(unit: ProductUnit): ProductCategory {
  if (unit === "g" || unit === "kg") return "weight";
  if (unit === "ml" || unit === "L") return "volume";
  return "count";
}

export function calculateUnitPrice(
  price: number,
  amount: number,
  unit: ProductUnit,
): number | null {
  if (
    !Number.isFinite(price) ||
    !Number.isFinite(amount) ||
    price <= 0 ||
    amount <= 0
  ) {
    return null;
  }

  const baseAmount = unit === "kg" || unit === "L" ? amount * 1000 : amount;
  const comparisonAmount = getCategory(unit) === "count" ? 1 : 100;

  return (price / baseAmount) * comparisonAmount;
}

export function getBestValueIds(products: Product[]): Set<string> {
  const bestByCategory = new Map<
    ProductCategory,
    { price: number; ids: Set<string> }
  >();

  for (const product of products) {
    const unitPrice = calculateUnitPrice(
      product.price,
      product.amount,
      product.unit,
    );
    if (unitPrice === null) continue;

    const category = getCategory(product.unit);
    const best = bestByCategory.get(category);

    if (!best || unitPrice < best.price) {
      bestByCategory.set(category, {
        price: unitPrice,
        ids: new Set([product.id]),
      });
    } else if (unitPrice === best.price) {
      best.ids.add(product.id);
    }
  }

  return new Set([...bestByCategory.values()].flatMap(({ ids }) => [...ids]));
}
