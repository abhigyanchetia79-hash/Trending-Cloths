import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Search, ShoppingBag, Heart, User, Menu, X, Shield } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { useSocialSettings } from "@/hooks/useSocialSettings";
import { motion, AnimatePresence } from "framer-motion";
import logo from "@/assets/logo.png";

const WhatsAppIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
  </svg>
);

const navLinks = [
  { label: "Home", path: "/" },
  { label: "Men", path: "/category/men" },
  { label: "Women", path: "/category/women" },
];

const Navbar = () => {
  const { totalItems } = useCart();
  const { user, isAdmin, showAdminLogin } = useAuth();
  const { getWhatsAppUrl } = useSocialSettings();
  const navigate = useNavigate();
  const whatsappUrl = getWhatsAppUrl();
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
          {whatsappUrl && (
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 text-green-600 hover:text-green-700 transition-colors hidden md:block"
              title="Customer Service"
            >
              <WhatsAppIcon />
            </a>
          )}
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
          {isAdmin ? (
            <Link to="/admin" className="p-2 text-foreground/60 hover:text-foreground transition-colors hidden md:block" title="Admin Dashboard">
              <Shield size={20} />
            </Link>
          ) : (
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
              {whatsappUrl && (
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm font-medium tracking-[0.15em] uppercase text-green-600 hover:text-green-700 py-1"
                  onClick={() => setMobileOpen(false)}
                >
                  <WhatsAppIcon /> Customer Service
                </a>
              )}
              {isAdmin ? (
                <Link to="/admin" className="text-sm font-medium tracking-[0.15em] uppercase text-foreground/70 hover:text-foreground py-1" onClick={() => setMobileOpen(false)}>
                  Admin
                </Link>
              ) : (
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
