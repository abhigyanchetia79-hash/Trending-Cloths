import { supabase } from "@/integrations/supabase/client";
import type { TablesInsert, TablesUpdate } from "@/integrations/supabase/types";
import { products as staticProducts } from "@/data/products";

// Initialize database with sample data
export const initializeDatabase = async () => {
  try {
    console.log("🚀 DATABASE INITIALIZATION: Starting...");
    
    // Check if products exist
    const { data: existingProducts, error: fetchError } = await supabase
      .from("products")
      .select("id")
      .limit(1);

    console.log("📊 DATABASE CHECK: Existing products:", existingProducts);
    console.log("🔍 DATABASE CHECK: Fetch error:", fetchError);

    if (fetchError) {
      console.error("❌ DATABASE ERROR: Failed to check existing products:", fetchError);
      throw fetchError;
    }

    // If no products exist, add sample products
    if (!existingProducts || existingProducts.length === 0) {
      console.log("📦 DATABASE INITIALIZATION: No products found, adding sample products...");
      console.log("📋 DATABASE INITIALIZATION: Sample products to add:", staticProducts.length);
      
      let successCount = 0;
      let errorCount = 0;
      
      for (const product of staticProducts) {
        console.log(`➕ DATABASE INITIALIZATION: Adding product: ${product.name}`);
        
        const productData: TablesInsert<"products"> = {
          id: product.id,
          name: product.name,
          price: product.price,
          original_price: product.originalPrice,
          image: product.image,
          images: product.images,
          category: product.category,
          tag: product.tag,
          rating: product.rating,
          reviews: product.reviews,
          description: product.description,
          sizes: product.sizes,
          colors: product.colors,
          in_stock: product.inStock,
          stock_quantity: product.stockQuantity,
        };

        const { error, data } = await supabase.from("products").insert(productData).select();
        if (error) {
          console.error(`❌ DATABASE ERROR: Failed to insert product "${product.name}":`, error);
          errorCount++;
        } else {
          console.log(`✅ DATABASE SUCCESS: Inserted product "${product.name}"`);
          successCount++;
        }
      }
      
      console.log(`📊 DATABASE INITIALIZATION COMPLETE: ${successCount} products added, ${errorCount} errors`);
    } else {
      console.log("✅ DATABASE INITIALIZATION: Products already exist, skipping initialization");
    }

    // Initialize payment settings if not exists
    const { data: paymentSettings } = await supabase
      .from("payment_settings")
      .select("id")
      .limit(1);

    if (!paymentSettings || paymentSettings.length === 0) {
      const defaultPaymentSettings: TablesInsert<"payment_settings"> = {
        id: "default",
        payee_name: "Trending Cloths",
        upi_id: "trendingcloths@ybl",
        gpay_enabled: true,
        paytm_enabled: true,
        phonepe_enabled: true,
      };

      await supabase.from("payment_settings").insert(defaultPaymentSettings);
      console.log("Default payment settings initialized");
    }

  } catch (error) {
    console.error("Error initializing database:", error);
  }
};

// Order management functions
export const createOrder = async (orderData: TablesInsert<"orders">) => {
  const { data, error } = await supabase
    .from("orders")
    .insert(orderData)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const createOrderItems = async (orderId: string, orderItems: Omit<TablesInsert<"order_items">, 'order_id'>[]) => {
  const itemsWithOrderId = orderItems.map(item => ({
    ...item,
    order_id: orderId,
  }));
  
  const { data, error } = await supabase
    .from("order_items")
    .insert(itemsWithOrderId)
    .select();

  if (error) throw error;
  return data;
};

export const updateOrderStatus = async (orderId: string, status: string) => {
  const { data, error } = await supabase
    .from("orders")
    .update({ order_status: status })
    .eq("id", orderId)
    .select()
    .single();

  if (error) throw error;
  return data;
};

// Review management functions
export const createReview = async (reviewData: TablesInsert<"reviews">) => {
  const { data, error } = await supabase
    .from("reviews")
    .insert(reviewData)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const getProductReviews = async (productId: string) => {
  const { data, error } = await supabase
    .from("reviews")
    .select("*")
    .eq("product_id", productId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data;
};

export const deleteReview = async (reviewId: string) => {
  const { error } = await supabase
    .from("reviews")
    .delete()
    .eq("id", reviewId);

  if (error) throw error;
};

// Product management functions
export const addProduct = async (productData: TablesInsert<"products">) => {
  const { data, error } = await supabase
    .from("products")
    .insert(productData)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const updateProduct = async (productId: string, productData: TablesUpdate<"products">) => {
  const { data, error } = await supabase
    .from("products")
    .update(productData)
    .eq("id", productId)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const deleteProduct = async (productId: string) => {
  const { error } = await supabase
    .from("products")
    .delete()
    .eq("id", productId);

  if (error) throw error;
};

// Advertisement management functions
export const createAdvertisement = async (adData: TablesInsert<"advertisements">) => {
  const { data, error } = await supabase
    .from("advertisements")
    .insert(adData)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const getActiveAdvertisements = async () => {
  const { data, error } = await supabase
    .from("advertisements")
    .select("*")
    .eq("is_active", true)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data;
};

export const updateAdvertisement = async (adId: string, adData: TablesUpdate<"advertisements">) => {
  const { data, error } = await supabase
    .from("advertisements")
    .update(adData)
    .eq("id", adId)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const deleteAdvertisement = async (adId: string) => {
  const { error } = await supabase
    .from("advertisements")
    .delete()
    .eq("id", adId);

  if (error) throw error;
};

// File upload functions
export const uploadFile = async (file: File, path: string) => {
  const { data, error } = await supabase.storage
    .from("product-images")
    .upload(path, file);

  if (error) throw error;
  
  const { data: { publicUrl } } = supabase.storage
    .from("product-images")
    .getPublicUrl(data.path);

  return publicUrl;
};

export const deleteFile = async (path: string) => {
  const { error } = await supabase.storage
    .from("product-images")
    .remove([path]);

  if (error) throw error;
};
