import { useState } from "react";
import { ProductPickerModal } from "../product-picker/ProductPicker";
import SortableProductItem from "./SortableProductItem";
import styles from "./ProductList.module.css";

import type {
  SelectedItem,
  Product,
  ProductWithDiscount,
} from "../../types/product.type";

function ProductList() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProducts, setSelectedProducts] = useState<
    ProductWithDiscount[]
  >([]);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

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

  const getExistingSelections = () => {
    return selectedProducts.map((p) => ({
      productId: p.id,
      variantIds: p.selectedVariantIds,
    }));
  };

  const getLockedSelections = () => {
    // Always lock all previously selected products
    // When editing, the user can only select NEW products which will replace the edited one
    return selectedProducts.map((p) => ({
      productId: p.id,
      variantIds: p.selectedVariantIds,
    }));
  };

  const handleConfirm = (selected: SelectedItem[], allProducts: Product[]) => {
    // Filter out locked products - only process NEW selections
    const lockedProductIds = selectedProducts.map((p) => p.id);
    const newSelections = selected.filter(
      (item) => !lockedProductIds.includes(item.productId)
    );

    const newProducts = newSelections
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
      // Replace the edited product with new selections
      setSelectedProducts((prev) => {
        const updated = [...prev];
        updated.splice(editingIndex, 1, ...newProducts);
        return updated;
      });
    } else {
      // Add new products (shouldn't happen since all are locked, but keep for safety)
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

  const handleProductDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleProductDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex !== null && draggedIndex !== index) {
      setSelectedProducts((items) => {
        const newItems = [...items];
        const draggedItem = newItems[draggedIndex];
        newItems.splice(draggedIndex, 1);
        newItems.splice(index, 0, draggedItem);
        return newItems;
      });
      setDraggedIndex(index);
    }
  };

  const handleProductDrop = () => {
    setDraggedIndex(null);
  };

  const handleVariantReorder = (
    productIndex: number,
    oldIndex: number,
    newIndex: number
  ) => {
    setSelectedProducts((prev) =>
      prev.map((p, i) => {
        if (i === productIndex) {
          const newVariantIds = [...p.selectedVariantIds];
          const movedId = newVariantIds[oldIndex];
          newVariantIds.splice(oldIndex, 1);
          newVariantIds.splice(newIndex, 0, movedId);
          return {
            ...p,
            selectedVariantIds: newVariantIds,
          };
        }
        return p;
      })
    );
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
            <button className={styles.addDiscountButton} disabled>
              Add Discount
            </button>
          </div>
        ) : (
          <>
            {selectedProducts.map((product, index) => (
              <SortableProductItem
                key={`product-${index}`}
                product={product}
                index={index}
                onEdit={() => handleEditProduct(index)}
                onRemove={() => handleRemoveProduct(index)}
                onDiscountChange={(value) => handleDiscountChange(index, value)}
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
                onVariantReorder={(oldIndex, newIndex) =>
                  handleVariantReorder(index, oldIndex, newIndex)
                }
                onDragStart={() => handleProductDragStart(index)}
                onDragOver={(e) => handleProductDragOver(e, index)}
                onDrop={handleProductDrop}
                isDragging={draggedIndex === index}
              />
            ))}
          </>
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
        lockedProducts={getLockedSelections()}
      />
    </div>
  );
}

export default ProductList;
