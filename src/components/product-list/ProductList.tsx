import { useState, useEffect } from "react";
import { ProductPickerModal } from "../product-picker/ProductPicker";
import { fetchProducts } from "../../services/products.api";
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

function ProductList() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProducts, setSelectedProducts] = useState<
    ProductWithDiscount[]
  >([]);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const data = await fetchProducts();
        setAllProducts(data);
      } catch (error) {
        console.error("Error loading products:", error);
      }
    };

    loadProducts();
  }, []);

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

  const handleConfirm = (selected: SelectedItem[]) => {
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
      // Add new products to the end
      setSelectedProducts((prev) => [...prev, ...newProducts]);
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
          selectedProducts.map((product, index) => {
            const hasMultipleVariants = product.selectedVariantIds.length > 1;
            const selectedVariants = product.variants.filter((v) =>
              product.selectedVariantIds.includes(v.id)
            );

            return (
              <div
                key={`${product.id}-${index}`}
                className={styles.productGroup}
              >
                <div className={styles.productRow}>
                  <div className={styles.productRowItem}>
                    <span className={styles.dragHandle}>⠿</span>
                    <span className={styles.productNumber}>{index + 1}.</span>
                    <div className={styles.inputWrapper}>
                      <input
                        className={styles.productRowInput}
                        value={product.title}
                        readOnly
                      />
                      <button
                        className={styles.editButton}
                        onClick={() => handleEditProduct(index)}
                      >
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
                          onChange={(e) =>
                            handleDiscountChange(index, e.target.value)
                          }
                          placeholder="0"
                        />
                        <select
                          className={styles.discountTypeSelect}
                          value={product.discountType}
                          onChange={(e) =>
                            handleDiscountTypeChange(index, e.target.value)
                          }
                        >
                          <option>% Off</option>
                          <option>Flat Off</option>
                        </select>
                      </>
                    ) : (
                      <button
                        className={styles.addDiscountButton}
                        onClick={() => toggleProductDiscount(index)}
                      >
                        Add Discount
                      </button>
                    )}
                    <button
                      className={styles.removeButton}
                      onClick={() => handleRemoveProduct(index)}
                    >
                      ✕
                    </button>
                  </div>
                </div>

                {hasMultipleVariants && (
                  <div className={styles.variantsToggle}>
                    <button
                      className={styles.toggleButton}
                      onClick={() => toggleVariants(index)}
                    >
                      {product.showVariants ? "Hide" : "Show"} variants ˅
                    </button>
                  </div>
                )}

                {hasMultipleVariants && product.showVariants && (
                  <div className={styles.variantsList}>
                    {selectedVariants.map((variant) => {
                      const variantData =
                        product.variantsWithDiscount[variant.id];
                      return (
                        <div key={variant.id} className={styles.variantRow}>
                          <div className={styles.productRowItem}>
                            <span className={styles.dragHandle}>⠿</span>
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
                                  onChange={(e) =>
                                    handleVariantDiscountChange(
                                      index,
                                      variant.id,
                                      e.target.value
                                    )
                                  }
                                  placeholder="0"
                                />
                                <select
                                  className={styles.discountTypeSelect}
                                  value={variantData.discountType}
                                  onChange={(e) =>
                                    handleVariantDiscountTypeChange(
                                      index,
                                      variant.id,
                                      e.target.value
                                    )
                                  }
                                >
                                  <option>% Off</option>
                                  <option>Flat Off</option>
                                </select>
                              </>
                            ) : (
                              <button
                                className={styles.addDiscountButton}
                                onClick={() =>
                                  toggleVariantDiscount(index, variant.id)
                                }
                              >
                                Add Discount
                              </button>
                            )}
                            <button
                              className={styles.removeButton}
                              onClick={() =>
                                handleRemoveVariant(index, variant.id)
                              }
                            >
                              ✕
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })
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
      />
    </div>
  );
}

export default ProductList;
