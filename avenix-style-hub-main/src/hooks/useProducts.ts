import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
import { products as staticProducts } from "@/data/products";

export type DbProduct = Tables<"products">;

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

export const mapDbProduct = (p: DbProduct): Product => ({
  id: p.id,
  name: p.name,
  price: Number(p.price),
  originalPrice: p.original_price ? Number(p.original_price) : undefined,
  image: p.image,
  images: p.images,
  category: p.category as "men" | "women",
  tag: p.tag as Product["tag"],
  rating: Number(p.rating),
  reviews: p.reviews,
  description: p.description || "",
  sizes: p.sizes,
  colors: (p.colors as { name: string; hex: string }[]) || [],
  inStock: p.in_stock,
  stockQuantity: p.stock_quantity,
});

const fetchProducts = async (): Promise<Product[]> => {
  try {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error && data && data.length > 0) {
      return data.map(mapDbProduct);
    }
  } catch {
    // Fall through to static products
  }

  return staticProducts;
};

export const useProducts = () =>
  useQuery({
    queryKey: ["products"],
    queryFn: fetchProducts,
  });

export const useProductsByTag = (tag: string) => {
  const { data, ...rest } = useProducts();
  return { data: data?.filter((p) => p.tag === tag), ...rest };
};

export const useProductsByCategory = (category: string) => {
  const { data, ...rest } = useProducts();
  return { data: data?.filter((p) => p.category === category), ...rest };
};

export const useProductById = (id: string) =>
  useQuery({
    queryKey: ["product", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("id", id)
        .maybeSingle();
      if (error) throw error;
      return data ? mapDbProduct(data) : null;
    },
    enabled: !!id,
  });
