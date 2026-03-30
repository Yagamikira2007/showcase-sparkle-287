import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface OverlayEffect {
  type: "none" | "snow" | "rain" | "stars" | "bubbles" | "confetti" | "fireflies";
  enabled: boolean;
}

export interface SiteBranding {
  title: string;
  favicon_url: string;
}

interface SiteSettingsContextType {
  overlayEffect: OverlayEffect;
  branding: SiteBranding;
  updateOverlay: (effect: OverlayEffect) => Promise<void>;
  updateBranding: (branding: SiteBranding) => Promise<void>;
  loading: boolean;
}

const SiteSettingsContext = createContext<SiteSettingsContextType | null>(null);

export function SiteSettingsProvider({ children }: { children: ReactNode }) {
  const [overlayEffect, setOverlayEffect] = useState<OverlayEffect>({ type: "none", enabled: false });
  const [branding, setBranding] = useState<SiteBranding>({ title: "Showcase", favicon_url: "" });
  const [loading, setLoading] = useState(true);

  const fetchSettings = useCallback(async () => {
    const { data } = await supabase.from("site_settings").select("*");
    if (data) {
      for (const row of data) {
        if (row.key === "overlay_effect") setOverlayEffect(row.value as unknown as OverlayEffect);
        if (row.key === "site_branding") setBranding(row.value as unknown as SiteBranding);
      }
    }
    setLoading(false);
  }, []);

  useEffect(() => { fetchSettings(); }, [fetchSettings]);

  // Update favicon dynamically
  useEffect(() => {
    if (branding.favicon_url) {
      let link = document.querySelector("link[rel='icon']") as HTMLLinkElement;
      if (!link) {
        link = document.createElement("link");
        link.rel = "icon";
        document.head.appendChild(link);
      }
      link.href = branding.favicon_url;
    }
    if (branding.title) {
      document.title = branding.title;
    }
  }, [branding]);

  const updateOverlay = async (effect: OverlayEffect) => {
    setOverlayEffect(effect);
    await supabase.from("site_settings").update({ value: effect as any, updated_at: new Date().toISOString() }).eq("key", "overlay_effect");
  };

  const updateBranding = async (b: SiteBranding) => {
    setBranding(b);
    await supabase.from("site_settings").update({ value: b as any, updated_at: new Date().toISOString() }).eq("key", "site_branding");
  };

  return (
    <SiteSettingsContext.Provider value={{ overlayEffect, branding, updateOverlay, updateBranding, loading }}>
      {children}
    </SiteSettingsContext.Provider>
  );
}

export const useSiteSettings = () => {
  const ctx = useContext(SiteSettingsContext);
  if (!ctx) throw new Error("useSiteSettings must be used within SiteSettingsProvider");
  return ctx;
};
