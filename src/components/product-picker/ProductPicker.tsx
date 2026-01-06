import { useEffect, useState, useRef, useCallback } from "react";
import Modal from "../modal/Modal";
import { fetchProducts } from "../../services/products.api";
import styles from "./ProductPicker.module.css";
import type { SelectedItem, Product } from "../../types/product.type";

export function ProductPickerModal({
  open,
  onClose,
  onConfirm,
  existingProducts = [],
}: {
  open: boolean;
  onClose: () => void;
  onConfirm: (selected: SelectedItem[], products: Product[]) => void;
  existingProducts?: { productId: number; variantIds: number[] }[];
}) {
  const [products, setProducts] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedItems, setSelectedItems] = useState<SelectedItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [page, setPage] = useState(0);
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
      setPage(0);
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
      loadProducts(searchQuery, 0, true);
      return;
    }

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      loadProducts(searchQuery, 0, true);
    }, 500);

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [searchQuery, open]);

  const loadProducts = async (
    search: string,
    pageNum: number,
    reset = false
  ) => {
    if (reset) {
      setIsLoading(true);
      setError(null);
    } else {
      setIsLoadingMore(true);
    }

    try {
      const data = await fetchProducts(search, pageNum, 10);

      console.log("API Response:", data);

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
      setPage(pageNum);
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
      loadProducts(searchQuery, page + 1, false);
    }
  }, [isLoadingMore, hasMore, page, searchQuery]);

  useEffect(() => {
    const listElement = listRef.current;
    if (listElement && open) {
      listElement.addEventListener("scroll", handleScroll);
      return () => listElement.removeEventListener("scroll", handleScroll);
    }
  }, [open, handleScroll]);

  const isProductSelected = (productId: number) => {
    return selectedItems.some((item) => item.productId === productId);
  };

  const isVariantSelected = (productId: number, variantId: number) => {
    const product = selectedItems.find((item) => item.productId === productId);
    return product?.variantIds.includes(variantId) || false;
  };

  const toggleProduct = (product: Product) => {
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
        <img
          src="/icons/search.svg"
          alt="Search"
          className={styles.searchIcon}
        />
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
              onClick={() => loadProducts(searchQuery, 0, true)}
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

              return (
                <div key={product.id} className={styles.productItem}>
                  <div
                    className={styles.productHeader}
                    onClick={() => toggleProduct(product)}
                  >
                    <input
                      type="checkbox"
                      className={styles.checkbox}
                      checked={isChecked}
                      onChange={() => toggleProduct(product)}
                      onClick={(e) => e.stopPropagation()}
                    />
                    <img
                      src={product.image.src}
                      alt={product.title}
                      className={styles.productImage}
                    />
                    <span className={styles.productTitle}>{product.title}</span>
                  </div>

                  {product.variants.map((variant) => (
                    <div
                      key={variant.id}
                      className={styles.variantItem}
                      onClick={() => toggleVariant(product.id, variant.id)}
                    >
                      <input
                        type="checkbox"
                        className={styles.checkbox}
                        checked={isVariantSelected(product.id, variant.id)}
                        onChange={() => toggleVariant(product.id, variant.id)}
                        onClick={(e) => e.stopPropagation()}
                      />
                      <span className={styles.variantTitle}>
                        {variant.title}
                      </span>
                      <span className={styles.variantAvailability}>
                        99 available
                      </span>
                      <span className={styles.variantPrice}>
                        ${variant.price}
                      </span>
                    </div>
                  ))}
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
          <button className={styles.addButton} onClick={handleConfirm}>
            Add
          </button>
        </div>
      </div>
    </Modal>
  );
}
