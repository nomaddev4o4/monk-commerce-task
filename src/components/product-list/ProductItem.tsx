import styles from "./ProductList.module.css";
import type { ProductWithDiscount } from "../../types/product.type";

interface ProductItemProps {
  product: ProductWithDiscount;
  index: number;
  onEdit: () => void;
  onRemove: () => void;
  onDiscountChange: (value: string) => void;
  onDiscountTypeChange: (value: string) => void;
  onToggleVariants: () => void;
  onToggleProductDiscount: () => void;
}

function ProductItem({
  product,
  index,
  onEdit,
  onRemove,
  onDiscountChange,
  onDiscountTypeChange,
  onToggleVariants,
  onToggleProductDiscount,
}: ProductItemProps) {
  const hasMultipleVariants = product.selectedVariantIds.length > 1;

  return (
    <div className={styles.productGroup}>
      <div className={styles.productRow}>
        <div className={styles.productRowItem}>
          <span className={styles.dragHandle} style={{ cursor: "grabbing" }}>
            ⠿
          </span>
          <span className={styles.productNumber}>{index + 1}.</span>
          <div className={styles.inputWrapper}>
            <input
              className={styles.productRowInput}
              value={product.title}
              readOnly
            />
            <button className={styles.editButton} onClick={onEdit}>
              ✎
            </button>
          </div>
        </div>
        <div className={styles.discountGroup}>
          {product.showDiscount ? (
            <>
              <input
                type="number"
                className={styles.discountInput}
                value={product.discount}
                onChange={(e) => onDiscountChange(e.target.value)}
                placeholder="0"
              />
              <select
                className={styles.discountTypeSelect}
                value={product.discountType}
                onChange={(e) => onDiscountTypeChange(e.target.value)}
              >
                <option>% Off</option>
                <option>Flat Off</option>
              </select>
            </>
          ) : (
            <button
              className={styles.addDiscountButton}
              onClick={onToggleProductDiscount}
            >
              Add Discount
            </button>
          )}
          <button className={styles.removeButton} onClick={onRemove}>
            ✕
          </button>
        </div>
      </div>

      {hasMultipleVariants && (
        <div className={styles.variantsToggle}>
          <button className={styles.toggleButton} onClick={onToggleVariants}>
            {product.showVariants ? "Hide" : "Show"} variants ˅
          </button>
        </div>
      )}
    </div>
  );
}

export default ProductItem;

