import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import { useWishlist } from "@/context/WishlistContext";
import { Heart } from "lucide-react";
import { Link } from "react-router-dom";

const WishlistPage = () => {
  const { items } = useWishlist();

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-8 md:py-16">
        <h1 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-8">
          My Wishlist
        </h1>
        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <Heart size={48} className="text-muted-foreground/40" />
            <p className="text-muted-foreground">Your wishlist is empty</p>
            <Link to="/" className="text-sm text-primary hover:underline underline-offset-4">
              Browse products
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {items.map((product, i) => (
              <ProductCard key={product.id} product={product} index={i} />
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default WishlistPage;
