export interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  images: string[];
  category: "men" | "women";
  tag?: "trending" | "new" | "bestseller";
  rating: number;
  reviews: number;
  description: string;
  sizes: string[];
  colors: { name: string; hex: string }[];
  inStock: boolean;
  stockQuantity: number;
}

export interface CartItem {
  product: Product;
  quantity: number;
  size: string;
  color: string;
}

export const products: Product[] = [
  {
    id: "1",
    name: "Tailored Linen Blazer",
    price: 129.99,
    originalPrice: 179.99,
    image: "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=600&q=80",
    images: [
      "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=800&q=80",
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&q=80",
      "https://images.unsplash.com/photo-1617137968427-85924c800a22?w=800&q=80",
    ],
    category: "men",
    tag: "trending",
    rating: 4.8,
    reviews: 124,
    description: "A refined linen blazer crafted for the modern gentleman. Lightweight, breathable, and impeccably tailored for both casual and formal occasions.",
    sizes: ["S", "M", "L", "XL"],
    colors: [
      { name: "Navy", hex: "#0A3D91" },
      { name: "Beige", hex: "#D4C5A9" },
      { name: "Charcoal", hex: "#36454F" },
    ],
    inStock: true,
    stockQuantity: 45,
  },
  {
    id: "2",
    name: "Silk Midi Dress",
    price: 189.99,
    image: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=600&q=80",
    images: [
      "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800&q=80",
      "https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=800&q=80",
    ],
    category: "women",
    tag: "new",
    rating: 4.9,
    reviews: 89,
    description: "An elegant silk midi dress that flows beautifully. Perfect for evening events or a sophisticated day out.",
    sizes: ["XS", "S", "M", "L"],
    colors: [
      { name: "Ivory", hex: "#FFFFF0" },
      { name: "Blush", hex: "#DE5D83" },
      { name: "Black", hex: "#000000" },
    ],
    inStock: true,
    stockQuantity: 30,
  },
  {
    id: "3",
    name: "Premium Cotton Tee",
    price: 49.99,
    image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600&q=80",
    images: [
      "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&q=80",
      "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=800&q=80",
    ],
    category: "men",
    tag: "bestseller",
    rating: 4.7,
    reviews: 312,
    description: "Ultra-soft premium cotton t-shirt with a relaxed fit. A wardrobe essential redefined with superior fabric and craftsmanship.",
    sizes: ["S", "M", "L", "XL", "XXL"],
    colors: [
      { name: "White", hex: "#FFFFFF" },
      { name: "Black", hex: "#000000" },
      { name: "Navy", hex: "#0A3D91" },
    ],
    inStock: true,
    stockQuantity: 200,
  },
  {
    id: "4",
    name: "High-Waist Wide Trousers",
    price: 99.99,
    originalPrice: 139.99,
    image: "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=600&q=80",
    images: [
      "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=800&q=80",
    ],
    category: "women",
    tag: "trending",
    rating: 4.6,
    reviews: 156,
    description: "Effortlessly chic high-waist wide-leg trousers. Designed for comfort without compromising on style.",
    sizes: ["XS", "S", "M", "L", "XL"],
    colors: [
      { name: "Camel", hex: "#C19A6B" },
      { name: "Black", hex: "#000000" },
    ],
    inStock: true,
    stockQuantity: 67,
  },
  {
    id: "5",
    name: "Cashmere V-Neck Sweater",
    price: 159.99,
    image: "https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=600&q=80",
    images: [
      "https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=800&q=80",
    ],
    category: "men",
    tag: "new",
    rating: 4.9,
    reviews: 78,
    description: "Luxurious cashmere sweater with a classic V-neck. Incredibly soft and warm for the cooler months.",
    sizes: ["S", "M", "L", "XL"],
    colors: [
      { name: "Grey", hex: "#808080" },
      { name: "Navy", hex: "#0A3D91" },
      { name: "Burgundy", hex: "#800020" },
    ],
    inStock: true,
    stockQuantity: 35,
  },
  {
    id: "6",
    name: "Structured Leather Bag",
    price: 249.99,
    image: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=600&q=80",
    images: [
      "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=800&q=80",
    ],
    category: "women",
    tag: "bestseller",
    rating: 4.8,
    reviews: 203,
    description: "A statement leather handbag with clean lines and impeccable structure. The perfect finishing touch to any outfit.",
    sizes: ["One Size"],
    colors: [
      { name: "Tan", hex: "#D2B48C" },
      { name: "Black", hex: "#000000" },
    ],
    inStock: true,
    stockQuantity: 22,
  },
  {
    id: "7",
    name: "Slim Fit Chinos",
    price: 79.99,
    image: "https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=600&q=80",
    images: [
      "https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=800&q=80",
    ],
    category: "men",
    tag: "bestseller",
    rating: 4.5,
    reviews: 267,
    description: "Classic slim-fit chinos in premium stretch cotton. Versatile enough for any occasion.",
    sizes: ["S", "M", "L", "XL"],
    colors: [
      { name: "Khaki", hex: "#C3B091" },
      { name: "Navy", hex: "#0A3D91" },
      { name: "Olive", hex: "#556B2F" },
    ],
    inStock: true,
    stockQuantity: 150,
  },
  {
    id: "8",
    name: "Flowing Maxi Skirt",
    price: 89.99,
    image: "https://images.unsplash.com/photo-1583496661160-fb5886a0uj6a?w=600&q=80",
    images: [
      "https://images.unsplash.com/photo-1583496661160-fb5886a0uj6a?w=800&q=80",
    ],
    category: "women",
    tag: "new",
    rating: 4.4,
    reviews: 92,
    description: "A dreamy flowing maxi skirt in lightweight fabric. Perfect for creating effortless summer looks.",
    sizes: ["XS", "S", "M", "L"],
    colors: [
      { name: "Sage", hex: "#9DC183" },
      { name: "White", hex: "#FFFFFF" },
    ],
    inStock: false,
    stockQuantity: 0,
  },
];

export const getProductsByTag = (tag: Product["tag"]) =>
  products.filter((p) => p.tag === tag);

export const getProductsByCategory = (category: Product["category"]) =>
  products.filter((p) => p.category === category);

export const getProductById = (id: string) =>
  products.find((p) => p.id === id);
