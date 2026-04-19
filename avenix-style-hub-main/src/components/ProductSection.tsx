import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import ProductCard from "./ProductCard";
import { Product } from "@/hooks/useProducts";

interface ProductSectionProps {
  title: string;
  subtitle?: string;
  products: Product[];
  viewAllLink?: string;
}

const ProductSection = ({ title, subtitle, products, viewAllLink }: ProductSectionProps) => {
  return (
    <section className="py-16 md:py-24">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h2 className="text-2xl md:text-3xl font-light tracking-[0.1em] uppercase text-foreground">{title}</h2>
          {subtitle && <p className="text-sm text-muted-foreground mt-2 tracking-wide">{subtitle}</p>}
        </motion.div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8">
          {products.length > 0 ? (
            products.map((product, i) => (
              <ProductCard key={product.id} product={product} index={i} />
            ))
          ) : (
            <div className="col-span-full text-center py-12">
              <p className="text-muted-foreground text-lg">No products available at the moment.</p>
              <p className="text-sm text-muted-foreground mt-2">Please check back later or contact support.</p>
            </div>
          )}
        </div>
        {viewAllLink && (
          <div className="mt-12 text-center">
            <Link to={viewAllLink} className="inline-block border border-foreground text-foreground px-10 py-3 text-xs font-medium tracking-[0.2em] uppercase hover:bg-foreground hover:text-background transition-all duration-500">
              View All
            </Link>
          </div>
        )}
      </div>
    </section>
  );
};

export default ProductSection;
