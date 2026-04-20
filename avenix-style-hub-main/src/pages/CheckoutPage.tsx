import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { CreditCard, Smartphone, ChevronRight, CheckCircle2, AlertCircle, ArrowLeft } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";
import { useCreateOrder } from "@/hooks/useOrders";

type PaymentMethod = "upi" | "card";
type UpiApp = "gpay" | "phonepe" | "paytm";
type CheckoutStep = "address" | "payment" | "upi-confirm" | "processing";

const UPI_APPS: { id: UpiApp; name: string; color: string; icon: string; settingKey: string }[] = [
  { id: "gpay", name: "Google Pay", color: "#4285F4", icon: "G", settingKey: "gpay_enabled" },
  { id: "phonepe", name: "PhonePe", color: "#5F259F", icon: "₱", settingKey: "phonepe_enabled" },
  { id: "paytm", name: "Paytm", color: "#00BAF2", icon: "₽", settingKey: "paytm_enabled" },
];

const CheckoutPage = () => {
  const { items, totalPrice, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const createOrderMutation = useCreateOrder();
  const [step, setStep] = useState<CheckoutStep>("address");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | null>(null);
  const [selectedUpiApp, setSelectedUpiApp] = useState<UpiApp | null>(null);
  const [transactionId, setTransactionId] = useState("");
  const [loading, setLoading] = useState(false);
  const [address, setAddress] = useState({
    firstName: "", lastName: "", email: "", phone: "",
    address: "", city: "", state: "", pinCode: "",
  });

  const { data: paymentSettings } = useQuery({
    queryKey: ["payment-settings"],
    queryFn: async () => {
      const { data } = await supabase.from("payment_settings").select("*").limit(1).maybeSingle();
      return data ?? null;
    },
  });

  const enabledUpiApps = UPI_APPS.filter((app) => {
    if (!paymentSettings) return true;
    return (paymentSettings as any)[app.settingKey] === true;
  });

  const handleUpiAppClick = (app: UpiApp) => {
    setSelectedUpiApp(app);
    if (!paymentSettings || !(paymentSettings as any).upi_id) {
      toast.error("UPI payment is not configured. Please contact the store.");
      return;
    }
    const upiId = (paymentSettings as any).upi_id;
    const payeeName = (paymentSettings as any).payee_name || "Trending Cloths";
    const amount = totalPrice.toFixed(2);
    const note = `Order from ${payeeName}`;
    const deepLink = `upi://pay?pa=${encodeURIComponent(upiId)}&pn=${encodeURIComponent(payeeName)}&am=${amount}&cu=INR&tn=${encodeURIComponent(note)}`;

    // Open UPI deep link
    window.location.href = deepLink;

    // After a brief delay, show confirm step
    setTimeout(() => setStep("upi-confirm"), 1500);
  };

  const handlePlaceOrder = async (method: PaymentMethod, txnId?: string) => {
    if (!user) {
      toast.error("Please sign in to place an order");
      navigate("/auth");
      return;
    }

    setLoading(true);
    setStep("processing");
    try {
      const orderData = {
        user_id: user.id,
        total_price: totalPrice,
        address: address as any,
        payment_method: method,
        order_status: "pending",
        payment_status: "completed", // UPI and Card are completed immediately
        upi_app: selectedUpiApp || null,
        transaction_id: txnId || null,
      };

      const orderItems = items.map((item) => ({
        product_id: item.product.id,
        quantity: item.quantity,
        size: item.size,
        color: item.color,
        price: item.product.price,
      }));

      await createOrderMutation.mutateAsync({
        order: orderData,
        items: orderItems,
      });

      toast.success("Order placed successfully! 🎉");
      clearCart();
      navigate("/profile");
    } catch (err: any) {
      toast.error(err.message || "Failed to place order");
      setStep("payment");
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmUpiPayment = () => {
    if (!transactionId.trim()) {
      toast.error("Please enter your UPI transaction ID");
      return;
    }
    if (transactionId.trim().length < 6) {
      toast.error("Please enter a valid transaction ID (min 6 characters)");
      return;
    }
    handlePlaceOrder("upi", transactionId.trim());
  };

  const isAddressValid = address.firstName && address.address && address.city && address.phone;

  const updateAddress = (field: string, value: string) =>
    setAddress((prev) => ({ ...prev, [field]: value }));

  if (items.length === 0) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center space-y-4">
            <p className="text-muted-foreground">Your cart is empty</p>
            <button onClick={() => navigate("/")} className="bg-primary text-primary-foreground px-6 py-2 text-sm font-medium">
              Continue Shopping
            </button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-muted/30">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-6 md:py-10 max-w-5xl">
        {/* Progress Steps */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {[
            { key: "address", label: "Address" },
            { key: "payment", label: "Payment" },
            { key: "upi-confirm", label: "Confirm" },
          ].map((s, i) => {
            const stepOrder = ["address", "payment", "upi-confirm", "processing"];
            const currentIdx = stepOrder.indexOf(step);
            const thisIdx = stepOrder.indexOf(s.key);
            const isActive = thisIdx <= currentIdx;
            return (
              <div key={s.key} className="flex items-center gap-2">
                {i > 0 && <div className={`w-8 h-0.5 ${isActive ? "bg-primary" : "bg-border"}`} />}
                <div className={`flex items-center gap-1.5 text-xs font-medium ${isActive ? "text-primary" : "text-muted-foreground"}`}>
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${
                    isActive ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                  }`}>
                    {thisIdx < currentIdx ? "✓" : i + 1}
                  </div>
                  <span className="hidden sm:inline">{s.label}</span>
                </div>
              </div>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Panel */}
          <div className="lg:col-span-2">
            <AnimatePresence mode="wait">
              {/* STEP: Address */}
              {step === "address" && (
                <motion.div key="address" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="bg-background border border-border rounded-lg p-6 space-y-5">
                  <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                    <span className="w-7 h-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">1</span>
                    Delivery Address
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {[
                      { key: "firstName", label: "First Name", required: true },
                      { key: "lastName", label: "Last Name" },
                      { key: "email", label: "Email" },
                      { key: "phone", label: "Phone", required: true },
                      { key: "address", label: "Full Address", full: true, required: true },
                      { key: "city", label: "City", required: true },
                      { key: "state", label: "State" },
                      { key: "pinCode", label: "PIN Code" },
                    ].map(({ key, label, full, required }) => (
                      <div key={key} className={full ? "sm:col-span-2" : ""}>
                        <label className="text-xs font-medium text-muted-foreground">
                          {label} {required && <span className="text-destructive">*</span>}
                        </label>
                        <input
                          type="text"
                          value={(address as any)[key]}
                          onChange={(e) => updateAddress(key, e.target.value)}
                          className="w-full border border-border rounded-md px-3 py-2.5 text-sm mt-1 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-background transition-all"
                          placeholder={label}
                        />
                      </div>
                    ))}
                  </div>
                  <button
                    onClick={() => {
                      if (!isAddressValid) {
                        toast.error("Please fill all required fields");
                        return;
                      }
                      setStep("payment");
                    }}
                    className="w-full bg-primary text-primary-foreground py-3 text-sm font-semibold tracking-wide uppercase rounded-md hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
                  >
                    Continue to Payment <ChevronRight size={16} />
                  </button>
                </motion.div>
              )}

              {/* STEP: Payment */}
              {step === "payment" && (
                <motion.div key="payment" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="space-y-4">
                  <button onClick={() => setStep("address")} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-2">
                    <ArrowLeft size={14} /> Back to Address
                  </button>

                  <div className="bg-background border border-border rounded-lg p-6 space-y-5">
                    <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                      <span className="w-7 h-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">2</span>
                      Payment Method
                    </h2>

                    <div className="space-y-3">
                      {/* UPI Option */}
                      <div
                        onClick={() => setPaymentMethod("upi")}
                        className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                          paymentMethod === "upi" ? "border-primary bg-primary/5 shadow-sm" : "border-border hover:border-muted-foreground/30"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                            <Smartphone className="text-green-600" size={20} />
                          </div>
                          <div className="flex-1">
                            <p className="font-semibold text-foreground text-sm">UPI</p>
                            <p className="text-xs text-muted-foreground">Pay using any UPI app</p>
                          </div>
                          <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                            paymentMethod === "upi" ? "border-primary" : "border-muted-foreground/30"
                          }`}>
                            {paymentMethod === "upi" && <div className="w-2.5 h-2.5 rounded-full bg-primary" />}
                          </div>
                        </div>

                        {/* UPI App Selection */}
                        <AnimatePresence>
                          {paymentMethod === "upi" && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              className="overflow-hidden"
                            >
                              <div className="mt-4 pt-4 border-t border-border">
                                <p className="text-xs font-medium text-muted-foreground mb-3">Select UPI App</p>
                                <div className="grid grid-cols-3 gap-3">
                                  {enabledUpiApps.map((app) => (
                                    <button
                                      key={app.id}
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleUpiAppClick(app.id);
                                      }}
                                      className={`flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-all hover:shadow-md ${
                                        selectedUpiApp === app.id ? "border-primary bg-primary/5" : "border-border hover:border-muted-foreground/30"
                                      }`}
                                    >
                                      <div
                                        className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-md"
                                        style={{ backgroundColor: app.color }}
                                      >
                                        {app.icon}
                                      </div>
                                      <span className="text-xs font-medium text-foreground">{app.name}</span>
                                    </button>
                                  ))}
                                </div>
                                {enabledUpiApps.length === 0 && (
                                  <p className="text-sm text-muted-foreground text-center py-4">No UPI apps available</p>
                                )}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>

                      {/* Card Option */}
                      <div
                        onClick={() => setPaymentMethod("card")}
                        className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                          paymentMethod === "card" ? "border-primary bg-primary/5 shadow-sm" : "border-border hover:border-muted-foreground/30"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                            <CreditCard className="text-blue-600" size={20} />
                          </div>
                          <div className="flex-1">
                            <p className="font-semibold text-foreground text-sm">Credit / Debit Card</p>
                            <p className="text-xs text-muted-foreground">Visa, Mastercard, RuPay</p>
                          </div>
                          <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                            paymentMethod === "card" ? "border-primary" : "border-muted-foreground/30"
                          }`}>
                            {paymentMethod === "card" && <div className="w-2.5 h-2.5 rounded-full bg-primary" />}
                          </div>
                        </div>
                        <AnimatePresence>
                          {paymentMethod === "card" && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              className="overflow-hidden"
                            >
                              <div className="mt-4 pt-4 border-t border-border">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handlePlaceOrder("card");
                                  }}
                                  disabled={loading}
                                  className="w-full bg-primary text-primary-foreground py-3 text-sm font-semibold tracking-wide uppercase rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50"
                                >
                                  {loading ? "Processing..." : `Pay ₹${totalPrice.toFixed(2)}`}
                                </button>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>

                      {/* COD Option - REMOVED FOR PREMIUM EXPERIENCE */}
                      {/* Only UPI and Card payments are now available */}
                    </div>
                  </div>
                </motion.div>
              )}

              {/* STEP: UPI Confirm */}
              {step === "upi-confirm" && (
                <motion.div key="upi-confirm" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="space-y-4">
                  <button onClick={() => { setStep("payment"); setSelectedUpiApp(null); }} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-2">
                    <ArrowLeft size={14} /> Back to Payment
                  </button>

                  <div className="bg-background border border-border rounded-lg p-6 space-y-6">
                    <div className="text-center space-y-3">
                      <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto">
                        <CheckCircle2 className="text-green-600" size={32} />
                      </div>
                      <h2 className="text-lg font-bold text-foreground">Confirm Your Payment</h2>
                      <p className="text-sm text-muted-foreground">
                        Complete the payment in <span className="font-semibold text-foreground">
                          {UPI_APPS.find((a) => a.id === selectedUpiApp)?.name}
                        </span> and enter the transaction ID below.
                      </p>
                    </div>

                    <div className="bg-muted/50 rounded-lg p-4 text-center">
                      <p className="text-xs text-muted-foreground mb-1">Amount to Pay</p>
                      <p className="text-2xl font-bold text-foreground">₹{totalPrice.toFixed(2)}</p>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-foreground block mb-2">
                        UPI Transaction ID (UTR Number) <span className="text-destructive">*</span>
                      </label>
                      <input
                        type="text"
                        value={transactionId}
                        onChange={(e) => setTransactionId(e.target.value)}
                        placeholder="e.g., 312345678901"
                        className="w-full border border-border rounded-md px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-background"
                      />
                      <p className="text-xs text-muted-foreground mt-1.5 flex items-center gap-1">
                        <AlertCircle size={12} />
                        Find this in your UPI app's transaction history
                      </p>
                    </div>

                    <button
                      onClick={handleConfirmUpiPayment}
                      disabled={loading || !transactionId.trim()}
                      className="w-full bg-green-600 text-white py-3 text-sm font-semibold tracking-wide uppercase rounded-md hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {loading ? "Placing Order..." : "Confirm Payment & Place Order"}
                    </button>

                    <button
                      onClick={() => handleUpiAppClick(selectedUpiApp!)}
                      className="w-full border border-border text-foreground py-2.5 text-sm font-medium rounded-md hover:bg-muted transition-colors"
                    >
                      Retry Payment
                    </button>
                  </div>
                </motion.div>
              )}

              {/* STEP: Processing */}
              {step === "processing" && (
                <motion.div key="processing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-background border border-border rounded-lg p-10 flex flex-col items-center justify-center">
                  <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4" />
                  <p className="text-sm font-medium text-foreground">Placing your order...</p>
                  <p className="text-xs text-muted-foreground mt-1">Please wait</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Right Panel - Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-background border border-border rounded-lg p-5 sticky top-24 space-y-4">
              <h3 className="font-bold text-foreground text-sm uppercase tracking-wider">Order Summary</h3>
              <div className="space-y-3 max-h-48 overflow-y-auto pr-1">
                {items.map((item) => (
                  <div key={`${item.product.id}-${item.size}-${item.color}`} className="flex gap-3">
                    <img src={item.product.image} alt="" className="w-11 h-14 object-cover rounded" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{item.product.name}</p>
                      <p className="text-xs text-muted-foreground">{item.size} · {item.color} · Qty: {item.quantity}</p>
                    </div>
                    <p className="text-sm font-semibold whitespace-nowrap">₹{(item.product.price * item.quantity).toFixed(2)}</p>
                  </div>
                ))}
              </div>
              <div className="border-t border-border pt-3 space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span>₹{totalPrice.toFixed(2)}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Shipping</span><span className="text-green-600 font-medium">FREE</span></div>
                <div className="flex justify-between font-bold text-base pt-2 border-t border-border">
                  <span>Total</span><span>₹{totalPrice.toFixed(2)}</span>
                </div>
              </div>
              <div className="bg-green-50 dark:bg-green-950/30 rounded-md p-3 flex items-start gap-2">
                <CheckCircle2 className="text-green-600 mt-0.5 shrink-0" size={14} />
                <p className="text-xs text-green-700 dark:text-green-400">Safe and secure payments. Easy returns.</p>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default CheckoutPage;
