import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import menImg from "@/assets/men-collection-hq.jpg";
import womenImg from "@/assets/women-collection-hq.jpg";

const categories = [
  {
    title: "MEN COLLECTION",
    subtitle: "COLLECTION",
    label: "Men",
    image: menImg,
    link: "/category/men",
  },
  {
    title: "WOMEN COLLECTION",
    subtitle: "COLLECTION",
    label: "Women",
    image: womenImg,
    link: "/category/women",
  },
];

const CategorySection = () => {
  return (
    <section className="py-2">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        {categories.map((cat, i) => (
          <motion.div
            key={cat.title}
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.15, duration: 0.6 }}
          >
            <Link to={cat.link} className="group block relative aspect-[4/5] overflow-hidden">
              <img
                src={cat.image}
                alt={cat.title}
                className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-black/10 group-hover:bg-black/20 transition-colors duration-500 flex flex-col items-start justify-end p-8 md:p-12">
                <span className="text-[10px] md:text-xs font-medium tracking-[0.3em] uppercase text-white/80 mb-1">
                  {cat.subtitle}
                </span>
                <h3 className="text-3xl md:text-4xl font-bold tracking-tight text-white">
                  {cat.label}
                </h3>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </section>
  );
};

export default CategorySection;
