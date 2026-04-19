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
  colors: (p.colors as any[]) || [],
  inStock: p.in_stock,
  stockQuantity: p.stock_quantity,
});

const fetchProducts = async (): Promise<Product[]> => {
  console.log("🔍 STEP 1: Fetching products from database...");
  
  // Always return static products immediately for now to ensure UI works
  console.log("📦 STEP 2: Using static products for immediate display");
  console.log("📋 STEP 3: Static products count:", staticProducts.length);
  
  // Try to fetch from database in background
  try {
    const { data, error } = await supabase.from("products").select("*").order("created_at", { ascending: false });
    
    console.log("📊 STEP 4: Database response:", { data, error });
    
    if (!error && data && data.length > 0) {
      console.log("✅ STEP 5: Found products in database, mapping them...");
      const mappedProducts = (data || []).map(mapDbProduct);
      console.log("📦 STEP 6: Mapped products:", mappedProducts);
      return mappedProducts;
    }
  } catch (error) {
    console.error("❌ STEP 7: Error fetching products from database:", error);
  }
  
  console.log("🔄 STEP 8: Using static product data as fallback");
  return staticProducts;
};

export const useProducts = () =>
  useQuery({ queryKey: ["products"], queryFn: fetchProducts });

export const useProductsByTag = (tag: string) => {
  const { data, ...rest } = useProducts();
  const filteredData = data?.filter((p) => p.tag === tag);
  console.log(`🏷️ STEP 9: Filtering products by tag "${tag}":`, {
    totalProducts: data?.length || 0,
    filteredProducts: filteredData?.length || 0,
    products: filteredData
  });
  return { data: filteredData, ...rest };
};

export const useProductsByCategory = (category: string) => {
  const { data, ...rest } = useProducts();
  const filteredData = data?.filter((p) => p.category === category);
  console.log(`👕 STEP 10: Filtering products by category "${category}":`, {
    totalProducts: data?.length || 0,
    filteredProducts: filteredData?.length || 0,
    products: filteredData
  });
  return { data: filteredData, ...rest };
};

export const useProductById = (id: string) =>
  useQuery({
    queryKey: ["product", id],
    queryFn: async () => {
      const { data, error } = await supabase.from("products").select("*").eq("id", id).maybeSingle();
      if (error) throw error;
      return data ? mapDbProduct(data) : null;
    },
    enabled: !!id,
  });
