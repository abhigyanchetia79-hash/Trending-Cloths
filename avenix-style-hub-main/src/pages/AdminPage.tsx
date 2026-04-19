import { useState } from "react";
import { Navigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Package, ShoppingCart, BarChart3, Plus, Pencil, Trash2, Ban, Check, Settings, Eye, EyeOff, Users, MessageSquare } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useAuth } from "@/context/AuthContext";
import { useProducts, type Product } from "@/hooks/useProducts";
import { useAdminOrders, useUpdateOrderStatus } from "@/hooks/useOrders";
import { useAllAdvertisements } from "@/hooks/useAdvertisements";
import { addProduct, updateProduct, deleteProduct } from "@/lib/database";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import AdminProductForm from "@/components/AdminProductForm";
import AdminPaymentSettings from "@/components/AdminPaymentSettings";
import AdminAdvertisementManager from "@/components/AdminAdvertisementManager";
import AdminReviewManager from "@/components/AdminReviewManager";
import type { Tables } from "@/integrations/supabase/types";

type Order = Tables<"orders"> & { customer_name?: string };

const AdminPage = () => {
  const { user, isAdmin, loading: authLoading, showAdminLogin, setShowAdminLogin } = useAuth();
  const { data: products, isLoading: productsLoading } = useProducts();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<"dashboard" | "products" | "orders" | "users" | "reviews" | "settings">("dashboard");
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [savingVisibility, setSavingVisibility] = useState(false);
  const [deletingUserId, setDeletingUserId] = useState<string | null>(null);

  const { data: orders } = useAdminOrders();
  const updateOrderStatusMutation = useUpdateOrderStatus();

  const { data: users, isLoading: usersLoading } = useQuery({
    queryKey: ["admin-users"],
    queryFn: async () => {
      // Fetch profiles (publicly readable)
      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("user_id, name, email, created_at");
      if (profilesError) throw profilesError;

      // Get user roles
      const { data: roles, error: rolesError } = await supabase.from("user_roles").select("user_id, role");
      if (rolesError) throw rolesError;

      const roleMap = new Map(roles?.map((r) => [r.user_id, r.role]) || []);

      return (profiles || []).map((p) => ({
        id: p.user_id,
        email: (p as any).email || "N/A",
        name: p.name || "Unknown",
        role: roleMap.get(p.user_id) || "customer",
        createdAt: (p as any).created_at || new Date().toISOString(),
      }));
    },
    enabled: isAdmin,
  });

  if (authLoading) return null;
  if (!user || !isAdmin) return <Navigate to="/" replace />;

  const totalRevenue = orders?.reduce((sum, o) => sum + Number(o.total_price), 0) || 0;
  const totalOrders = orders?.length || 0;
  const totalProducts = products?.length || 0;

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this product?")) return;
    const { error } = await supabase.from("products").delete().eq("id", id);
    if (error) return toast.error("Failed to delete");
    toast.success("Product deleted");
    queryClient.invalidateQueries({ queryKey: ["products"] });
  };

  const toggleStock = async (id: string, currentlyInStock: boolean) => {
    const { error } = await supabase
      .from("products")
      .update({ in_stock: !currentlyInStock, stock_quantity: currentlyInStock ? 0 : 1 })
      .eq("id", id);
    if (error) return toast.error("Failed to update");
    toast.success(currentlyInStock ? "Marked out of stock" : "Marked in stock");
    queryClient.invalidateQueries({ queryKey: ["products"] });
  };

  const handleUpdateOrderStatus = async (orderId: string, status: string) => {
    try {
      await updateOrderStatusMutation.mutateAsync({ orderId, status });
      toast.success(`Order marked as ${status}`);
    } catch (error: any) {
      toast.error(error.message || "Failed to update order");
    }
  };

  const handleDeleteUser = async (userId: string, userEmail: string) => {
    // Security: Prevent deleting yourself
    if (userId === user?.id) {
      toast.error("You cannot delete your own account");
      return;
    }

    // Security: Prevent deleting the first/main admin
    const userRole = users?.find((u) => u.id === userId)?.role;
    const adminCount = users?.filter((u) => u.role === "admin").length || 0;

    if (userRole === "admin" && adminCount <= 1) {
      toast.error("Cannot delete the only admin account. Promote another admin first.");
      return;
    }

    if (!confirm(`Are you sure you want to delete user ${userEmail}? This action cannot be undone.`)) {
      return;
    }

    setDeletingUserId(userId);
    try {
      // Remove user profile and roles from DB
      await supabase.from("user_roles").delete().eq("user_id", userId);
      await supabase.from("profiles").delete().eq("user_id", userId);

      toast.success(`User ${userEmail} removed successfully`);
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
    } catch (err: any) {
      toast.error(err.message || "Failed to remove user");
    } finally {
      setDeletingUserId(null);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-8">
        <h1 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-6">Admin Panel</h1>

        {/* Tabs */}
        <div className="flex gap-2 mb-8 border-b border-border overflow-x-auto">
          {[
            { id: "dashboard" as const, label: "Dashboard", icon: BarChart3 },
            { id: "products" as const, label: "Products", icon: Package },
            { id: "orders" as const, label: "Orders", icon: ShoppingCart },
            { id: "users" as const, label: "Users", icon: Users },
            { id: "reviews" as const, label: "Reviews", icon: MessageSquare },
            { id: "settings" as const, label: "Settings", icon: Settings },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                activeTab === tab.id
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              <tab.icon size={16} />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Dashboard */}
        {activeTab === "dashboard" && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { label: "Total Revenue", value: `₹${totalRevenue.toFixed(2)}`, icon: BarChart3 },
              { label: "Total Orders", value: totalOrders, icon: ShoppingCart },
              { label: "Total Products", value: totalProducts, icon: Package },
            ].map((stat) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="border border-border rounded-sm p-6"
              >
                <div className="flex items-center gap-3 mb-2">
                  <stat.icon size={20} className="text-primary" />
                  <span className="text-sm text-muted-foreground">{stat.label}</span>
                </div>
                <p className="text-2xl font-bold text-foreground">{stat.value}</p>
              </motion.div>
            ))}
          </div>
        )}

        {/* Products */}
        {activeTab === "products" && (
          <div>
            {showForm || editingProduct ? (
              <AdminProductForm
                product={editingProduct}
                onClose={() => {
                  setShowForm(false);
                  setEditingProduct(null);
                }}
              />
            ) : (
              <>
                <button
                  onClick={() => setShowForm(true)}
                  className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2.5 text-sm font-medium tracking-wider uppercase mb-6"
                >
                  <Plus size={16} /> Add Product
                </button>
                {productsLoading ? (
                  <p className="text-muted-foreground">Loading...</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-border text-left">
                          <th className="pb-3 font-medium text-muted-foreground">Product</th>
                          <th className="pb-3 font-medium text-muted-foreground">Price</th>
                          <th className="pb-3 font-medium text-muted-foreground">Category</th>
                          <th className="pb-3 font-medium text-muted-foreground">Stock</th>
                          <th className="pb-3 font-medium text-muted-foreground">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {products?.map((p) => (
                          <tr key={p.id} className="border-b border-border">
                            <td className="py-3 flex items-center gap-3">
                              <img src={p.image} alt="" className="w-10 h-12 object-cover rounded-sm" />
                              <span className="font-medium truncate max-w-[200px]">{p.name}</span>
                            </td>
                            <td className="py-3">₹{p.price.toFixed(2)}</td>
                            <td className="py-3 capitalize">{p.category}</td>
                            <td className="py-3">
                              <span className={`text-xs font-medium ${p.inStock ? "text-green-600" : "text-destructive"}`}>
                                {p.inStock ? `${p.stockQuantity} in stock` : "Out of stock"}
                              </span>
                            </td>
                            <td className="py-3">
                              <div className="flex items-center gap-2">
                                <button onClick={() => setEditingProduct(p)} className="p-1.5 hover:bg-secondary rounded-sm" title="Edit">
                                  <Pencil size={14} />
                                </button>
                                <button onClick={() => toggleStock(p.id, p.inStock)} className="p-1.5 hover:bg-secondary rounded-sm" title={p.inStock ? "Mark out of stock" : "Mark in stock"}>
                                  {p.inStock ? <Ban size={14} /> : <Check size={14} />}
                                </button>
                                <button onClick={() => handleDelete(p.id)} className="p-1.5 hover:bg-secondary rounded-sm text-destructive" title="Delete">
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* Orders */}
        {activeTab === "orders" && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left">
                  <th className="pb-3 font-medium text-muted-foreground">Order ID</th>
                  <th className="pb-3 font-medium text-muted-foreground">Customer</th>
                  <th className="pb-3 font-medium text-muted-foreground">Total</th>
                  <th className="pb-3 font-medium text-muted-foreground">Payment</th>
                  <th className="pb-3 font-medium text-muted-foreground">Status</th>
                  <th className="pb-3 font-medium text-muted-foreground">Date</th>
                  <th className="pb-3 font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {orders?.map((order) => (
                  <tr key={order.id} className="border-b border-border">
                    <td className="py-3 font-mono text-xs">{order.id.slice(0, 8)}...</td>
                    <td className="py-3">{order.customer_name || "Unknown"}</td>
                    <td className="py-3 font-medium">₹{Number(order.total_price).toFixed(2)}</td>
                    <td className="py-3">
                      <div className="space-y-0.5">
                        <span className="text-xs font-medium capitalize">{order.payment_method}</span>
                        {(order as any).upi_app && (
                          <p className="text-[10px] text-muted-foreground">via {(order as any).upi_app}</p>
                        )}
                        {(order as any).transaction_id && (
                          <p className="text-[10px] font-mono text-muted-foreground">TXN: {(order as any).transaction_id}</p>
                        )}
                        <span className={`text-[10px] font-medium ${
                          (order as any).payment_status === "completed" ? "text-green-600" : "text-yellow-600"
                        }`}>
                          {(order as any).payment_status || "pending"}
                        </span>
                      </div>
                    </td>
                    <td className="py-3">
                      <span className={`px-2 py-0.5 text-xs rounded-full font-medium ${
                        order.order_status === "delivered" ? "bg-green-100 text-green-700" :
                        order.order_status === "shipped" ? "bg-blue-100 text-blue-700" :
                        order.order_status === "cancelled" ? "bg-red-100 text-red-700" :
                        "bg-yellow-100 text-yellow-700"
                      }`}>
                        {order.order_status}
                      </span>
                    </td>
                    <td className="py-3 text-muted-foreground">{new Date(order.created_at).toLocaleDateString()}</td>
                    <td className="py-3">
                      <select
                        value={order.order_status}
                        onChange={(e) => handleUpdateOrderStatus(order.id, e.target.value)}
                        className="text-xs border border-border rounded-sm px-2 py-1 bg-background"
                      >
                        {["pending", "confirmed", "shipped", "delivered", "cancelled"].map((s) => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    </td>
                  </tr>
                ))}
                {(!orders || orders.length === 0) && (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-muted-foreground">No orders yet</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Users */}
        {activeTab === "users" && (
          <div className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="border border-border rounded-sm p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="font-display text-xl font-bold text-foreground">Total Registered Users</h2>
                  <p className="text-sm text-muted-foreground">All users across the platform</p>
                </div>
                <div className="text-4xl font-bold text-primary">{users?.length || 0}</div>
              </div>
            </motion.div>

            {usersLoading ? (
              <p className="text-muted-foreground">Loading users...</p>
            ) : (
              <div className="overflow-x-auto border border-border rounded-sm">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border text-left bg-secondary/30">
                      <th className="px-4 py-3 font-medium text-muted-foreground">Name</th>
                      <th className="px-4 py-3 font-medium text-muted-foreground">Email</th>
                      <th className="px-4 py-3 font-medium text-muted-foreground">Role</th>
                      <th className="px-4 py-3 font-medium text-muted-foreground">Joined</th>
                      <th className="px-4 py-3 font-medium text-muted-foreground">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users?.map((u) => (
                      <tr key={u.id} className="border-b border-border hover:bg-secondary/20 transition-colors">
                        <td className="px-4 py-3">
                          <span className="font-medium text-foreground">{u.name}</span>
                        </td>
                        <td className="px-4 py-3 text-muted-foreground truncate">{u.email}</td>
                        <td className="px-4 py-3">
                          <span
                            className={`px-2 py-1 text-xs font-medium rounded-full ${
                              u.role === "admin"
                                ? "bg-purple-100 text-purple-700"
                                : "bg-blue-100 text-blue-700"
                            }`}
                          >
                            {u.role.charAt(0).toUpperCase() + u.role.slice(1)}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-muted-foreground text-xs">
                          {new Date(u.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-3">
                          <button
                            onClick={() => handleDeleteUser(u.id, u.email)}
                            disabled={deletingUserId === u.id}
                            className={`flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-sm transition-all ${
                              u.id === user?.id
                                ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                                : "bg-destructive/10 text-destructive hover:bg-destructive/20"
                            } disabled:opacity-50`}
                            title={
                              u.id === user?.id
                                ? "Cannot delete your own account"
                                : `Delete ${u.email}`
                            }
                          >
                            <Trash2 size={14} />
                            {deletingUserId === u.id ? "Deleting..." : "Delete"}
                          </button>
                        </td>
                      </tr>
                    ))}
                    {(!users || users.length === 0) && (
                      <tr>
                        <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">
                          No users found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}

            <div className="bg-yellow-50 border border-yellow-200 rounded-sm p-4">
              <p className="text-sm text-yellow-800">
                <strong>⚠️ Warning:</strong> Deleting a user is permanent and cannot be undone. The user's data (orders, wishlist) will remain but the account will be removed.
              </p>
            </div>
          </div>
        )}

        {/* Reviews */}
        {activeTab === "reviews" && (
          <div>
            <AdminReviewManager />
          </div>
        )}

        {/* Settings */}
        {activeTab === "settings" && (
          <div className="space-y-8">
            {/* Admin Login Visibility */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="border border-border rounded-sm p-6"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-foreground mb-2">Admin Login Visibility</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Control whether the admin login option is visible to the public. When disabled, the admin login link will be hidden from the navbar but remains accessible via direct URL.
                  </p>
                </div>
                <button
                  onClick={async () => {
                    setSavingVisibility(true);
                    try {
                      await setShowAdminLogin(!showAdminLogin);
                      toast.success(
                        showAdminLogin
                          ? "Admin login is now hidden from public"
                          : "Admin login is now visible to public"
                      );
                    } catch (err) {
                      toast.error("Failed to update visibility setting");
                    } finally {
                      setSavingVisibility(false);
                    }
                  }}
                  disabled={savingVisibility}
                  className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium tracking-wider uppercase rounded-md transition-all ${
                    showAdminLogin
                      ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200"
                      : "bg-orange-100 text-orange-700 hover:bg-orange-200"
                  } disabled:opacity-50`}
                >
                  {showAdminLogin ? (
                    <>
                      <Eye size={16} /> Visible
                    </>
                  ) : (
                    <>
                      <EyeOff size={16} /> Hidden
                    </>
                  )}
                </button>
              </div>
              <div className="mt-4 p-3 bg-secondary/30 rounded-sm border border-border">
                <p className="text-xs font-medium text-foreground">Current Status:</p>
                <p className="text-sm text-muted-foreground mt-1">
                  {showAdminLogin
                    ? "✓ Admin login link is visible in the navbar and mobile menu for public viewing."
                    : "✗ Admin login link is hidden from navbar and mobile menu, but still accessible via /admin/auth URL."}
                </p>
              </div>
            </motion.div>

            {/* Payment Settings */}
            <AdminPaymentSettings />

            {/* Advertisement Manager */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="border border-border rounded-sm p-6"
            >
              <AdminAdvertisementManager />
            </motion.div>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default AdminPage;
