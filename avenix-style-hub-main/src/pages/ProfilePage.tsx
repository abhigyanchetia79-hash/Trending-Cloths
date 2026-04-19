import { User, Package, LogOut, Shield } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useAuth } from "@/context/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

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

  const { data: orders } = useQuery({
    queryKey: ["my-orders", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("orders")
        .select("*, order_items(*, products(name, image))")
        .eq("user_id", user!.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!user,
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
      <main className="flex-1 container mx-auto px-4 py-8 md:py-16 max-w-2xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
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

          <div>
            <h2 className="font-display text-lg font-bold text-foreground mb-4 flex items-center gap-2">
              <Package size={20} /> Order History
            </h2>
            {!orders || orders.length === 0 ? (
              <p className="text-sm text-muted-foreground">No orders yet. Start shopping!</p>
            ) : (
              <div className="space-y-4">
                {orders.map((order) => (
                  <div key={order.id} className="border border-border rounded-sm p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs text-muted-foreground font-mono">#{order.id.slice(0, 8)}</p>
                        <p className="text-sm font-medium">{new Date(order.created_at).toLocaleDateString()}</p>
                      </div>
                      <div className="text-right">
                        <span className={`px-2 py-0.5 text-xs rounded-full font-medium ${
                          order.order_status === "delivered" ? "bg-green-100 text-green-700" :
                          order.order_status === "shipped" ? "bg-blue-100 text-blue-700" :
                          order.order_status === "cancelled" ? "bg-red-100 text-red-700" :
                          "bg-yellow-100 text-yellow-700"
                        }`}>
                          {order.order_status}
                        </span>
                        <p className="text-sm font-bold mt-1">₹{Number(order.total_price).toFixed(2)}</p>
                      </div>
                    </div>
                    <div className="flex gap-2 overflow-x-auto">
                      {(order.order_items as any[])?.map((item: any) => (
                        <div key={item.id} className="flex-shrink-0 flex items-center gap-2 bg-secondary/30 rounded-sm p-2">
                          <img src={item.products?.image} alt="" className="w-8 h-10 object-cover rounded-sm" />
                          <div>
                            <p className="text-xs font-medium truncate max-w-[120px]">{item.products?.name}</p>
                            <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
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
