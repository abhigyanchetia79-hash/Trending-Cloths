import { useState, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import { useProducts } from "@/hooks/useProducts";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger,
} from "@/components/ui/sheet";

const ALL_SIZES = ["XS", "S", "M", "L", "XL", "XXL"];
const MAX_PRICE = 300;

const SearchPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialQuery = searchParams.get("q") || "";
  const { data: products, isLoading } = useProducts();

  const [query, setQuery] = useState(initialQuery);
  const [categories, setCategories] = useState<string[]>([]);
  const [sizes, setSizes] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, MAX_PRICE]);
  const [inStockOnly, setInStockOnly] = useState(false);

  const toggleCategory = (cat: string) => setCategories((prev) => prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]);
  const toggleSize = (size: string) => setSizes((prev) => prev.includes(size) ? prev.filter((s) => s !== size) : [...prev, size]);
  const clearFilters = () => { setCategories([]); setSizes([]); setPriceRange([0, MAX_PRICE]); setInStockOnly(false); };

  const filtered = useMemo(() => {
    return (products || []).filter((p) => {
      if (query && !p.name.toLowerCase().includes(query.toLowerCase()) && !p.description.toLowerCase().includes(query.toLowerCase())) return false;
      if (categories.length > 0 && !categories.includes(p.category)) return false;
      if (sizes.length > 0 && !p.sizes.some((s) => sizes.includes(s))) return false;
      if (p.price < priceRange[0] || p.price > priceRange[1]) return false;
      if (inStockOnly && !p.inStock) return false;
      return true;
    });
  }, [products, query, categories, sizes, priceRange, inStockOnly]);

  const activeFilterCount = categories.length + sizes.length + (inStockOnly ? 1 : 0) + (priceRange[0] > 0 || priceRange[1] < MAX_PRICE ? 1 : 0);

  const FilterPanel = () => (
    <div className="space-y-8">
      <div>
        <h3 className="font-display text-sm font-semibold text-foreground uppercase tracking-wider mb-4">Category</h3>
        <div className="space-y-3">
          {["men", "women"].map((cat) => (
            <label key={cat} className="flex items-center gap-3 cursor-pointer group">
              <Checkbox checked={categories.includes(cat)} onCheckedChange={() => toggleCategory(cat)} />
              <span className="text-sm text-foreground/80 capitalize group-hover:text-primary transition-colors">{cat}</span>
            </label>
          ))}
        </div>
      </div>
      <div>
        <h3 className="font-display text-sm font-semibold text-foreground uppercase tracking-wider mb-4">Price Range</h3>
        <Slider min={0} max={MAX_PRICE} step={10} value={priceRange} onValueChange={(v) => setPriceRange(v as [number, number])} className="mb-3" />
        <div className="flex items-center justify-between text-xs text-muted-foreground"><span>₹{priceRange[0]}</span><span>₹{priceRange[1]}</span></div>
      </div>
      <div>
        <h3 className="font-display text-sm font-semibold text-foreground uppercase tracking-wider mb-4">Size</h3>
        <div className="flex flex-wrap gap-2">
          {ALL_SIZES.map((size) => (
            <button key={size} onClick={() => toggleSize(size)} className={`px-3 py-1.5 text-xs font-medium border rounded-sm transition-colors ${sizes.includes(size) ? "bg-primary text-primary-foreground border-primary" : "border-border text-foreground/70 hover:border-primary hover:text-primary"}`}>
              {size}
            </button>
          ))}
        </div>
      </div>
      <label className="flex items-center gap-3 cursor-pointer group">
        <Checkbox checked={inStockOnly} onCheckedChange={(v) => setInStockOnly(!!v)} />
        <span className="text-sm text-foreground/80 group-hover:text-primary transition-colors">In Stock Only</span>
      </label>
      {activeFilterCount > 0 && (
        <button onClick={clearFilters} className="text-xs text-primary underline underline-offset-4">Clear all filters</button>
      )}
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-8 md:py-12">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="relative max-w-2xl mx-auto">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
            <Input
              value={query}
              onChange={(e) => { setQuery(e.target.value); setSearchParams(e.target.value ? { q: e.target.value } : {}); }}
              placeholder="Search for products..."
              className="pl-12 pr-10 h-12 text-base border-border bg-secondary/30 focus-visible:ring-primary"
              autoFocus
            />
            {query && (
              <button onClick={() => { setQuery(""); setSearchParams({}); }} className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                <X size={16} />
              </button>
            )}
          </div>
        </motion.div>

        <div className="flex gap-8">
          <aside className="hidden lg:block w-64 shrink-0"><FilterPanel /></aside>
          <div className="flex-1">
            <div className="flex items-center justify-between mb-6">
              <p className="text-sm text-muted-foreground">{filtered.length} {filtered.length === 1 ? "product" : "products"} found</p>
              <Sheet>
                <SheetTrigger asChild>
                  <button className="lg:hidden flex items-center gap-2 text-sm font-medium text-foreground hover:text-primary transition-colors">
                    <SlidersHorizontal size={16} /> Filters
                    {activeFilterCount > 0 && <span className="w-5 h-5 rounded-full bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center">{activeFilterCount}</span>}
                  </button>
                </SheetTrigger>
                <SheetContent side="left" className="w-80">
                  <SheetHeader><SheetTitle className="font-display">Filters</SheetTitle></SheetHeader>
                  <div className="mt-6"><FilterPanel /></div>
                </SheetContent>
              </Sheet>
            </div>

            {isLoading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="space-y-3"><Skeleton className="aspect-[3/4] w-full" /><Skeleton className="h-4 w-3/4" /></div>
                ))}
              </div>
            ) : filtered.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
                {filtered.map((product, i) => <ProductCard key={product.id} product={product} index={i} />)}
              </div>
            ) : (
              <div className="text-center py-20">
                <p className="text-lg font-display text-foreground/60">No products found</p>
                <p className="text-sm text-muted-foreground mt-2">Try adjusting your filters or search term</p>
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default SearchPage;
