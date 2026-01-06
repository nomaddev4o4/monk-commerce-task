import { useState } from "react";
import VariantItem from "./VariantItem";
import styles from "./ProductList.module.css";
import type { ProductWithDiscount, Variant } from "../../types/product.type";

interface SortableProductItemProps {
  product: ProductWithDiscount;
  index: number;
  onEdit: () => void;
  onRemove: () => void;
  onDiscountChange: (value: string) => void;
  onDiscountTypeChange: (value: string) => void;
  onToggleVariants: () => void;
  onToggleProductDiscount: () => void;
  onToggleVariantDiscount: (variantId: number) => void;
  onVariantDiscountChange: (variantId: number, value: string) => void;
  onVariantDiscountTypeChange: (variantId: number, value: string) => void;
  onRemoveVariant: (variantId: number) => void;
  onVariantReorder: (oldIndex: number, newIndex: number) => void;
  onDragStart: () => void;
  onDragOver: (e: React.DragEvent) => void;
  onDrop: () => void;
  isDragging: boolean;
}

function SortableProductItem({
  product,
  index,
  onEdit,
  onRemove,
  onDiscountChange,
  onDiscountTypeChange,
  onToggleVariants,
  onToggleProductDiscount,
  onToggleVariantDiscount,
  onVariantDiscountChange,
  onVariantDiscountTypeChange,
  onRemoveVariant,
  onVariantReorder,
  onDragStart,
  onDragOver,
  onDrop,
  isDragging,
}: SortableProductItemProps) {
  const [draggedVariantIndex, setDraggedVariantIndex] = useState<number | null>(
    null
  );

  const hasMultipleVariants = product.selectedVariantIds.length > 1;

  const selectedVariants = product.selectedVariantIds
    .map((variantId) =>
      product.variants.find((v: Variant) => v.id === variantId)
    )
    .filter((v): v is Variant => v !== undefined);

  const handleVariantDragStart = (variantIndex: number) => {
    setDraggedVariantIndex(variantIndex);
  };

  const handleVariantDragOver = (e: React.DragEvent, variantIndex: number) => {
    e.preventDefault();
    if (draggedVariantIndex !== null && draggedVariantIndex !== variantIndex) {
      onVariantReorder(draggedVariantIndex, variantIndex);
      setDraggedVariantIndex(variantIndex);
    }
  };

  const handleVariantDragEnd = () => {
    setDraggedVariantIndex(null);
  };

  return (
    <div
      draggable
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDrop={onDrop}
      className={styles.productGroup}
      style={{ opacity: isDragging ? 0.5 : 1 }}
    >
      <div className={styles.productRow}>
        <div className={styles.productRowItem}>
          <span className={styles.dragHandle} style={{ cursor: "grab" }}>
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
              <button
                className={styles.cancelDiscountButton}
                onClick={onToggleProductDiscount}
                title="Remove discount"
              >
                Cancel
              </button>
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
            {product.showVariants ? "Hide" : "Show"} variants{" "}
            {product.showVariants ? "↑" : "↓"}
          </button>
        </div>
      )}

      {product.showVariants && (
        <div className={styles.variantsList}>
          {selectedVariants.map((variant: Variant, variantIndex: number) => {
            const variantData = product.variantsWithDiscount[variant.id];
            return (
              <VariantItem
                key={variant.id}
                variant={variant}
                variantData={variantData}
                onToggleVariantDiscount={() =>
                  onToggleVariantDiscount(variant.id)
                }
                onVariantDiscountChange={(value: string) =>
                  onVariantDiscountChange(variant.id, value)
                }
                onVariantDiscountTypeChange={(value: string) =>
                  onVariantDiscountTypeChange(variant.id, value)
                }
                onRemoveVariant={() => onRemoveVariant(variant.id)}
                onDragStart={() => handleVariantDragStart(variantIndex)}
                onDragOver={(e) => handleVariantDragOver(e, variantIndex)}
                onDragEnd={handleVariantDragEnd}
                isDragging={draggedVariantIndex === variantIndex}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}

export default SortableProductItem;
