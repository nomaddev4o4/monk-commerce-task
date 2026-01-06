import styles from "./ProductList.module.css";
import type { Variant } from "../../types/product.type";

interface VariantItemProps {
  variant: Variant;
  variantData: {
    discount: string;
    discountType: string;
    showDiscount: boolean;
  };
  onToggleVariantDiscount: () => void;
  onVariantDiscountChange: (value: string) => void;
  onVariantDiscountTypeChange: (value: string) => void;
  onRemoveVariant: () => void;
  onDragStart: () => void;
  onDragOver: (e: React.DragEvent) => void;
  onDragEnd: () => void;
  isDragging: boolean;
}

function VariantItem({
  variant,
  variantData,
  onToggleVariantDiscount,
  onVariantDiscountChange,
  onVariantDiscountTypeChange,
  onRemoveVariant,
  onDragStart,
  onDragOver,
  onDragEnd,
  isDragging,
}: VariantItemProps) {
  return (
    <div
      draggable
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDragEnd={onDragEnd}
      className={styles.variantRow}
      style={{ opacity: isDragging ? 0.5 : 1 }}
    >
      <div className={styles.productRowItem}>
        <span className={styles.dragHandle} style={{ cursor: "grab" }}>
          ⠿
        </span>
        <input
          className={styles.variantRowInput}
          value={variant.title}
          readOnly
        />
      </div>
      <div className={styles.discountGroup}>
        {variantData.showDiscount ? (
          <>
            <input
              type="number"
              className={styles.discountInput}
              value={variantData.discount}
              onChange={(e) => onVariantDiscountChange(e.target.value)}
              placeholder="0"
            />
            <select
              className={styles.discountTypeSelect}
              value={variantData.discountType}
              onChange={(e) => onVariantDiscountTypeChange(e.target.value)}
            >
              <option>% Off</option>
              <option>Flat Off</option>
            </select>
          </>
        ) : (
          <button
            className={styles.addDiscountButton}
            onClick={onToggleVariantDiscount}
          >
            Add Discount
          </button>
        )}
        <button className={styles.removeButton} onClick={onRemoveVariant}>
          ✕
        </button>
      </div>
    </div>
  );
}

export default VariantItem;

