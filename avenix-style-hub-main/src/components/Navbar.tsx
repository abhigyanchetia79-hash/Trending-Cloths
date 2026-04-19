import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Search, ShoppingBag, Heart, User, Menu, X, Shield } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import logo from "@/assets/logo.png";

const navLinks = [
  { label: "Home", path: "/" },
  { label: "Men", path: "/category/men" },
  { label: "Women", path: "/category/women" },
];

const Navbar = () => {
  const { totalItems } = useCart();
  const { user, isAdmin, showAdminLogin } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <header className="sticky top-0 z-50 bg-background border-b border-border">
      <div className="container mx-auto px-6 flex items-center justify-between h-[72px]">
        {/* Mobile menu */}
        <button className="lg:hidden p-2 text-foreground" onClick={() => setMobileOpen(!mobileOpen)}>
          {mobileOpen ? <X size={20} /> : <Menu size={20} />}
        </button>

        {/* Logo */}
        <Link to="/" className="flex items-center gap-3">
          <img src={logo} alt="Trending Cloths" className="h-10 w-10 object-contain" />
          <span className="text-lg font-semibold tracking-[0.15em] uppercase text-foreground hidden sm:block">
            Trending Cloths
          </span>
        </Link>

        {/* Nav links */}
        <nav className="hidden lg:flex items-center gap-10">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className="text-xs font-medium tracking-[0.2em] uppercase text-foreground/70 hover:text-foreground transition-colors duration-200"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Icons */}
        <div className="flex items-center gap-4">
          <button onClick={() => setSearchOpen(!searchOpen)} className="p-2 text-foreground/60 hover:text-foreground transition-colors">
            <Search size={20} />
          </button>
          <Link to="/wishlist" className="p-2 text-foreground/60 hover:text-foreground transition-colors">
            <Heart size={20} />
          </Link>
          <Link to="/cart" className="p-2 text-foreground/60 hover:text-foreground transition-colors relative">
            <ShoppingBag size={20} />
            {totalItems > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-5 h-5 rounded-full bg-foreground text-background text-[10px] font-bold flex items-center justify-center">
                {totalItems}
              </span>
            )}
          </Link>
          {isAdmin && (
            <Link to="/admin" className="p-2 text-foreground/60 hover:text-foreground transition-colors hidden md:block" title="Admin Dashboard">
              <Shield size={20} />
            </Link>
          )}
          {showAdminLogin && !isAdmin && !user && (
            <Link to="/admin/auth" className="p-2 text-foreground/60 hover:text-foreground transition-colors hidden md:block" title="Admin Login">
              <Shield size={20} />
            </Link>
          )}
          <Link to={user ? "/profile" : "/auth"} className="p-2 text-foreground/60 hover:text-foreground transition-colors hidden md:block">
            <User size={20} />
          </Link>
        </div>
      </div>

      {/* Search bar */}
      <AnimatePresence>
        {searchOpen && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="border-t border-border overflow-hidden">
            <div className="container mx-auto px-6 py-4">
              <form onSubmit={(e) => { e.preventDefault(); if (searchQuery.trim()) { navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`); setSearchOpen(false); setSearchQuery(""); } }}>
                <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search products..." className="w-full bg-transparent border-b border-foreground/20 px-0 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-foreground transition-colors" autoFocus />
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile nav */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.nav initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="lg:hidden border-t border-border overflow-hidden">
            <div className="container mx-auto px-6 py-6 flex flex-col gap-4">
              {navLinks.map((link) => (
                <Link key={link.path} to={link.path} className="text-sm font-medium tracking-[0.15em] uppercase text-foreground/70 hover:text-foreground py-1" onClick={() => setMobileOpen(false)}>
                  {link.label}
                </Link>
              ))}
              <Link to={user ? "/profile" : "/auth"} className="text-sm font-medium tracking-[0.15em] uppercase text-foreground/70 hover:text-foreground py-1" onClick={() => setMobileOpen(false)}>
                {user ? "Profile" : "Sign In"}
              </Link>
              {isAdmin && (
                <Link to="/admin" className="text-sm font-medium tracking-[0.15em] uppercase text-foreground/70 hover:text-foreground py-1" onClick={() => setMobileOpen(false)}>
                  Admin
                </Link>
              )}
              {showAdminLogin && !isAdmin && !user && (
                <Link to="/admin/auth" className="text-sm font-medium tracking-[0.15em] uppercase text-foreground/70 hover:text-foreground py-1" onClick={() => setMobileOpen(false)}>
                  Admin Login
                </Link>
              )}
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Navbar;
