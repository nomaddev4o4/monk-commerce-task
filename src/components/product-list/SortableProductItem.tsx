import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import SortableVariantItem from "./SortableVariantItem";
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
  onVariantDragEnd: (event: DragEndEvent) => void;
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
  onVariantDragEnd,
}: SortableProductItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isSortableDragging,
  } = useSortable({ id: `product-${index}` });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isSortableDragging ? 0.5 : 1,
  };

  const variantSensors = useSensors(useSensor(PointerSensor));

  const hasMultipleVariants = product.selectedVariantIds.length > 1;

  const selectedVariants = product.selectedVariantIds
    .map((variantId) =>
      product.variants.find((v: Variant) => v.id === variantId)
    )
    .filter((v): v is Variant => v !== undefined);

  return (
    <div ref={setNodeRef} style={style} className={styles.productGroup}>
      <div className={styles.productRow}>
        <div className={styles.productRowItem}>
          <span
            className={styles.dragHandle}
            {...attributes}
            {...listeners}
            style={{ cursor: "grab" }}
          >
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
            {product.showVariants ? "Hide" : "Show"} variants{" "}
            {product.showVariants ? "↑" : "↓"}
          </button>
        </div>
      )}

      {product.showVariants && (
        <DndContext
          sensors={variantSensors}
          collisionDetection={closestCenter}
          onDragEnd={onVariantDragEnd}
        >
          <SortableContext
            items={selectedVariants.map((v: Variant) => `variant-${v.id}`)}
            strategy={verticalListSortingStrategy}
          >
            <div className={styles.variantsList}>
              {selectedVariants.map((variant: Variant) => {
                const variantData = product.variantsWithDiscount[variant.id];
                return (
                  <SortableVariantItem
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
                  />
                );
              })}
            </div>
          </SortableContext>
        </DndContext>
      )}
    </div>
  );
}

export default SortableProductItem;
