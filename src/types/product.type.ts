export interface SelectedItem {
  productId: number;
  variantIds: number[];
}

export interface Variant {
  id: number;
  product_id: number;
  title: string;
  price: string;
}

export interface Product {
  id: number;
  title: string;
  variants: Variant[];
  image: {
    id: number;
    product_id: number;
    src: string;
  };
}

export interface ProductWithDiscount extends Product {
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

export interface Variant {
  id: number;
  product_id: number;
  title: string;
  price: string;
}

export interface Product {
  id: number;
  title: string;
  variants: Variant[];
  image: {
    id: number;
    product_id: number;
    src: string;
  };
}

export interface SelectedItem {
  productId: number;
  variantIds: number[];
}
