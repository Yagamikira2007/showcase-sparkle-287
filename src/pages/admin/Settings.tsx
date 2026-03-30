import { useState } from "react";
import AdminLayout from "@/components/AdminLayout";
import { useSiteSettings } from "@/contexts/SiteSettingsContext";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { Settings as SettingsIcon, Link as LinkIcon, Sparkles, Image as ImageIcon } from "lucide-react";

const OVERLAY_OPTIONS = [
  { value: "none", label: "None" },
  { value: "snow", label: "❄️ Snow" },
  { value: "rain", label: "🌧️ Rain" },
  { value: "stars", label: "⭐ Stars" },
  { value: "bubbles", label: "🫧 Bubbles" },
  { value: "confetti", label: "🎉 Confetti" },
  { value: "fireflies", label: "✨ Fireflies" },
] as const;

export default function AdminSettings() {
  const { overlayEffect, branding, updateOverlay, updateBranding } = useSiteSettings();

  const [socialLinks, setSocialLinks] = useState(() => {
    const stored = localStorage.getItem("admin_social_links");
    return stored ? JSON.parse(stored) : { telegram: "", whatsapp: "", messenger: "" };
  });

  const [localBranding, setLocalBranding] = useState(branding);

  const handleSaveSocial = () => {
    localStorage.setItem("admin_social_links", JSON.stringify(socialLinks));
    toast.success("Social links saved");
  };

  const handleSaveBranding = async () => {
    await updateBranding(localBranding);
    toast.success("Branding updated");
  };

  const handleOverlayToggle = async (enabled: boolean) => {
    await updateOverlay({ ...overlayEffect, enabled });
  };

  const handleOverlayType = async (type: string) => {
    await updateOverlay({ type: type as any, enabled: overlayEffect.enabled });
  };

  return (
    <AdminLayout>
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <h1 className="font-display text-3xl font-bold tracking-tight mb-1">Settings</h1>
        <p className="text-muted-foreground mb-8">Configure your showcase</p>

        <div className="max-w-lg space-y-8">
          {/* Branding Section */}
          <div className="bg-card rounded-xl border p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-9 h-9 rounded-lg bg-accent/10 flex items-center justify-center">
                <ImageIcon className="w-4 h-4 text-accent" />
              </div>
              <h2 className="font-display text-lg font-semibold">Site Branding</h2>
            </div>
            <div className="space-y-3">
              <div className="space-y-1">
                <Label>Site Title</Label>
                <Input value={localBranding.title} onChange={(e) => setLocalBranding({ ...localBranding, title: e.target.value })} placeholder="My Showcase" />
              </div>
              <div className="space-y-1">
                <Label>Favicon URL</Label>
                <Input value={localBranding.favicon_url} onChange={(e) => setLocalBranding({ ...localBranding, favicon_url: e.target.value })} placeholder="https://example.com/favicon.ico" />
                <p className="text-xs text-muted-foreground">Paste a URL to an image to use as your site favicon. You can upload images in the Media section and copy the URL.</p>
              </div>
              {localBranding.favicon_url && (
                <div className="flex items-center gap-2 p-2 bg-muted rounded-lg">
                  <img src={localBranding.favicon_url} alt="Favicon preview" className="w-8 h-8 object-contain" />
                  <span className="text-sm text-muted-foreground">Favicon preview</span>
                </div>
              )}
            </div>
            <Button onClick={handleSaveBranding} className="mt-4 gradient-accent text-primary-foreground border-0 hover:opacity-90">Save Branding</Button>
          </div>

          {/* Overlay Effects */}
          <div className="bg-card rounded-xl border p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-9 h-9 rounded-lg bg-accent/10 flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-accent" />
              </div>
              <h2 className="font-display text-lg font-semibold">Overlay Effects</h2>
            </div>
            <p className="text-sm text-muted-foreground mb-4">Add animated visual effects across the entire website.</p>
            <div className="flex items-center justify-between mb-4">
              <Label>Enable Overlay</Label>
              <Switch checked={overlayEffect.enabled} onCheckedChange={handleOverlayToggle} />
            </div>
            <div className="grid grid-cols-2 gap-2">
              {OVERLAY_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => handleOverlayType(opt.value)}
                  className={`px-3 py-2 text-sm rounded-lg transition-all active:scale-95 text-left ${
                    overlayEffect.type === opt.value
                      ? "gradient-accent text-primary-foreground"
                      : "bg-muted text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Admin Info */}
          <div className="bg-card rounded-xl border p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-9 h-9 rounded-lg bg-accent/10 flex items-center justify-center">
                <SettingsIcon className="w-4 h-4 text-accent" />
              </div>
              <h2 className="font-display text-lg font-semibold">Admin Info</h2>
            </div>
            <div className="space-y-3 text-sm text-muted-foreground">
              <p><span className="font-medium text-foreground">Username:</span> itachiXCoder</p>
              <p><span className="font-medium text-foreground">Role:</span> Administrator</p>
            </div>
          </div>

          {/* Social Links */}
          <div className="bg-card rounded-xl border p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-9 h-9 rounded-lg bg-accent/10 flex items-center justify-center">
                <LinkIcon className="w-4 h-4 text-accent" />
              </div>
              <h2 className="font-display text-lg font-semibold">Default Social Links</h2>
            </div>
            <p className="text-sm text-muted-foreground mb-4">These will be pre-filled when adding new products.</p>
            <div className="space-y-3">
              <div className="space-y-1">
                <Label>Telegram URL</Label>
                <Input value={socialLinks.telegram} onChange={(e) => setSocialLinks({ ...socialLinks, telegram: e.target.value })} placeholder="https://t.me/..." />
              </div>
              <div className="space-y-1">
                <Label>WhatsApp URL</Label>
                <Input value={socialLinks.whatsapp} onChange={(e) => setSocialLinks({ ...socialLinks, whatsapp: e.target.value })} placeholder="https://wa.me/..." />
              </div>
              <div className="space-y-1">
                <Label>Messenger URL</Label>
                <Input value={socialLinks.messenger} onChange={(e) => setSocialLinks({ ...socialLinks, messenger: e.target.value })} placeholder="https://m.me/..." />
              </div>
            </div>
            <Button onClick={handleSaveSocial} className="mt-4 gradient-accent text-primary-foreground border-0 hover:opacity-90">Save Settings</Button>
          </div>
        </div>
      </motion.div>
    </AdminLayout>
  );
}
