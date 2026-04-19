import { useParams } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import { useProductsByCategory } from "@/hooks/useProducts";
import { motion } from "framer-motion";
import { Skeleton } from "@/components/ui/skeleton";

const CategoryPage = () => {
  const { category } = useParams<{ category: string }>();
  const validCategory = category === "men" || category === "women" ? category : "men";
  const { data: products, isLoading } = useProductsByCategory(validCategory);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-8 md:py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
          <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground capitalize">{validCategory}'s Collection</h1>
          <p className="text-sm text-muted-foreground mt-2">{products?.length || 0} products</p>
        </motion.div>
        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="space-y-3">
                <Skeleton className="aspect-[3/4] w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {products && products.length > 0 ? (
              products.map((product, i) => (
                <ProductCard key={product.id} product={product} index={i} />
              ))
            ) : (
              <div className="col-span-full text-center py-12">
                <p className="text-muted-foreground text-lg">No products found in this category.</p>
                <p className="text-sm text-muted-foreground mt-2">Try browsing other categories or check back later.</p>
              </div>
            )}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default CategoryPage;
