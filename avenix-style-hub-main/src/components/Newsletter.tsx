import { useState } from "react";
import { toast } from "sonner";

const Newsletter = () => {
  const [email, setEmail] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    toast.success("Thanks for subscribing!");
    setEmail("");
  };

  return (
    <section className="border-t border-border bg-secondary/30">
      <div className="container mx-auto px-6 py-16 md:py-20 text-center">
        <h2 className="font-display text-2xl md:text-3xl font-bold tracking-tight text-foreground mb-3">
          Stay in the Loop
        </h2>
        <p className="text-sm text-muted-foreground mb-8 max-w-md mx-auto">
          Sign up for our newsletter and be the first to know about new arrivals, exclusive offers and style inspiration.
        </p>
        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email address"
            required
            className="flex-1 border border-border bg-background px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
          />
          <button
            type="submit"
            className="bg-primary text-primary-foreground px-8 py-3 text-xs font-semibold tracking-[0.15em] uppercase hover:bg-primary/90 transition-colors"
          >
            Subscribe
          </button>
        </form>
      </div>
    </section>
  );
};

export default Newsletter;
