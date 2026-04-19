import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import AdvertisementSection from "@/components/AdvertisementSection";
import ProductSection from "@/components/ProductSection";
import CategorySection from "@/components/CategorySection";
import Footer from "@/components/Footer";
import Newsletter from "@/components/Newsletter";
import { useProductsByTag } from "@/hooks/useProducts";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";

const Index = () => {
  const { data: trending, isLoading: l1 } = useProductsByTag("trending");
  const { data: newArrivals, isLoading: l2 } = useProductsByTag("new");
  const { data: bestSellers, isLoading: l3 } = useProductsByTag("bestseller");

  const loading = l1 || l2 || l3;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="min-h-screen flex flex-col"
    >
      <Navbar />
      <main className="flex-1">
        <HeroSection />
        {loading ? (
          <div className="container mx-auto px-6 py-24">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="space-y-4">
                  <Skeleton className="aspect-[3/4] w-full" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              ))}
            </div>
          </div>
        ) : (
          <>
            <div id="products-section">
              <ProductSection title="Featured" subtitle="Handpicked styles for you" products={trending || []} />
            </div>
            <AdvertisementSection />
            <CategorySection />
            <ProductSection title="New Arrivals" subtitle="Fresh drops this season" products={newArrivals || []} />
            <ProductSection title="Best Sellers" subtitle="Our most loved pieces" products={bestSellers || []} />
          </>
        )}
      </main>
      <Newsletter />
      <Footer />
    </motion.div>
  );
};

export default Index;
