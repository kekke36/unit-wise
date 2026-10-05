import { useEffect, useState, type FormEvent } from "react";
import {
  Boxes,
  Check,
  Droplets,
  Package,
  Pencil,
  Plus,
  Scale,
  ShoppingBasket,
  Trash2,
  X,
  type LucideIcon,
} from "lucide-react";
import "./App.css";
import {
  loadCategory,
  loadProducts,
  saveCategory,
  saveProducts,
} from "./lib/storage";
import {
  calculateUnitPrice,
  getBestValueIds,
  getCategory,
  type Product,
  type ProductCategory,
  type ProductUnit,
} from "./lib/unitPrice";

const categories: { id: ProductCategory; label: string; icon: LucideIcon }[] = [
  { id: "count", label: "個数", icon: Boxes },
  { id: "weight", label: "重量", icon: Scale },
  { id: "volume", label: "容量", icon: Droplets },
];

const unitsByCategory: Record<ProductCategory, ProductUnit[]> = {
  count: ["個"],
  weight: ["g", "kg"],
  volume: ["ml", "L"],
};

function makeDraft(category: ProductCategory) {
  return {
    name: "",
    price: "",
    amount: category === "count" ? "1" : "100",
    unit: unitsByCategory[category][0],
  };
}

function formatNumber(value: number): string {
  return new Intl.NumberFormat("ja-JP", { maximumFractionDigits: 2 }).format(
    value,
  );
}

