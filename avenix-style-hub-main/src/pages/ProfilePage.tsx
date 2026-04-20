import { User, Package, LogOut, Shield, CheckCircle2, Circle, XCircle, ChevronDown, ChevronUp } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useAuth } from "@/context/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useState } from "react";

const TRACKING_STEPS = [
  { key: "pending",           label: "Order Placed",      desc: "Your order has been placed" },
  { key: "confirmed",         label: "Confirmed",          desc: "Seller confirmed your order" },
  { key: "packed",            label: "Packed",             desc: "Your order is packed and ready" },
  { key: "shipped",           label: "Shipped",            desc: "Order is on its way" },
  { key: "out_for_delivery",  label: "Out for Delivery",   desc: "Almost there!" },
  { key: "delivered",         label: "Delivered",          desc: "Order successfully delivered" },
];

const getStepIndex = (status: string) =>
  TRACKING_STEPS.findIndex((s) => s.key === status);

const OrderTracker = ({ order }: { order: any }) => {
  const [expanded, setExpanded] = useState(false);
  const isCancelled = order.order_status === "cancelled";
  const currentStep = isCancelled ? -1 : getStepIndex(order.order_status);
  const activeIdx = currentStep === -1 ? 0 : currentStep;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="border border-border rounded-lg overflow-hidden"
    >
      {/* Order Header */}
      <div className="p-4 bg-secondary/20">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <p className="text-xs text-muted-foreground font-mono mb-0.5">Order #{order.id.slice(0, 12).toUpperCase()}</p>
            <p className="text-xs text-muted-foreground">{new Date(order.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}</p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <div className="text-right">
              <p className="text-sm font-bold text-foreground">₹{Number(order.total_price).toFixed(2)}</p>
              <p className="text-xs text-muted-foreground capitalize">{order.payment_method || "N/A"}</p>
            </div>
            <button
              onClick={() => setExpanded(!expanded)}
              className="p-1.5 rounded-sm hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground"
            >
              {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>
          </div>
        </div>

        {/* Product thumbnails */}
        <div className="flex gap-2 mt-3 overflow-x-auto">
          {(order.order_items as any[])?.map((item: any) => (
            <div key={item.id} className="flex-shrink-0 flex items-center gap-2 bg-background rounded-sm p-2 border border-border/50">
              <img src={item.products?.image} alt="" className="w-8 h-10 object-cover rounded-sm" />
              <div>
                <p className="text-xs font-medium truncate max-w-[110px]">{item.products?.name}</p>
                <p className="text-xs text-muted-foreground">Qty: {item.quantity} · {item.size}</p>
                <p className="text-xs font-semibold">₹{Number(item.price).toFixed(2)}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Status Badge */}
      <div className="px-4 py-2 border-t border-border flex items-center justify-between">
        <div className="flex items-center gap-2">
          {isCancelled ? (
            <span className="flex items-center gap-1.5 text-xs font-semibold text-red-600 bg-red-50 px-2.5 py-1 rounded-full">
              <XCircle size={12} /> Order Cancelled
            </span>
          ) : (
            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
              order.order_status === "delivered"
                ? "bg-green-100 text-green-700"
                : order.order_status === "shipped" || order.order_status === "out_for_delivery"
                ? "bg-blue-100 text-blue-700"
                : "bg-yellow-100 text-yellow-700"
            }`}>
              {TRACKING_STEPS[activeIdx]?.label || order.order_status}
            </span>
          )}
        </div>
        <button
          onClick={() => setExpanded(!expanded)}
          className="text-xs text-primary font-medium hover:underline"
        >
          {expanded ? "Hide tracking" : "Track order"}
        </button>
      </div>

      {/* Tracking Steps */}
      <AnimatePresence>
        {expanded && !isCancelled && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden border-t border-border"
          >
            <div className="p-4">
              {/* Desktop: horizontal stepper */}
              <div className="hidden sm:flex items-start justify-between relative">
                {/* connecting line */}
                <div className="absolute top-4 left-0 right-0 h-0.5 bg-border z-0" />
                <div
                  className="absolute top-4 left-0 h-0.5 bg-primary z-0 transition-all duration-500"
                  style={{ width: `${(activeIdx / (TRACKING_STEPS.length - 1)) * 100}%` }}
                />
                {TRACKING_STEPS.map((step, i) => {
                  const done = i < activeIdx;
                  const active = i === activeIdx;
                  return (
                    <div key={step.key} className="relative z-10 flex flex-col items-center gap-1.5 flex-1">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all ${
                        done ? "bg-primary border-primary text-primary-foreground"
                        : active ? "bg-background border-primary text-primary shadow-md shadow-primary/20"
                        : "bg-background border-border text-muted-foreground"
                      }`}>
                        {done ? <CheckCircle2 size={16} /> : <Circle size={16} />}
                      </div>
                      <div className="text-center">
                        <p className={`text-[10px] font-semibold ${active || done ? "text-foreground" : "text-muted-foreground"}`}>
                          {step.label}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Mobile: vertical stepper */}
              <div className="sm:hidden space-y-0">
                {TRACKING_STEPS.map((step, i) => {
                  const done = i < activeIdx;
                  const active = i === activeIdx;
                  const isLast = i === TRACKING_STEPS.length - 1;
                  return (
                    <div key={step.key} className="flex gap-3">
                      <div className="flex flex-col items-center">
                        <div className={`w-7 h-7 rounded-full flex items-center justify-center border-2 shrink-0 ${
                          done ? "bg-primary border-primary text-primary-foreground"
                          : active ? "bg-background border-primary text-primary"
                          : "bg-background border-border text-muted-foreground"
                        }`}>
                          {done ? <CheckCircle2 size={13} /> : <Circle size={13} />}
                        </div>
                        {!isLast && <div className={`w-0.5 h-6 ${done ? "bg-primary" : "bg-border"}`} />}
                      </div>
                      <div className="pb-4">
                        <p className={`text-xs font-semibold ${active || done ? "text-foreground" : "text-muted-foreground"}`}>
                          {step.label}
                        </p>
                        {(active || done) && (
                          <p className="text-[11px] text-muted-foreground">{step.desc}</p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {order.order_status === "delivered" && (
                <div className="mt-4 p-3 bg-green-50 rounded-md flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-green-600" />
                  <p className="text-xs text-green-700 font-medium">Your order has been delivered successfully!</p>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {expanded && isCancelled && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden border-t border-border"
          >
            <div className="p-4 bg-red-50">
              <div className="flex items-center gap-2">
                <XCircle size={16} className="text-red-600" />
                <p className="text-sm text-red-700 font-medium">This order was cancelled.</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

const ProfilePage = () => {
  const { user, isAdmin, signOut } = useAuth();
  const navigate = useNavigate();

  const { data: profile } = useQuery({
    queryKey: ["profile", user?.id],
    queryFn: async () => {
      const { data } = await supabase.from("profiles").select("*").eq("user_id", user!.id).maybeSingle();
      return data;
    },
    enabled: !!user,
  });

  const { data: orders, isLoading: ordersLoading } = useQuery({
    queryKey: ["my-orders", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("orders")
        .select("*, order_items(*, products(name, image, price))")
        .eq("user_id", user!.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!user,
    refetchInterval: 30000,
  });

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 container mx-auto px-4 py-8 md:py-16 max-w-md">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center space-y-6">
            <div className="w-20 h-20 rounded-full bg-secondary flex items-center justify-center mx-auto">
              <User size={32} className="text-muted-foreground" />
            </div>
            <div>
              <h1 className="font-display text-2xl font-bold text-foreground">Welcome</h1>
              <p className="text-sm text-muted-foreground mt-1">Sign in to view your orders and manage your account</p>
            </div>
            <Link
              to="/auth"
              className="block w-full text-center bg-primary text-primary-foreground py-3 text-sm font-medium tracking-wider uppercase hover:bg-brand-hover transition-colors"
            >
              Sign In / Create Account
            </Link>
          </motion.div>
        </main>
        <Footer />
      </div>
    );
  }

  const handleSignOut = async () => {
    await signOut();
    toast.success("Signed out");
    navigate("/");
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-8 md:py-16 max-w-3xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
          {/* Profile Header */}
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center">
              <User size={28} className="text-muted-foreground" />
            </div>
            <div>
              <h1 className="font-display text-xl font-bold text-foreground">{profile?.name || user.email}</h1>
              <p className="text-sm text-muted-foreground">{user.email}</p>
            </div>
          </div>

          <div className="flex gap-3">
            {isAdmin && (
              <Link to="/admin" className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2.5 text-sm font-medium tracking-wider uppercase">
                <Shield size={16} /> Admin Panel
              </Link>
            )}
            <button
              onClick={handleSignOut}
              className="flex items-center gap-2 border border-border text-foreground px-4 py-2.5 text-sm font-medium tracking-wider uppercase hover:bg-secondary transition-colors"
            >
              <LogOut size={16} /> Sign Out
            </button>
          </div>

          {/* Order History */}
          <div>
            <h2 className="font-display text-lg font-bold text-foreground mb-5 flex items-center gap-2">
              <Package size={20} /> My Orders
              {orders && orders.length > 0 && (
                <span className="text-sm font-normal text-muted-foreground">({orders.length} orders)</span>
              )}
            </h2>

            {ordersLoading ? (
              <div className="space-y-4">
                {[1, 2].map((i) => (
                  <div key={i} className="border border-border rounded-lg p-4 animate-pulse">
                    <div className="h-4 bg-secondary rounded w-32 mb-2" />
                    <div className="h-3 bg-secondary rounded w-24" />
                  </div>
                ))}
              </div>
            ) : !orders || orders.length === 0 ? (
              <div className="text-center py-12 border border-dashed border-border rounded-lg">
                <Package size={40} className="mx-auto text-muted-foreground/40 mb-3" />
                <p className="text-sm font-medium text-foreground">No orders yet</p>
                <p className="text-xs text-muted-foreground mt-1">Your orders will appear here once you shop</p>
                <Link to="/" className="inline-block mt-4 bg-primary text-primary-foreground px-5 py-2 text-xs font-medium tracking-wider uppercase hover:bg-primary/90 transition-colors">
                  Start Shopping
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {orders.map((order) => (
                  <OrderTracker key={order.id} order={order} />
                ))}
              </div>
            )}
          </div>
        </motion.div>
      </main>
      <Footer />
    </div>
  );
};

export default ProfilePage;
