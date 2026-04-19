export interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  images: string[];
  category: "men" | "women";
  tag?: "trending" | "new" | "bestseller";
  rating: number;
  reviews: number;
  description: string;
  sizes: string[];
  colors: { name: string; hex: string }[];
  inStock: boolean;
  stockQuantity: number;
}

export interface CartItem {
  product: Product;
  quantity: number;
  size: string;
  color: string;
}

export const products: Product[] = [];

export const getProductsByTag = (tag: Product["tag"]) =>
  products.filter((p) => p.tag === tag);

export const getProductsByCategory = (category: Product["category"]) =>
  products.filter((p) => p.category === category);

export const getProductById = (id: string) =>
  products.find((p) => p.id === id);