function App() {
  const [products, setProducts] = useState<Product[]>(loadProducts);
  const [category, setCategory] = useState<ProductCategory>(loadCategory);
  const [draft, setDraft] = useState(() => makeDraft(loadCategory()));
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [isConfirmingClear, setIsConfirmingClear] = useState(false);

  useEffect(() => {
    saveProducts(products);
  }, [products]);

  useEffect(() => {
    saveCategory(category);
  }, [category]);

  const visibleProducts = products.filter(
    (product) => getCategory(product.unit) === category,
  );
  const bestValueIds = getBestValueIds(visibleProducts);
  const unitLabel =
    category === "count" ? "1個" : category === "weight" ? "100g" : "100ml";

  function selectCategory(nextCategory: ProductCategory) {
    if (nextCategory === category) return;
    setCategory(nextCategory);
    setDraft(makeDraft(nextCategory));
    setEditingProductId(null);
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const price = Number(draft.price);
    const amount = Number(draft.amount);
    const unitPrice = calculateUnitPrice(price, amount, draft.unit);
    if (unitPrice === null) return;

    if (editingProductId) {
      setProducts((currentProducts) =>
        currentProducts.map((product) =>
          product.id === editingProductId
            ? {
                ...product,
                name: draft.name.trim(),
                price,
                amount,
                unit: draft.unit,
              }
            : product,
        ),
      );
      setEditingProductId(null);
    } else {
      setProducts((currentProducts) => [
        ...currentProducts,
        {
          id: globalThis.crypto.randomUUID(),
          name: draft.name.trim(),
          price,
          amount,
          unit: draft.unit,
        },
      ]);
    }

    setDraft(makeDraft(category));
  }

  function beginEdit(product: Product) {
    setEditingProductId(product.id);
    setDraft({
      name: product.name,
      price: String(product.price),
      amount: String(product.amount),
      unit: product.unit,
    });
  }

  function cancelEdit() {
    setEditingProductId(null);
    setDraft(makeDraft(category));
  }

  return (
    <div className="app-shell">
      <header className="topbar">
        <a className="brand" href="#top" aria-label="UnitWise ホーム">
          <span className="brand-mark">
            <ShoppingBasket size={19} strokeWidth={2.2} />
          </span>
          <span>UnitWise</span>
        </a>
        <div className="save-indicator">
          <span className="save-dot" />
          この端末に保存
        </div>
      </header>

      <main id="top">
        <section className="intro">
          <div className="intro-copy">
            <p className="eyebrow">
              <span>01</span> SMARTER SHOPPING
            </p>
            <h1>
              いちばんお得、
              <br />
              すぐわかる。
            </h1>
            <p className="intro-description">
              価格と内容量をくらべて、買いもの上手に。
            </p>
          </div>
          <div className="intro-stamp" aria-hidden="true">
            <span>PRICE</span>
            <strong>↓</strong>
            <span>WISE</span>
          </div>
        </section>

        <section className="category-switch" aria-label="比較する単位">
          {categories.map(({ id, label, icon: Icon }) => {
            const count = products.filter(
              (product) => getCategory(product.unit) === id,
            ).length;
            return (
              <button
                className={`category-button${category === id ? " is-active" : ""}`}
                key={id}
                type="button"
                aria-pressed={category === id}
                onClick={() => selectCategory(id)}
              >
                <Icon size={17} strokeWidth={2} />
                <span>{label}</span>
                <span className="category-count">{count}</span>
              </button>
            );
          })}
        </section>

        <div className="workspace-grid">
          <section className="entry-panel" aria-labelledby="entry-title">
            <div className="section-heading">
              <div>
                <p className="section-kicker">ADD AN ITEM</p>
                <h2 id="entry-title">
                  {editingProductId ? "商品を編集" : "商品を追加"}
                </h2>
              </div>
              <span className="section-index">02</span>
            </div>

            <form className="entry-form" onSubmit={handleSubmit}>
              <label className="field field-name">
                <span>
                  商品名 <span className="optional">任意</span>
                </span>
                <input
                  autoComplete="off"
                  placeholder="例: トマト缶"
                  value={draft.name}
                  onChange={(event) =>
                    setDraft({ ...draft, name: event.target.value })
                  }
                />
              </label>

              <div className="field-row">
                <label className="field">
                  <span>価格</span>
                  <span className="input-with-prefix">
                    <span>¥</span>
                    <input
                      aria-label="価格"
                      inputMode="decimal"
                      min="0.01"
                      placeholder="198"
                      required
                      step="any"
                      type="number"
                      value={draft.price}
                      onChange={(event) =>
                        setDraft({ ...draft, price: event.target.value })
                      }
                    />
                  </span>
                </label>
                <label className="field">
                  <span>内容量</span>
                  <span className="input-with-unit">
                    <input
                      aria-label="内容量"
                      inputMode="decimal"
                      min="0.01"
                      placeholder={category === "count" ? "1" : "100"}
                      required
                      step="any"
                      type="number"
                      value={draft.amount}
                      onChange={(event) =>
                        setDraft({ ...draft, amount: event.target.value })
                      }
                    />
                    <select
                      aria-label="単位"
                      value={draft.unit}
                      onChange={(event) =>
                        setDraft({
                          ...draft,
                          unit: event.target.value as ProductUnit,
                        })
                      }
                    >
                      {unitsByCategory[category].map((unit) => (
                        <option key={unit}>{unit}</option>
                      ))}
                    </select>
                  </span>
                </label>
              </div>

              <div className="form-actions">
                {editingProductId && (
                  <button
                    className="cancel-edit-button"
                    type="button"
                    onClick={cancelEdit}
                  >
                    <X size={16} />
                    キャンセル
                  </button>
                )}
                <button className="submit-button" type="submit">
                  {editingProductId ? <Check size={17} /> : <Plus size={17} />}
                  {editingProductId ? "変更を保存" : "商品を追加"}
                </button>
              </div>
            </form>
            <div className="unit-hint">
              <span className="unit-hint-mark">i</span>
              {category === "count" && "個数は1個あたりで比較します"}
              {category === "weight" && "g・kgをそろえて100gあたりで比較します"}
              {category === "volume" &&
                "ml・Lをそろえて100mlあたりで比較します"}
            </div>
          </section>

          <section
            className="comparison-panel"
            aria-labelledby="comparison-title"
          >
            <div className="section-heading comparison-heading">
              <div>
                <p className="section-kicker">COMPARE</p>
                <h2 id="comparison-title">
                  {category === "count"
                    ? "個数"
                    : category === "weight"
                      ? "重量"
                      : "容量"}
                  で比較
                </h2>
              </div>
              <span className="result-count">
                <strong>{visibleProducts.length}</strong> 件
              </span>
            </div>

            {isConfirmingClear ? (
              <div className="clear-confirmation" role="alert">
                <span>登録した商品をすべて削除しますか？</span>
                <button
                  type="button"
                  onClick={() => {
                    setProducts([]);
                    setIsConfirmingClear(false);
                    cancelEdit();
                  }}
                >
                  削除する
                </button>
                <button
                  aria-label="削除をキャンセル"
                  className="icon-button"
                  type="button"
                  onClick={() => setIsConfirmingClear(false)}
                >
                  <X size={17} />
                </button>
              </div>
            ) : (
              <div className="list-toolbar">
                <span>{unitLabel}あたりの価格</span>
                {products.length > 0 && (
                  <button
                    className="clear-button"
                    type="button"
                    onClick={() => setIsConfirmingClear(true)}
                  >
                    <Trash2 size={14} />
                    すべて削除
                  </button>
                )}
              </div>
            )}

            {visibleProducts.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">
                  <Package size={23} strokeWidth={1.7} />
                </div>
                <h3>比較リストは空です</h3>
                <p>商品を登録すると、単価がここに並びます。</p>
              </div>
            ) : (
              <ol className="product-list">
                {visibleProducts.map((product, index) => {
                  const unitPrice = calculateUnitPrice(
                    product.price,
                    product.amount,
                    product.unit,
                  );
                  const isBestValue = bestValueIds.has(product.id);

                  return (
                    <li
                      className={`product-row${isBestValue ? " is-best" : ""}`}
                      key={product.id}
                    >
                      <span className="product-rank">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      <div className="product-main">
                        <div className="product-title-line">
                          <h3>{product.name || "名前なし"}</h3>
                          {isBestValue && (
                            <span className="best-badge">最安</span>
                          )}
                        </div>
                        <p className="product-details">
                          ¥{formatNumber(product.price)} <span>/</span>{" "}
                          {formatNumber(product.amount)}
                          {product.unit}
                        </p>
                      </div>
                      <div className="unit-price-block">
                        <span>{unitLabel}あたり</span>
                        <strong>
                          <span>¥</span>
                          {unitPrice === null ? "—" : formatNumber(unitPrice)}
                        </strong>
                      </div>
                      <div className="product-actions">
                        <button
                          aria-label={`${product.name || "商品"}を編集`}
                          className="icon-button"
                          title="編集"
                          type="button"
                          onClick={() => beginEdit(product)}
                        >
                          <Pencil size={16} />
                        </button>
                        <button
                          aria-label={`${product.name || "商品"}を削除`}
                          className="icon-button remove-button"
                          title="削除"
                          type="button"
                          onClick={() =>
                            setProducts((current) =>
                              current.filter((item) => item.id !== product.id),
                            )
                          }
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </li>
                  );
                })}
              </ol>
            )}

            {visibleProducts.length > 1 && (
              <div className="comparison-footnote">
                <Check size={14} />
                <span>単価が低い商品に「最安」を表示しています</span>
              </div>
            )}
          </section>
        </div>
      </main>

      <footer className="footer">
        <span>UnitWise</span>
        <span>あなたの買いものを、ちょっと賢く。</span>
      </footer>
    </div>
  );
}

export default App;
