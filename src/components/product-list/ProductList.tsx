import { useState } from "react";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  DragOverlay,
  type DragStartEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { ProductPickerModal } from "../product-picker/ProductPicker";
import styles from "./ProductList.module.css";

interface SelectedItem {
  productId: number;
  variantIds: number[];
}

interface Variant {
  id: number;
  product_id: number;
  title: string;
  price: string;
}

interface Product {
  id: number;
  title: string;
  variants: Variant[];
  image: {
    id: number;
    product_id: number;
    src: string;
  };
}

interface ProductWithDiscount extends Product {
  discount: string;
  discountType: string;
  showVariants: boolean;
  selectedVariantIds: number[];
  showDiscount: boolean;
  variantsWithDiscount: {
    [variantId: number]: {
      discount: string;
      discountType: string;
      showDiscount: boolean;
    };
  };
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
}: {
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
}) {
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

  // Fix: Move useSensors hook call outside of conditional rendering
  const variantSensors = useSensors(useSensor(PointerSensor));

  const hasMultipleVariants = product.selectedVariantIds.length > 1;

  // Sort variants according to selectedVariantIds order
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
            {product.showVariants ? "Hide" : "Show"} variants ˅
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

// Product item component for DragOverlay
function ProductItem({
  product,
  index,
  onEdit,
  onRemove,
  onDiscountChange,
  onDiscountTypeChange,
  onToggleVariants,
  onToggleProductDiscount,
}: {
  product: ProductWithDiscount;
  index: number;
  onEdit: () => void;
  onRemove: () => void;
  onDiscountChange: (value: string) => void;
  onDiscountTypeChange: (value: string) => void;
  onToggleVariants: () => void;
  onToggleProductDiscount: () => void;
}) {
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

function SortableVariantItem({
  variant,
  variantData,
  onToggleVariantDiscount,
  onVariantDiscountChange,
  onVariantDiscountTypeChange,
  onRemoveVariant,
}: {
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
}) {
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

function ProductList() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProducts, setSelectedProducts] = useState<
    ProductWithDiscount[]
  >([]);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // 8px movement required before drag starts
      },
    })
  );

  const handleOpenModal = () => {
    setEditingIndex(null);
    setIsModalOpen(true);
  };

  const handleEditProduct = (index: number) => {
    setEditingIndex(index);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingIndex(null);
  };

  // Get existing selected products for the modal
  const getExistingSelections = () => {
    if (editingIndex !== null) {
      // When editing, only pass the product being edited
      const product = selectedProducts[editingIndex];
      return [
        {
          productId: product.id,
          variantIds: product.selectedVariantIds,
        },
      ];
    } else {
      // When adding new, pass all currently selected products to prevent duplicates
      return selectedProducts.map((p) => ({
        productId: p.id,
        variantIds: p.selectedVariantIds,
      }));
    }
  };

  const handleConfirm = (selected: SelectedItem[], allProducts: Product[]) => {
    const newProducts = selected
      .map((item) => {
        const product = allProducts.find((p) => p.id === item.productId);
        if (product) {
          const variantsWithDiscount: {
            [variantId: number]: {
              discount: string;
              discountType: string;
              showDiscount: boolean;
            };
          } = {};

          item.variantIds.forEach((variantId) => {
            variantsWithDiscount[variantId] = {
              discount: "",
              discountType: "% Off",
              showDiscount: false,
            };
          });

          return {
            ...product,
            discount: "",
            discountType: "% Off",
            showVariants: true,
            selectedVariantIds: item.variantIds,
            showDiscount: false,
            variantsWithDiscount,
          };
        }
        return null;
      })
      .filter((p): p is ProductWithDiscount => p !== null);

    if (editingIndex !== null) {
      // Replace the product at editingIndex with new products
      setSelectedProducts((prev) => {
        const updated = [...prev];
        updated.splice(editingIndex, 1, ...newProducts);
        return updated;
      });
    } else {
      // Add new products to the end, but filter out duplicates
      setSelectedProducts((prev) => {
        const existingProductIds = prev.map((p) => p.id);
        const uniqueNewProducts = newProducts.filter(
          (p) => !existingProductIds.includes(p.id)
        );
        return [...prev, ...uniqueNewProducts];
      });
    }

    setIsModalOpen(false);
    setEditingIndex(null);
  };

  const handleRemoveProduct = (index: number) => {
    setSelectedProducts((prev) => prev.filter((_, i) => i !== index));
  };

  const handleDiscountChange = (index: number, value: string) => {
    setSelectedProducts((prev) =>
      prev.map((p, i) => (i === index ? { ...p, discount: value } : p))
    );
  };

  const handleDiscountTypeChange = (index: number, value: string) => {
    setSelectedProducts((prev) =>
      prev.map((p, i) => (i === index ? { ...p, discountType: value } : p))
    );
  };

  const toggleVariants = (index: number) => {
    setSelectedProducts((prev) =>
      prev.map((p, i) =>
        i === index ? { ...p, showVariants: !p.showVariants } : p
      )
    );
  };

  const toggleProductDiscount = (index: number) => {
    setSelectedProducts((prev) =>
      prev.map((p, i) =>
        i === index ? { ...p, showDiscount: !p.showDiscount } : p
      )
    );
  };

  const toggleVariantDiscount = (productIndex: number, variantId: number) => {
    setSelectedProducts((prev) =>
      prev.map((p, i) => {
        if (i === productIndex) {
          return {
            ...p,
            variantsWithDiscount: {
              ...p.variantsWithDiscount,
              [variantId]: {
                ...p.variantsWithDiscount[variantId],
                showDiscount: !p.variantsWithDiscount[variantId].showDiscount,
              },
            },
          };
        }
        return p;
      })
    );
  };

  const handleVariantDiscountChange = (
    productIndex: number,
    variantId: number,
    value: string
  ) => {
    setSelectedProducts((prev) =>
      prev.map((p, i) => {
        if (i === productIndex) {
          return {
            ...p,
            variantsWithDiscount: {
              ...p.variantsWithDiscount,
              [variantId]: {
                ...p.variantsWithDiscount[variantId],
                discount: value,
              },
            },
          };
        }
        return p;
      })
    );
  };

  const handleVariantDiscountTypeChange = (
    productIndex: number,
    variantId: number,
    value: string
  ) => {
    setSelectedProducts((prev) =>
      prev.map((p, i) => {
        if (i === productIndex) {
          return {
            ...p,
            variantsWithDiscount: {
              ...p.variantsWithDiscount,
              [variantId]: {
                ...p.variantsWithDiscount[variantId],
                discountType: value,
              },
            },
          };
        }
        return p;
      })
    );
  };

  const handleRemoveVariant = (productIndex: number, variantId: number) => {
    setSelectedProducts((prev) =>
      prev
        .map((p, i) => {
          if (i === productIndex) {
            const newSelectedVariantIds = p.selectedVariantIds.filter(
              (id) => id !== variantId
            );

            // If no variants left, remove the entire product
            if (newSelectedVariantIds.length === 0) {
              return null;
            }

            const newVariantsWithDiscount = { ...p.variantsWithDiscount };
            delete newVariantsWithDiscount[variantId];

            return {
              ...p,
              selectedVariantIds: newSelectedVariantIds,
              variantsWithDiscount: newVariantsWithDiscount,
            };
          }
          return p;
        })
        .filter((p): p is ProductWithDiscount => p !== null)
    );
  };

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (over && active.id !== over.id) {
      setSelectedProducts((items) => {
        const oldIndex = items.findIndex(
          (_, i) => `product-${i}` === active.id
        );
        const newIndex = items.findIndex((_, i) => `product-${i}` === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const handleDragCancel = () => {
    setActiveId(null);
  };

  const handleVariantDragEnd = (productIndex: number, event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setSelectedProducts((prev) =>
        prev.map((p, i) => {
          if (i === productIndex) {
            const oldIndex = p.selectedVariantIds.findIndex(
              (id) => `variant-${id}` === active.id
            );
            const newIndex = p.selectedVariantIds.findIndex(
              (id) => `variant-${id}` === over.id
            );
            return {
              ...p,
              selectedVariantIds: arrayMove(
                p.selectedVariantIds,
                oldIndex,
                newIndex
              ),
            };
          }
          return p;
        })
      );
    }
  };

  return (
    <div className={styles.productList}>
      <header className={styles.header}>Add Products</header>
      <main>
        <div className={styles.headerRow}>
          <h3 className={styles.headerRowTitle}>Product</h3>
          <h3 className={styles.headerRowTitle}>Discount</h3>
        </div>

        {selectedProducts.length === 0 ? (
          <div className={styles.productRow}>
            <div className={styles.productRowItem}>
              <span className={styles.dragHandle}>⠿</span>
              <span className={styles.productNumber}>1.</span>
              <div className={styles.inputWrapper}>
                <input
                  className={styles.productRowInput}
                  placeholder="Select Product"
                  readOnly
                  onClick={handleOpenModal}
                />
                <button className={styles.editButton} onClick={handleOpenModal}>
                  ✎
                </button>
              </div>
            </div>
            <button className={styles.addDiscountButton}>Add Discount</button>
          </div>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            onDragCancel={handleDragCancel}
          >
            <SortableContext
              items={selectedProducts.map((_, i) => `product-${i}`)}
              strategy={verticalListSortingStrategy}
            >
              {selectedProducts.map((product, index) => (
                <SortableProductItem
                  key={`product-${index}`}
                  product={product}
                  index={index}
                  onEdit={() => handleEditProduct(index)}
                  onRemove={() => handleRemoveProduct(index)}
                  onDiscountChange={(value) =>
                    handleDiscountChange(index, value)
                  }
                  onDiscountTypeChange={(value) =>
                    handleDiscountTypeChange(index, value)
                  }
                  onToggleVariants={() => toggleVariants(index)}
                  onToggleProductDiscount={() => toggleProductDiscount(index)}
                  onToggleVariantDiscount={(variantId) =>
                    toggleVariantDiscount(index, variantId)
                  }
                  onVariantDiscountChange={(variantId, value) =>
                    handleVariantDiscountChange(index, variantId, value)
                  }
                  onVariantDiscountTypeChange={(variantId, value) =>
                    handleVariantDiscountTypeChange(index, variantId, value)
                  }
                  onRemoveVariant={(variantId) =>
                    handleRemoveVariant(index, variantId)
                  }
                  onVariantDragEnd={(event) =>
                    handleVariantDragEnd(index, event)
                  }
                />
              ))}
            </SortableContext>
            <DragOverlay dropAnimation={null}>
              {activeId ? (
                <ProductItem
                  product={
                    selectedProducts[parseInt(activeId.replace("product-", ""))]
                  }
                  index={parseInt(activeId.replace("product-", ""))}
                  onEdit={() => {}}
                  onRemove={() => {}}
                  onDiscountChange={() => {}}
                  onDiscountTypeChange={() => {}}
                  onToggleVariants={() => {}}
                  onToggleProductDiscount={() => {}}
                />
              ) : null}
            </DragOverlay>
          </DndContext>
        )}
      </main>

      <footer className={styles.footer}>
        <button className={styles.addProductButton} onClick={handleOpenModal}>
          Add Product
        </button>
      </footer>

      <ProductPickerModal
        open={isModalOpen}
        onClose={handleCloseModal}
        onConfirm={handleConfirm}
        existingProducts={getExistingSelections()}
      />
    </div>
  );
}

export default ProductList;
