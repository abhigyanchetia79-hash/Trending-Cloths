import { useState, useEffect } from "react";
import { Settings, Save } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useQuery, useQueryClient } from "@tanstack/react-query";

const AdminPaymentSettings = () => {
  const queryClient = useQueryClient();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    upi_id: "",
    payee_name: "Trending Cloths",
    gpay_enabled: true,
    phonepe_enabled: true,
    paytm_enabled: true,
  });

  const { data: settings, isLoading } = useQuery({
    queryKey: ["admin-payment-settings"],
    queryFn: async () => {
      const { data, error } = await supabase.from("payment_settings").select("*").limit(1).single();
      if (error) throw error;
      return data;
    },
  });

  useEffect(() => {
    if (settings) {
      setForm({
        upi_id: (settings as any).upi_id || "",
        payee_name: (settings as any).payee_name || "Trending Cloths",
        gpay_enabled: (settings as any).gpay_enabled ?? true,
        phonepe_enabled: (settings as any).phonepe_enabled ?? true,
        paytm_enabled: (settings as any).paytm_enabled ?? true,
      });
    }
  }, [settings]);

  const handleSave = async () => {
    if (!form.upi_id.trim()) {
      toast.error("Please enter a UPI ID");
      return;
    }
    setSaving(true);
    try {
      const { error } = await supabase
        .from("payment_settings")
        .update({
          upi_id: form.upi_id.trim(),
          payee_name: form.payee_name.trim(),
          gpay_enabled: form.gpay_enabled,
          phonepe_enabled: form.phonepe_enabled,
          paytm_enabled: form.paytm_enabled,
        } as any)
        .eq("id", (settings as any).id);
      if (error) throw error;
      toast.success("Payment settings saved!");
      queryClient.invalidateQueries({ queryKey: ["admin-payment-settings"] });
    } catch (err: any) {
      toast.error(err.message || "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  if (isLoading) return <p className="text-muted-foreground">Loading settings...</p>;

  return (
    <div className="max-w-lg space-y-6">
      <div className="flex items-center gap-2 mb-2">
        <Settings size={20} className="text-primary" />
        <h2 className="text-lg font-bold text-foreground">Payment Settings</h2>
      </div>

      <div className="space-y-4">
        <div>
          <label className="text-sm font-medium text-foreground block mb-1">UPI ID <span className="text-destructive">*</span></label>
          <input
            type="text"
            value={form.upi_id}
            onChange={(e) => setForm((p) => ({ ...p, upi_id: e.target.value }))}
            placeholder="yourname@upi"
            className="w-full border border-border rounded-md px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-background"
          />
          <p className="text-xs text-muted-foreground mt-1">Customers will pay to this UPI ID</p>
        </div>

        <div>
          <label className="text-sm font-medium text-foreground block mb-1">Payee Name</label>
          <input
            type="text"
            value={form.payee_name}
            onChange={(e) => setForm((p) => ({ ...p, payee_name: e.target.value }))}
            placeholder="Trending Cloths"
            className="w-full border border-border rounded-md px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-background"
          />
        </div>

        <div>
          <label className="text-sm font-medium text-foreground block mb-2">Enabled UPI Apps</label>
          <div className="space-y-2">
            {[
              { key: "gpay_enabled", label: "Google Pay (GPay)", color: "#4285F4" },
              { key: "phonepe_enabled", label: "PhonePe", color: "#5F259F" },
              { key: "paytm_enabled", label: "Paytm", color: "#00BAF2" },
            ].map((app) => (
              <label key={app.key} className="flex items-center gap-3 p-3 border border-border rounded-md cursor-pointer hover:bg-muted/50 transition-colors">
                <input
                  type="checkbox"
                  checked={(form as any)[app.key]}
                  onChange={(e) => setForm((p) => ({ ...p, [app.key]: e.target.checked }))}
                  className="accent-primary w-4 h-4"
                />
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: app.color }} />
                <span className="text-sm font-medium">{app.label}</span>
              </label>
            ))}
          </div>
        </div>
      </div>

      <button
        onClick={handleSave}
        disabled={saving}
        className="flex items-center gap-2 bg-primary text-primary-foreground px-6 py-2.5 text-sm font-medium rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50"
      >
        <Save size={16} />
        {saving ? "Saving..." : "Save Settings"}
      </button>
    </div>
  );
};

export default AdminPaymentSettings;
