import { useState } from "react";
import AdminLayout from "@/components/AdminLayout";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Settings as SettingsIcon, Link as LinkIcon } from "lucide-react";

export default function AdminSettings() {
  const [socialLinks, setSocialLinks] = useState(() => {
    const stored = localStorage.getItem("admin_social_links");
    return stored ? JSON.parse(stored) : { telegram: "", whatsapp: "", messenger: "" };
  });

  const handleSave = () => {
    localStorage.setItem("admin_social_links", JSON.stringify(socialLinks));
    toast.success("Settings saved");
  };

  return (
    <AdminLayout>
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <h1 className="font-display text-3xl font-bold tracking-tight mb-1">Settings</h1>
        <p className="text-muted-foreground mb-8">Configure your showcase</p>

        <div className="max-w-lg space-y-8">
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
            <Button onClick={handleSave} className="mt-4 gradient-accent text-primary-foreground border-0 hover:opacity-90">Save Settings</Button>
          </div>
        </div>
      </motion.div>
    </AdminLayout>
  );
}
