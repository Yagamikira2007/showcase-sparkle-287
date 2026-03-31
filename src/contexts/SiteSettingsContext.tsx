import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface OverlayEffect {
  type: "none" | "snow" | "rain" | "stars" | "bubbles" | "confetti" | "fireflies" | "aurora" | "matrix" | "geometric" | "sakura" | "sparkle" | "smoke" | "neon_grid" | "bokeh" | "waves";
  enabled: boolean;
}

export interface SiteBranding {
  title: string;
  favicon_url: string;
}

export interface HeroContent {
  subtitle: string;
  title: string;
  title_highlight: string;
  description: string;
  button_text: string;
  button_link: string;
}

export interface NavbarSettings {
  brand_name: string;
  show_theme_toggle: boolean;
}

export interface FooterSettings {
  text: string;
  show_social: boolean;
}

export interface ColorTheme {
  preset: string;
  custom_accent: string;
}

interface SiteSettingsContextType {
  overlayEffect: OverlayEffect;
  branding: SiteBranding;
  heroContent: HeroContent;
  navbarSettings: NavbarSettings;
  footerSettings: FooterSettings;
  colorTheme: ColorTheme;
  updateOverlay: (effect: OverlayEffect) => Promise<void>;
  updateBranding: (branding: SiteBranding) => Promise<void>;
  updateHeroContent: (hero: HeroContent) => Promise<void>;
  updateNavbarSettings: (nav: NavbarSettings) => Promise<void>;
  updateFooterSettings: (footer: FooterSettings) => Promise<void>;
  updateColorTheme: (theme: ColorTheme) => Promise<void>;
  loading: boolean;
}

const defaults = {
  overlay: { type: "none" as const, enabled: false },
  branding: { title: "Showcase", favicon_url: "" },
  hero: { subtitle: "Curated Collection", title: "Discover Products", title_highlight: "Worth Having", description: "A handpicked selection of premium products. Browse freely, connect directly with the seller when you find something you love.", button_text: "Browse Products", button_link: "/products" },
  navbar: { brand_name: "Showcase", show_theme_toggle: true },
  footer: { text: `© ${new Date().getFullYear()} Showcase. All rights reserved.`, show_social: true },
  color: { preset: "amber", custom_accent: "38 92% 50%" },
};

const SiteSettingsContext = createContext<SiteSettingsContextType | null>(null);

export function SiteSettingsProvider({ children }: { children: ReactNode }) {
  const [overlayEffect, setOverlayEffect] = useState<OverlayEffect>(defaults.overlay);
  const [branding, setBranding] = useState<SiteBranding>(defaults.branding);
  const [heroContent, setHeroContent] = useState<HeroContent>(defaults.hero);
  const [navbarSettings, setNavbarSettings] = useState<NavbarSettings>(defaults.navbar);
  const [footerSettings, setFooterSettings] = useState<FooterSettings>(defaults.footer);
  const [colorTheme, setColorTheme] = useState<ColorTheme>(defaults.color);
  const [loading, setLoading] = useState(true);

  const fetchSettings = useCallback(async () => {
    const { data } = await supabase.from("site_settings").select("*");
    if (data) {
      for (const row of data) {
        const v = row.value as any;
        if (row.key === "overlay_effect") setOverlayEffect(v);
        if (row.key === "site_branding") setBranding(v);
        if (row.key === "hero_content") setHeroContent(v);
        if (row.key === "navbar_settings") setNavbarSettings(v);
        if (row.key === "footer_settings") setFooterSettings(v);
        if (row.key === "color_theme") setColorTheme(v);
      }
    }
    setLoading(false);
  }, []);

  useEffect(() => { fetchSettings(); }, [fetchSettings]);

  useEffect(() => {
    if (branding.favicon_url) {
      let link = document.querySelector("link[rel='icon']") as HTMLLinkElement;
      if (!link) { link = document.createElement("link"); link.rel = "icon"; document.head.appendChild(link); }
      link.href = branding.favicon_url;
    }
    if (branding.title) document.title = branding.title;
  }, [branding]);

  // Apply color theme
  useEffect(() => {
    const root = document.documentElement;
    const presets: Record<string, string> = {
      amber: "38 92% 50%", rose: "346 77% 50%", violet: "263 70% 50%",
      emerald: "160 84% 39%", cyan: "188 94% 43%", orange: "25 95% 53%",
      blue: "217 91% 60%", pink: "330 81% 60%",
    };
    const accent = presets[colorTheme.preset] || colorTheme.custom_accent || presets.amber;
    root.style.setProperty("--accent", accent);
    root.style.setProperty("--ring", accent);
    root.style.setProperty("--sidebar-primary", accent);
    root.style.setProperty("--sidebar-ring", accent);
    root.style.setProperty("--hero-gradient-from", accent);
    // Slightly shift for gradient-to
    const parts = accent.split(" ");
    if (parts.length === 3) {
      const h = parseInt(parts[0]) - 10;
      root.style.setProperty("--hero-gradient-to", `${h} ${parts[1]} ${parts[2]}`);
    }
  }, [colorTheme]);

  const upsert = async (key: string, value: any) => {
    await supabase.from("site_settings").update({ value, updated_at: new Date().toISOString() }).eq("key", key);
  };

  const updateOverlay = async (e: OverlayEffect) => { setOverlayEffect(e); await upsert("overlay_effect", e); };
  const updateBranding = async (b: SiteBranding) => { setBranding(b); await upsert("site_branding", b); };
  const updateHeroContent = async (h: HeroContent) => { setHeroContent(h); await upsert("hero_content", h); };
  const updateNavbarSettings = async (n: NavbarSettings) => { setNavbarSettings(n); await upsert("navbar_settings", n); };
  const updateFooterSettings = async (f: FooterSettings) => { setFooterSettings(f); await upsert("footer_settings", f); };
  const updateColorTheme = async (c: ColorTheme) => { setColorTheme(c); await upsert("color_theme", c); };

  return (
    <SiteSettingsContext.Provider value={{ overlayEffect, branding, heroContent, navbarSettings, footerSettings, colorTheme, updateOverlay, updateBranding, updateHeroContent, updateNavbarSettings, updateFooterSettings, updateColorTheme, loading }}>
      {children}
    </SiteSettingsContext.Provider>
  );
}

export const useSiteSettings = () => {
  const ctx = useContext(SiteSettingsContext);
  if (!ctx) throw new Error("useSiteSettings must be used within SiteSettingsProvider");
  return ctx;
};
