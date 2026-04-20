import { useState, useEffect } from "react";

export interface SocialSettings {
  whatsapp: string;
  message: string;
  instagram: string;
  facebook: string;
}

const STORAGE_KEY = "tc_social_settings";

export const DEFAULT_SOCIAL: SocialSettings = {
  whatsapp: "918011319101",
  message: "Hello, I need help regarding a product",
  instagram: "",
  facebook: "",
};

const load = (): SocialSettings => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? { ...DEFAULT_SOCIAL, ...JSON.parse(raw) } : DEFAULT_SOCIAL;
  } catch {
    return DEFAULT_SOCIAL;
  }
};

export const useSocialSettings = () => {
  const [settings, setSettings] = useState<SocialSettings>(load);

  useEffect(() => {
    const onStorage = () => setSettings(load());
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const saveSettings = (next: SocialSettings): SocialSettings => {
    const cleaned: SocialSettings = {
      ...next,
      whatsapp: next.whatsapp.replace(/\D/g, ""),
      instagram: next.instagram.startsWith("https://") || next.instagram === "" ? next.instagram : `https://${next.instagram}`,
      facebook: next.facebook.startsWith("https://") || next.facebook === "" ? next.facebook : `https://${next.facebook}`,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cleaned));
    setSettings(cleaned);
    window.dispatchEvent(new Event("storage"));
    return cleaned;
  };

  const getWhatsAppUrl = (productName?: string): string | null => {
    if (!settings.whatsapp) return null;
    const msg = productName
      ? `Hi, I have a question about ${productName}`
      : settings.message;
    return `https://wa.me/${settings.whatsapp}?text=${encodeURIComponent(msg)}`;
  };

  return { settings, saveSettings, getWhatsAppUrl };
};
