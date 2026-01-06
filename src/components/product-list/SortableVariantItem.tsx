import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import styles from "./ProductList.module.css";
import type { Variant } from "../../types/product.type";

interface SortableVariantItemProps {
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
}

function SortableVariantItem({
  variant,
  variantData,
  onToggleVariantDiscount,
  onVariantDiscountChange,
  onVariantDiscountTypeChange,
  onRemoveVariant,
}: SortableVariantItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: `variant-${variant.id}` });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className={styles.variantRow}>
      <div className={styles.productRowItem}>
        <span
          className={styles.dragHandle}
          {...attributes}
          {...listeners}
          style={{ cursor: "grab" }}
        >
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

export default SortableVariantItem;

