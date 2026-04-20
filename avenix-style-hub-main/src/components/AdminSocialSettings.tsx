import { useState } from "react";
import { motion } from "framer-motion";
import { MessageCircle, Instagram, Facebook, Save, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import { useSocialSettings, DEFAULT_SOCIAL } from "@/hooks/useSocialSettings";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const AdminSocialSettings = () => {
  const { settings, saveSettings } = useSocialSettings();
  const [form, setForm] = useState({ ...settings });
  const [saving, setSaving] = useState(false);

  const set = (field: keyof typeof form, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleSave = async () => {
    if (form.whatsapp && !/^\d+$/.test(form.whatsapp.replace(/\D/g, ""))) {
      toast.error("WhatsApp number must contain digits only");
      return;
    }
    setSaving(true);
    try {
      saveSettings(form);
      toast.success("Social settings saved successfully!");
    } catch {
      toast.error("Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    setForm({ ...DEFAULT_SOCIAL });
    saveSettings({ ...DEFAULT_SOCIAL });
    toast.success("Settings reset to defaults");
  };

  const whatsappPreview = form.whatsapp
    ? `https://wa.me/${form.whatsapp.replace(/\D/g, "")}?text=${encodeURIComponent(form.message)}`
    : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="border border-border rounded-sm p-6 space-y-6"
    >
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center">
          <MessageCircle size={20} className="text-green-600" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-foreground">Social & Customer Service</h3>
          <p className="text-sm text-muted-foreground">Control all social media links and WhatsApp customer service</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* WhatsApp */}
        <div className="md:col-span-2">
          <Label className="text-xs uppercase tracking-wider flex items-center gap-1.5 mb-1.5">
            <span className="w-4 h-4 bg-green-500 rounded-sm flex items-center justify-center text-white text-[9px] font-bold">W</span>
            WhatsApp Number <span className="text-muted-foreground font-normal">(digits only, include country code)</span>
          </Label>
          <Input
            value={form.whatsapp}
            onChange={(e) => set("whatsapp", e.target.value)}
            placeholder="918011319101"
            className="font-mono"
          />
          {form.whatsapp && (
            <p className="text-xs text-muted-foreground mt-1">
              Link: <a href={whatsappPreview || "#"} target="_blank" rel="noopener noreferrer" className="text-green-600 hover:underline break-all">{whatsappPreview}</a>
            </p>
          )}
        </div>

        {/* Default Message */}
        <div className="md:col-span-2">
          <Label className="text-xs uppercase tracking-wider mb-1.5 block">
            Default Customer Message
          </Label>
          <Input
            value={form.message}
            onChange={(e) => set("message", e.target.value)}
            placeholder="Hello, I need help regarding a product"
          />
          <p className="text-xs text-muted-foreground mt-1">This message is pre-filled when customers open WhatsApp</p>
        </div>

        {/* Instagram */}
        <div>
          <Label className="text-xs uppercase tracking-wider flex items-center gap-1.5 mb-1.5">
            <Instagram size={14} className="text-pink-600" />
            Instagram URL
          </Label>
          <Input
            value={form.instagram}
            onChange={(e) => set("instagram", e.target.value)}
            placeholder="https://instagram.com/yourpage"
          />
        </div>

        {/* Facebook */}
        <div>
          <Label className="text-xs uppercase tracking-wider flex items-center gap-1.5 mb-1.5">
            <Facebook size={14} className="text-blue-600" />
            Facebook URL
          </Label>
          <Input
            value={form.facebook}
            onChange={(e) => set("facebook", e.target.value)}
            placeholder="https://facebook.com/yourpage"
          />
        </div>
      </div>

      {/* Preview */}
      <div className="bg-secondary/30 rounded-sm p-4 border border-border space-y-2">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Live Preview</p>
        <div className="flex flex-wrap gap-3">
          {form.whatsapp && (
            <span className="flex items-center gap-1.5 text-xs bg-green-100 text-green-700 px-2.5 py-1 rounded-full">
              <span className="font-bold">W</span> WhatsApp active
            </span>
          )}
          {form.instagram && (
            <span className="flex items-center gap-1.5 text-xs bg-pink-100 text-pink-700 px-2.5 py-1 rounded-full">
              <Instagram size={11} /> Instagram active
            </span>
          )}
          {form.facebook && (
            <span className="flex items-center gap-1.5 text-xs bg-blue-100 text-blue-700 px-2.5 py-1 rounded-full">
              <Facebook size={11} /> Facebook active
            </span>
          )}
          {!form.whatsapp && !form.instagram && !form.facebook && (
            <span className="text-xs text-muted-foreground">No links configured — icons will be hidden</span>
          )}
        </div>
      </div>

      <div className="flex gap-3">
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 bg-primary text-primary-foreground px-5 py-2.5 text-sm font-medium tracking-wider uppercase rounded-sm hover:bg-primary/90 transition-colors disabled:opacity-50"
        >
          <Save size={15} />
          {saving ? "Saving..." : "Save Settings"}
        </button>
        <button
          onClick={handleReset}
          className="flex items-center gap-2 border border-border text-muted-foreground px-5 py-2.5 text-sm font-medium tracking-wider uppercase rounded-sm hover:text-foreground hover:border-foreground transition-colors"
        >
          <RotateCcw size={15} />
          Reset
        </button>
      </div>
    </motion.div>
  );
};

export default AdminSocialSettings;
