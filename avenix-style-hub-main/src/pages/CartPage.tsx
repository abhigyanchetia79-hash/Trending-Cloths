import { Link } from "react-router-dom";
import { Trash2, Minus, Plus, ArrowRight, ShoppingBag } from "lucide-react";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useCart } from "@/context/CartContext";

const CartPage = () => {
  const { items, removeFromCart, updateQuantity, totalPrice } = useCart();

  if (items.length === 0) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 flex flex-col items-center justify-center gap-4 py-20">
          <ShoppingBag size={48} className="text-muted-foreground/40" />
          <h2 className="font-display text-xl font-bold text-foreground">Your cart is empty</h2>
          <Link
            to="/"
            className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 text-sm font-medium tracking-wider uppercase"
          >
            Continue Shopping <ArrowRight size={16} />
          </Link>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-8 md:py-16">
        <h1 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-8">Shopping Cart</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            {items.map((item, i) => (
              <motion.div
                key={`${item.product.id}-${item.size}-${item.color}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="flex gap-4 p-4 border border-border rounded-sm"
              >
                <img
                  src={item.product.image}
                  alt={item.product.name}
                  className="w-20 h-24 object-cover rounded-sm"
                />
                <div className="flex-1 space-y-1">
                  <h3 className="text-sm font-medium text-foreground">{item.product.name}</h3>
                  <p className="text-xs text-muted-foreground">
                    Size: {item.size} · Color: {item.color}
                  </p>
                  <p className="text-sm font-semibold text-foreground">₹{item.product.price.toFixed(2)}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <div className="flex items-center border border-border">
                      <button
                        onClick={() =>
                          updateQuantity(item.product.id, item.size, item.color, item.quantity - 1)
                        }
                        className="p-1 hover:bg-secondary"
                      >
                        <Minus size={12} />
                      </button>
                      <span className="px-3 text-xs font-medium">{item.quantity}</span>
                      <button
                        onClick={() =>
                          updateQuantity(item.product.id, item.size, item.color, item.quantity + 1)
                        }
                        className="p-1 hover:bg-secondary"
                      >
                        <Plus size={12} />
                      </button>
                    </div>
                    <button
                      onClick={() => removeFromCart(item.product.id, item.size, item.color)}
                      className="p-1 text-muted-foreground hover:text-destructive transition-colors"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
                <p className="text-sm font-bold text-foreground self-center">
                  ₹{(item.product.price * item.quantity).toFixed(2)}
                </p>
              </motion.div>
            ))}
          </div>

          {/* Summary */}
          <div className="border border-border rounded-sm p-6 h-fit space-y-4">
            <h3 className="font-display text-lg font-bold text-foreground">Order Summary</h3>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Subtotal</span>
              <span className="font-medium">₹{totalPrice.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Shipping</span>
              <span className="font-medium text-green-600">Free</span>
            </div>
            <div className="border-t border-border pt-4 flex justify-between">
              <span className="font-semibold">Total</span>
              <span className="font-bold text-lg">₹{totalPrice.toFixed(2)}</span>
            </div>
            <Link
              to="/checkout"
              className="block w-full text-center bg-primary text-primary-foreground py-3 text-sm font-medium tracking-wider uppercase hover:bg-brand-hover transition-colors"
            >
              Proceed to Checkout
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default CartPage;
