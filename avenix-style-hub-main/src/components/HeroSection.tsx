import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import heroBanner from "@/assets/hero-banner.jpg";

const HeroSection = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoFailed, setVideoFailed] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const tryPlay = () => {
      video.muted = true;
      video.play().catch(() => {
        // Retry once after a short delay
        setTimeout(() => {
          video.play().catch(() => setVideoFailed(true));
        }, 500);
      });
    };

    // Force play as soon as enough data is buffered
    video.addEventListener("canplay", tryPlay);

    // Also try immediately in case already buffered
    tryPlay();

    return () => {
      video.removeEventListener("canplay", tryPlay);
    };
  }, []);

  const scrollToProducts = () => {
    const el = document.getElementById("products-section");
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section className="relative w-full h-[90vh] flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0">
        {/* Fallback image — only shown if video completely fails */}
        <img
          src={heroBanner}
          alt="Premium fashion"
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${
            videoFailed ? "opacity-100" : "opacity-0"
          }`}
        />

        {/* Hero video — always rendered, always attempted */}
        {!videoFailed && (
          <video
            ref={videoRef}
            className="absolute inset-0 w-full h-full object-cover"
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
            poster={heroBanner}
            onError={() => setVideoFailed(true)}
          >
            <source src="/video/hero.mp4" type="video/mp4" />
          </video>
        )}

        <div className="absolute inset-0 bg-black/40" />
      </div>

      <div className="relative z-10 text-center px-6 max-w-2xl mx-auto">
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-light tracking-[0.05em] text-white leading-[1.1] mb-4"
        >
          Welcome to
          <br />
          <span className="font-semibold">Trending Cloths</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.5 }}
          className="text-sm md:text-base tracking-[0.2em] uppercase text-white/80 mb-10"
        >
          Discover Your Style. Wear the Trend.
        </motion.p>

        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          onClick={scrollToProducts}
          className="bg-white text-black px-10 py-4 text-xs font-medium tracking-[0.25em] uppercase hover:bg-black hover:text-white transition-all duration-500"
        >
          Shop Now
        </motion.button>
      </div>
    </section>
  );
};

export default HeroSection;
