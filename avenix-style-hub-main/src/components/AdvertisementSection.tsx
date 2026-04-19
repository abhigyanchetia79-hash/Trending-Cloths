import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

type Advertisement = Tables<"advertisements">;

const AdvertisementSection = () => {
  const { data: advertisement, isLoading } = useQuery({
    queryKey: ["active-advertisement"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("advertisements")
        .select("*")
        .eq("is_active", true)
        .order("created_at", { ascending: false })
        .limit(1)
        .single();
      if (error && error.code !== "PGRST116") throw error; // PGRST116 = no rows found
      return data as Advertisement | null;
    },
  });

  if (isLoading || !advertisement) return null;

  return (
    <section className="py-16 px-6 bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="container mx-auto max-w-5xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="relative rounded-2xl overflow-hidden shadow-lg group"
        >
          {/* Video/Image Background */}
          <div className="relative w-full h-64 md:h-80 bg-black/20">
            {advertisement.video_url && (
              <video
                className="w-full h-full object-cover"
                autoPlay
                muted
                loop
                playsInline
                poster={advertisement.image_url || undefined}
              >
                <source src={advertisement.video_url} type="video/mp4" />
              </video>
            )}
            {!advertisement.video_url && advertisement.image_url && (
              <img
                src={advertisement.image_url}
                alt={advertisement.title || "Advertisement"}
                className="w-full h-full object-cover"
              />
            )}

            {/* Overlay Gradient */}
            <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/40 to-transparent" />
          </div>

          {/* Content Overlay */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              {advertisement.title && (
                <h3 className="text-3xl md:text-4xl font-light text-white mb-3 tracking-wide">
                  {advertisement.title}
                </h3>
              )}
              {advertisement.description && (
                <p className="text-lg text-gray-100 font-light tracking-[0.15em] uppercase">
                  {advertisement.description}
                </p>
              )}
            </motion.div>
          </div>

          {/* Hover Effect */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.3 }}
            className="cursor-pointer"
          />
        </motion.div>
      </div>
    </section>
  );
};

export default AdvertisementSection;
