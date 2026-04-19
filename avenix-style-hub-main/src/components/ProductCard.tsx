import { Link } from "react-router-dom";
import { Heart } from "lucide-react";
import { Product } from "@/hooks/useProducts";
import { useWishlist } from "@/context/WishlistContext";
import { motion } from "framer-motion";

interface ProductCardProps {
  product: Product;
  index?: number;
}

const ProductCard = ({ product, index = 0 }: ProductCardProps) => {
  const { toggleWishlist, isInWishlist } = useWishlist();
  const wishlisted = isInWishlist(product.id);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.08 }}
      className="group"
    >
      <Link to={`/product/${product.id}`} className="block">
        <div className="relative aspect-[3/4] overflow-hidden bg-muted mb-4">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
            loading="lazy"
          />
          {/* Wishlist */}
          <button
            onClick={(e) => { e.preventDefault(); toggleWishlist(product); }}
            className="absolute top-4 right-4 p-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          >
            <Heart size={18} className={wishlisted ? "fill-foreground text-foreground" : "text-foreground/60 hover:text-foreground"} />
          </button>
          {/* Tag */}
          {product.tag && (
            <span className="absolute top-4 left-4 px-3 py-1 text-[10px] font-medium tracking-[0.15em] uppercase bg-background text-foreground">
              {product.tag === "new" ? "New" : product.tag === "trending" ? "Trending" : "Best Seller"}
            </span>
          )}
          {/* Out of stock */}
          {!product.inStock && (
            <div className="absolute inset-0 bg-background/70 flex items-center justify-center">
              <span className="text-xs font-medium tracking-[0.2em] uppercase text-foreground/60">Sold Out</span>
            </div>
          )}
        </div>
      </Link>
      <div className="space-y-1.5">
        <Link to={`/product/${product.id}`}>
          <h3 className="text-sm font-normal text-foreground truncate">{product.name}</h3>
        </Link>
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-foreground">₹{product.price.toFixed(0)}</span>
          {product.originalPrice && (
            <span className="text-sm text-muted-foreground line-through">₹{product.originalPrice.toFixed(0)}</span>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default ProductCard;
