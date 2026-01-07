import { useEffect, useState, useRef, useCallback } from "react";
import Modal from "../modal/Modal";
import { fetchProducts } from "../../services/products.api";
import styles from "./ProductPicker.module.css";
import type { SelectedItem, Product } from "../../types/product.type";

const INITIAL_PAGE_INDEX = 0;

export function ProductPickerModal({
  open,
  onClose,
  onConfirm,
  existingProducts = [],
  lockedProducts = [],
}: {
  open: boolean;
  onClose: () => void;
  onConfirm: (selected: SelectedItem[], products: Product[]) => void;
  existingProducts?: { productId: number; variantIds: number[] }[];
  lockedProducts?: { productId: number; variantIds: number[] }[];
}) {
  const [products, setProducts] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedItems, setSelectedItems] = useState<SelectedItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [pageIndex, setPageIndex] = useState(INITIAL_PAGE_INDEX);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const debounceTimerRef = useRef<number | null>(null);
  const isInitialMount = useRef(true);
  const listRef = useRef<HTMLDivElement>(null);
  const [allLoadedProducts, setAllLoadedProducts] = useState<Product[]>([]);

  useEffect(() => {
    if (open && existingProducts.length > 0) {
      setSelectedItems(existingProducts);
    } else if (open) {
      setSelectedItems([]);
    }
  }, [open, existingProducts]);

  useEffect(() => {
    if (open) {
      setPageIndex(INITIAL_PAGE_INDEX);
      setHasMore(true);
      setProducts([]);
      setError(null);
    }

    if (open && isInitialMount.current) {
      setAllLoadedProducts([]);
    }
  }, [open, searchQuery]);

  useEffect(() => {
    if (!open) {
      isInitialMount.current = true;
      return;
    }

    if (isInitialMount.current) {
      isInitialMount.current = false;
      loadProducts(searchQuery, INITIAL_PAGE_INDEX, true);
      return;
    }

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      loadProducts(searchQuery, INITIAL_PAGE_INDEX, true);
    }, 500);

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [searchQuery, open]);

  const loadProducts = async (
    search: string,
    nextPageIndex: number,
    reset = false
  ) => {
    if (reset) {
      setIsLoading(true);
      setError(null);
    } else {
      setIsLoadingMore(true);
    }

    try {
      const data = await fetchProducts(search, nextPageIndex, 10);

      const productsArray = Array.isArray(data) ? data : [];

      if (reset) {
        setProducts(productsArray);
      } else {
        setProducts((prev) => [...prev, ...productsArray]);
      }

      setAllLoadedProducts((prev) => {
        const existingIds = new Set(prev.map((p) => p.id));
        const newProducts = productsArray.filter((p) => !existingIds.has(p.id));
        return [...prev, ...newProducts];
      });

      setHasMore(productsArray.length === 10);
      setPageIndex(nextPageIndex);
      setError(null);
    } catch (error) {
      console.error("Error loading products:", error);
      if (reset) {
        setProducts([]);
        setError("Failed to load products. Please try again.");
      }
      setHasMore(false);
    } finally {
      if (reset) {
        setIsLoading(false);
      } else {
        setIsLoadingMore(false);
      }
    }
  };

  const handleScroll = useCallback(() => {
    if (!listRef.current || isLoadingMore || !hasMore) return;

    const { scrollTop, scrollHeight, clientHeight } = listRef.current;

    if (scrollTop + clientHeight >= scrollHeight - 50) {
      loadProducts(searchQuery, pageIndex + 1, false);
    }
  }, [isLoadingMore, hasMore, pageIndex, searchQuery]);

  useEffect(() => {
    const listElement = listRef.current;
    if (listElement && open) {
      listElement.addEventListener("scroll", handleScroll);
      return () => listElement.removeEventListener("scroll", handleScroll);
    }
  }, [open, handleScroll]);

  const isProductLocked = (productId: number) => {
    return lockedProducts.some((item) => item.productId === productId);
  };

  const isVariantLocked = (productId: number, variantId: number) => {
    const product = lockedProducts.find((item) => item.productId === productId);
    return product?.variantIds.includes(variantId) || false;
  };

  const isProductSelected = (productId: number) => {
    return selectedItems.some((item) => item.productId === productId);
  };

  const isVariantSelected = (productId: number, variantId: number) => {
    const product = selectedItems.find((item) => item.productId === productId);
    return product?.variantIds.includes(variantId) || false;
  };

  const toggleProduct = (product: Product) => {
    if (isProductLocked(product.id)) return;

    const isSelected = isProductSelected(product.id);

    if (isSelected) {
      setSelectedItems((prev) =>
        prev.filter((item) => item.productId !== product.id)
      );
    } else {
      setSelectedItems((prev) => [
        ...prev,
        {
          productId: product.id,
          variantIds: product.variants.map((v) => v.id),
        },
      ]);
    }
  };

  const toggleVariant = (productId: number, variantId: number) => {
    if (isVariantLocked(productId, variantId)) return;

    setSelectedItems((prev) => {
      const existingProduct = prev.find((item) => item.productId === productId);

      if (!existingProduct) {
        return [...prev, { productId, variantIds: [variantId] }];
      }

      const hasVariant = existingProduct.variantIds.includes(variantId);

      if (hasVariant) {
        const newVariantIds = existingProduct.variantIds.filter(
          (id) => id !== variantId
        );

        if (newVariantIds.length === 0) {
          return prev.filter((item) => item.productId !== productId);
        }

        return prev.map((item) =>
          item.productId === productId
            ? { ...item, variantIds: newVariantIds }
            : item
        );
      } else {
        return prev.map((item) =>
          item.productId === productId
            ? { ...item, variantIds: [...item.variantIds, variantId] }
            : item
        );
      }
    });
  };

  const getSelectedCount = () => {
    return selectedItems.length;
  };

  const getNewSelectionCount = () => {
    const lockedProductIds = lockedProducts.map((p) => p.productId);
    return selectedItems.filter(
      (item) => !lockedProductIds.includes(item.productId)
    ).length;
  };

  const handleConfirm = () => {
    onConfirm(selectedItems, allLoadedProducts);
    setSelectedItems([]);
    setSearchQuery("");
    setAllLoadedProducts([]);
  };

  const handleClose = () => {
    onClose();
    setSelectedItems([]);
    setSearchQuery("");
    setAllLoadedProducts([]);
  };

  return (
    <Modal open={open} onClose={handleClose}>
      <header className={styles.header}>
        <h3 className={styles.headerTitle}>Select Products</h3>
        <button className={styles.closeButton} onClick={handleClose}>
          ✕
        </button>
      </header>

      <div className={styles.search}>
        <img src="search.svg" alt="Search" className={styles.searchIcon} />
        <input
          className={styles.searchInput}
          placeholder="Search product"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <div className={styles.list} ref={listRef}>
        {isLoading ? (
          <div className={styles.loadingContainer}>
            <div className={styles.spinner}></div>
            <p className={styles.loadingText}>Loading products...</p>
          </div>
        ) : error ? (
          <div className={styles.errorState}>
            <p className={styles.errorText}>{error}</p>
            <button
              className={styles.retryButton}
              onClick={() =>
                loadProducts(searchQuery, INITIAL_PAGE_INDEX, true)
              }
            >
              Retry
            </button>
          </div>
        ) : !products || products.length === 0 ? (
          <div className={styles.emptyState}>
            <p>No products found</p>
          </div>
        ) : (
          <>
            {products.map((product) => {
              const isChecked = isProductSelected(product.id);
              const isLocked = isProductLocked(product.id);
              const productTitle =
                typeof product.title === "string" && product.title.trim()
                  ? product.title
                  : "Untitled product";
              const imageSrc =
                typeof product.image?.src === "string" &&
                product.image.src.trim()
                  ? product.image.src
                  : "/broken-image.jpg";

              return (
                <div key={product.id} className={styles.productItem}>
                  <div
                    className={styles.productHeader}
                    onClick={() => !isLocked && toggleProduct(product)}
                    style={{
                      cursor: isLocked ? "not-allowed" : "pointer",
                      opacity: isLocked ? 0.6 : 1,
                    }}
                  >
                    <input
                      type="checkbox"
                      className={styles.checkbox}
                      checked={isChecked}
                      disabled={isLocked}
                      onChange={() => toggleProduct(product)}
                      onClick={(e) => e.stopPropagation()}
                    />
                    <img
                      src={imageSrc}
                      alt={productTitle}
                      className={styles.productImage}
                      onError={(e) => {
                        const img = e.currentTarget;
                        if (img.src.includes("/broken-image.jpg")) return;
                        img.onerror = null;
                        img.src = "/broken-image.jpg";
                      }}
                    />
                    <span className={styles.productTitle}>{productTitle}</span>
                  </div>

                  {(product.variants ?? []).map((variant) => {
                    const variantLocked = isVariantLocked(
                      product.id,
                      variant.id
                    );
                    return (
                      <div
                        key={variant.id}
                        className={styles.variantItem}
                        onClick={() =>
                          !variantLocked &&
                          toggleVariant(product.id, variant.id)
                        }
                        style={{
                          cursor: variantLocked ? "not-allowed" : "pointer",
                          opacity: variantLocked ? 0.6 : 1,
                        }}
                      >
                        <input
                          type="checkbox"
                          className={styles.checkbox}
                          checked={isVariantSelected(product.id, variant.id)}
                          disabled={variantLocked}
                          onChange={() => toggleVariant(product.id, variant.id)}
                          onClick={(e) => e.stopPropagation()}
                        />
                        <span className={styles.variantTitle}>
                          {variant.title}
                        </span>
                        <span className={styles.variantAvailability}>
                          {typeof variant.count === "number"
                            ? `${variant.count} available`
                            : null}
                        </span>
                        <span className={styles.variantPrice}>
                          {variant.price ? `$${variant.price}` : "—"}
                        </span>
                      </div>
                    );
                  })}
                </div>
              );
            })}

            {isLoadingMore && (
              <div className={styles.loadingMoreContainer}>
                <div className={styles.spinnerSmall}></div>
                <p className={styles.loadingMoreText}>Loading more...</p>
              </div>
            )}

            {!hasMore && products && products.length > 0 && (
              <div className={styles.endMessage}>
                <p>No more products to load</p>
              </div>
            )}
          </>
        )}
      </div>

      <div className={styles.footer}>
        <span>
          {getSelectedCount()}{" "}
          {getSelectedCount() === 1 ? "product" : "products"} selected
        </span>
        <div className={styles.footerButtons}>
          <button className={styles.cancelButton} onClick={handleClose}>
            Cancel
          </button>
          <button
            className={styles.addButton}
            onClick={handleConfirm}
            disabled={
              getNewSelectionCount() === 0 || isLoading || isLoadingMore
            }
          >
            Add
          </button>
        </div>
      </div>
    </Modal>
  );
}
