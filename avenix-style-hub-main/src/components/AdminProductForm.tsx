import { useState, useRef } from "react";
import { X, Upload, Loader2, Plus, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import OptimizedImageUpload from "@/components/OptimizedImageUpload";
import type { Product } from "@/hooks/useProducts";
import type { UploadResult } from "@/lib/storage";

interface Props {
  product: Product | null;
  onClose: () => void;
}

const PRESET_COLORS = [
  { name: "Black", hex: "#000000" },
  { name: "White", hex: "#FFFFFF" },
  { name: "Red", hex: "#DC2626" },
  { name: "Blue", hex: "#2563EB" },
  { name: "Green", hex: "#16A34A" },
  { name: "Yellow", hex: "#EAB308" },
  { name: "Pink", hex: "#EC4899" },
  { name: "Purple", hex: "#9333EA" },
  { name: "Orange", hex: "#EA580C" },
  { name: "Gray", hex: "#6B7280" },
  { name: "Navy", hex: "#1E3A5F" },
  { name: "Beige", hex: "#D4C5A9" },
  { name: "Brown", hex: "#78350F" },
  { name: "Maroon", hex: "#7F1D1D" },
];

const ALL_SIZES = ["XS", "S", "M", "L", "XL", "XXL", "28", "30", "32", "34", "36", "38", "40", "42"];

const AdminProductForm = ({ product, onClose }: Props) => {
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState(product?.name || "");
  const [price, setPrice] = useState(product?.price?.toString() || "");
  const [originalPrice, setOriginalPrice] = useState(product?.originalPrice?.toString() || "");
  const [image, setImage] = useState(product?.image || "");
  const [imagePath, setImagePath] = useState<string | null>(null);
  const [description, setDescription] = useState(product?.description || "");
  const [category, setCategory] = useState(product?.category || "men");
  const [tag, setTag] = useState(product?.tag || "");
  const [stockQuantity, setStockQuantity] = useState(product?.stockQuantity?.toString() || "0");
  const [inStock, setInStock] = useState(product?.inStock ?? true);
  const [selectedSizes, setSelectedSizes] = useState<string[]>(product?.sizes || ["S", "M", "L", "XL"]);
  const [selectedColors, setSelectedColors] = useState<{ name: string; hex: string }[]>(
    product?.colors?.length ? product.colors : [{ name: "Black", hex: "#000000" }]
  );

  const toggleSize = (size: string) => {
    setSelectedSizes((prev) =>
      prev.includes(size) ? prev.filter((s) => s !== size) : [...prev, size]
    );
  };

  const toggleColor = (color: { name: string; hex: string }) => {
    setSelectedColors((prev) =>
      prev.some((c) => c.hex === color.hex)
        ? prev.filter((c) => c.hex !== color.hex)
        : [...prev, color]
    );
  };

  const handleImageUploaded = (result: UploadResult) => {
    setImage(result.url);
    setImagePath(result.path);
  };

  const handleImageRemoved = () => {
    setImage("");
    setImagePath(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !price || !image) {
      toast.error("Please fill in name, price, and image");
      return;
    }
    if (selectedColors.length === 0) {
      toast.error("Please select at least one color");
      return;
    }
    if (selectedSizes.length === 0) {
      toast.error("Please select at least one size");
      return;
    }

    setLoading(true);

    const payload = {
      name,
      price: parseFloat(price),
      original_price: originalPrice ? parseFloat(originalPrice) : null,
      image,
      images: [image],
      description,
      sizes: selectedSizes,
      colors: selectedColors as any,
      category,
      tag: tag || null,
      stock_quantity: parseInt(stockQuantity),
      in_stock: inStock,
    };

    try {
      if (product) {
        const { error } = await supabase.from("products").update(payload).eq("id", product.id);
        if (error) throw error;
        toast.success("Product updated");
      } else {
        const { error } = await supabase.from("products").insert(payload);
        if (error) throw error;
        toast.success("Product added");
      }
      queryClient.invalidateQueries({ queryKey: ["products"] });
      onClose();
    } catch (err: any) {
      toast.error(err.message || "Failed to save");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl">
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-display text-xl font-bold">{product ? "Edit Product" : "Add Product"}</h2>
        <button onClick={onClose} className="p-2 hover:bg-secondary rounded-sm">
          <X size={20} />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Image Upload - Optimized */}
        <div>
          <Label className="text-xs uppercase tracking-wider mb-3 block">Product Image *</Label>
          <OptimizedImageUpload
            onImageUploaded={handleImageUploaded}
            onImageRemoved={handleImageRemoved}
            currentImageUrl={image}
            currentImagePath={imagePath}
            maxSizeMB={2}
            acceptedFormats={['jpg', 'jpeg', 'png', 'webp']}
          />
        </div>

        {/* Basic Info */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Label className="text-xs uppercase tracking-wider">Product Name *</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} required className="mt-1" placeholder="e.g. Classic White Shirt" />
          </div>
          <div>
            <Label className="text-xs uppercase tracking-wider">Category *</Label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as "men" | "women")}
              className="w-full mt-1 border border-border rounded-sm px-3 py-2 text-sm bg-background"
            >
              <option value="men">Men</option>
              <option value="women">Women</option>
            </select>
          </div>
          <div>
            <Label className="text-xs uppercase tracking-wider">Selling Price (₹) *</Label>
            <Input type="number" step="0.01" value={price} onChange={(e) => setPrice(e.target.value)} required className="mt-1" placeholder="999" />
          </div>
          <div>
            <Label className="text-xs uppercase tracking-wider">Original Price (₹)</Label>
            <Input type="number" step="0.01" value={originalPrice} onChange={(e) => setOriginalPrice(e.target.value)} className="mt-1" placeholder="1499 (optional, for discount)" />
          </div>
          <div>
            <Label className="text-xs uppercase tracking-wider">Stock Quantity</Label>
            <Input type="number" value={stockQuantity} onChange={(e) => setStockQuantity(e.target.value)} className="mt-1" placeholder="10" />
          </div>
          <div>
            <Label className="text-xs uppercase tracking-wider">Tag</Label>
            <select
              value={tag}
              onChange={(e) => setTag(e.target.value)}
              className="w-full mt-1 border border-border rounded-sm px-3 py-2 text-sm bg-background"
            >
              <option value="">None</option>
              <option value="trending">Trending</option>
              <option value="new">New Arrival</option>
              <option value="bestseller">Best Seller</option>
            </select>
          </div>
        </div>

        {/* Description */}
        <div>
          <Label className="text-xs uppercase tracking-wider">Description</Label>
          <Textarea value={description} onChange={(e) => setDescription(e.target.value)} className="mt-1" rows={3} placeholder="Describe the product..." />
        </div>

        {/* Sizes - Click to select */}
        <div>
          <Label className="text-xs uppercase tracking-wider mb-2 block">Sizes (click to select)</Label>
          <div className="flex flex-wrap gap-2">
            {ALL_SIZES.map((size) => (
              <button
                key={size}
                type="button"
                onClick={() => toggleSize(size)}
                className={`px-3 py-1.5 text-xs font-medium border rounded-sm transition-colors ${
                  selectedSizes.includes(size)
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-background text-muted-foreground border-border hover:border-foreground"
                }`}
              >
                {size}
              </button>
            ))}
          </div>
        </div>

        {/* Colors - Click to select */}
        <div>
          <Label className="text-xs uppercase tracking-wider mb-2 block">Colors (click to select)</Label>
          <div className="flex flex-wrap gap-2">
            {PRESET_COLORS.map((color) => (
              <button
                key={color.hex}
                type="button"
                onClick={() => toggleColor(color)}
                className={`flex items-center gap-2 px-3 py-1.5 text-xs font-medium border rounded-sm transition-colors ${
                  selectedColors.some((c) => c.hex === color.hex)
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-background text-muted-foreground border-border hover:border-foreground"
                }`}
              >
                <span
                  className="w-3 h-3 rounded-full border border-border"
                  style={{ backgroundColor: color.hex }}
                />
                {color.name}
              </button>
            ))}
          </div>
        </div>

        {/* In Stock Toggle */}
        <label className="flex items-center gap-3 cursor-pointer">
          <div
            className={`w-10 h-5 rounded-full transition-colors relative ${inStock ? "bg-primary" : "bg-muted"}`}
            onClick={() => setInStock(!inStock)}
          >
            <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${inStock ? "translate-x-5" : "translate-x-0.5"}`} />
          </div>
          <span className="text-sm font-medium">{inStock ? "In Stock" : "Out of Stock"}</span>
        </label>

        {/* Submit */}
        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={loading}
            className="bg-primary text-primary-foreground px-8 py-3 text-xs font-semibold tracking-[0.15em] uppercase hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            {loading ? "Saving..." : product ? "Update Product" : "Add Product"}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="px-8 py-3 text-xs font-semibold tracking-[0.15em] uppercase border border-border hover:bg-secondary transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default AdminProductForm;
