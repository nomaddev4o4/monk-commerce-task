import { useEffect, useState } from "react";
import Modal from "../modal/Modal";
import { fetchProducts } from "../../services/products.api";
import styles from "./ProductPicker.module.css";

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

interface SelectedItem {
  productId: number;
  variantIds: number[];
}

export function ProductPickerModal({
  open,
  onClose,
  onConfirm,
}: {
  open: boolean;
  onClose: () => void;
  onConfirm: (selected: SelectedItem[]) => void;
}) {
  const [products, setProducts] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedItems, setSelectedItems] = useState<SelectedItem[]>([]);

  useEffect(() => {
    if (open) {
      const loadProducts = async () => {
        try {
          const data = await fetchProducts(searchQuery);
          setProducts(data);
        } catch (error) {
          console.error("Error loading products:", error);
        }
      };
      loadProducts();
    }
  }, [open, searchQuery]);

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
      // Remove product
      setSelectedItems((prev) =>
        prev.filter((item) => item.productId !== product.id)
      );
    } else {
      // Add product with all variants
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
        // Product not selected, add it with this variant
        return [...prev, { productId, variantIds: [variantId] }];
      }

      const hasVariant = existingProduct.variantIds.includes(variantId);

      if (hasVariant) {
        // Remove variant
        const newVariantIds = existingProduct.variantIds.filter(
          (id) => id !== variantId
        );

        if (newVariantIds.length === 0) {
          // Remove product if no variants left
          return prev.filter((item) => item.productId !== productId);
        }

        return prev.map((item) =>
          item.productId === productId
            ? { ...item, variantIds: newVariantIds }
            : item
        );
      } else {
        // Add variant
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
    onConfirm(selectedItems);
    setSelectedItems([]);
    setSearchQuery("");
  };

  const handleClose = () => {
    onClose();
    setSelectedItems([]);
    setSearchQuery("");
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

      {/* PRODUCT LIST */}
      <div className={styles.list}>
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
                  <span className={styles.variantTitle}>{variant.title}</span>
                  <span className={styles.variantAvailability}>
                    99 available
                  </span>
                  <span className={styles.variantPrice}>${variant.price}</span>
                </div>
              ))}
            </div>
          );
        })}
      </div>

      {/* FOOTER */}
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
