import type { Product } from "./unitPrice";

const PRODUCT_STORAGE_KEY = "kaimono-unit-compare:v1";
const CATEGORY_STORAGE_KEY = "kaimono-unit-category:v1";
const productCategories = ["count", "weight", "volume"] as const;

export type StoredCategory = (typeof productCategories)[number];

function isProduct(value: unknown): value is Product {
  if (!value || typeof value !== "object") return false;

  const product = value as Partial<Product>;
  return (
    typeof product.id === "string" &&
    typeof product.name === "string" &&
    (product.store === undefined || typeof product.store === "string") &&
    typeof product.price === "number" &&
    typeof product.amount === "number" &&
    ["個", "g", "kg", "ml", "L"].includes(product.unit ?? "")
  );
}

export function loadProducts(): Product[] {
  try {
    const storedValue = window.localStorage.getItem(PRODUCT_STORAGE_KEY);
    if (!storedValue) return [];

    const parsed: unknown = JSON.parse(storedValue);
    return Array.isArray(parsed) ? parsed.filter(isProduct) : [];
  } catch {
    return [];
  }
}

export function saveProducts(products: Product[]): void {
  try {
    window.localStorage.setItem(PRODUCT_STORAGE_KEY, JSON.stringify(products));
  } catch {
    // Storage can be unavailable in private browsing or when the quota is exceeded.
  }
}

export function loadCategory(): StoredCategory {
  try {
    const storedValue = window.localStorage.getItem(CATEGORY_STORAGE_KEY);
    return (
      productCategories.find((category) => category === storedValue) ?? "count"
    );
  } catch {
    return "count";
  }
}

export function saveCategory(category: StoredCategory): void {
  try {
    window.localStorage.setItem(CATEGORY_STORAGE_KEY, category);
  } catch {
    // Keep the current session usable when storage is unavailable.
  }
}
