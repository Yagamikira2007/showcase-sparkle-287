import { useState, useEffect, useCallback } from "react";
import AdminLayout from "@/components/AdminLayout";
import { supabase } from "@/integrations/supabase/client";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, Trash2, Copy, Image as ImageIcon, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface StorageFile {
  name: string;
  url: string;
}

export default function AdminMedia() {
  const [files, setFiles] = useState<StorageFile[]>([]);
  const [uploading, setUploading] = useState(false);
  const [deleteFile, setDeleteFile] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchFiles = useCallback(async () => {
    const { data } = await supabase.storage.from("product-images").list("", { limit: 100, sortBy: { column: "created_at", order: "desc" } });
    if (data) {
      setFiles(data.filter(f => f.name !== ".emptyFolderPlaceholder").map((f) => ({
        name: f.name,
        url: supabase.storage.from("product-images").getPublicUrl(f.name).data.publicUrl,
      })));
    }
    setLoading(false);
  }, []);

  useEffect(() => { fetchFiles(); }, [fetchFiles]);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const ext = file.name.split(".").pop();
    const fileName = `${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from("product-images").upload(fileName, file);
    setUploading(false);
    if (error) {
      toast.error("Upload failed");
    } else {
      toast.success("Image uploaded");
      fetchFiles();
    }
    e.target.value = "";
  };

  const handleDelete = async () => {
    if (!deleteFile) return;
    await supabase.storage.from("product-images").remove([deleteFile]);
    toast.success("Image deleted");
    setDeleteFile(null);
    fetchFiles();
  };

  const copyUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    toast.success("URL copied!");
  };

  return (
    <AdminLayout>
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="font-display text-3xl font-bold tracking-tight mb-1">Media Manager</h1>
            <p className="text-muted-foreground">{files.length} images uploaded</p>
          </div>
          <label>
            <Button asChild className="gradient-accent text-primary-foreground border-0 hover:opacity-90 active:scale-[0.97] transition-all cursor-pointer">
              <span>
                {uploading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Upload className="w-4 h-4 mr-2" />}
                Upload Image
              </span>
            </Button>
            <input type="file" accept="image/*" onChange={handleUpload} className="hidden" />
          </label>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        ) : files.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">
            <ImageIcon className="w-12 h-12 mx-auto mb-4 opacity-30" />
            <p>No images uploaded yet</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            <AnimatePresence>
              {files.map((file, i) => (
                <motion.div
                  key={file.name}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className="group relative bg-card rounded-xl border overflow-hidden"
                >
                  <div className="aspect-square">
                    <img src={file.url} alt={file.name} className="w-full h-full object-cover" loading="lazy" />
                  </div>
                  <div className="absolute inset-0 bg-foreground/0 group-hover:bg-foreground/40 transition-colors flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                    <button onClick={() => copyUrl(file.url)} className="p-2 rounded-lg bg-background/80 hover:bg-background transition-colors active:scale-95">
                      <Copy className="w-4 h-4" />
                    </button>
                    <button onClick={() => setDeleteFile(file.name)} className="p-2 rounded-lg bg-background/80 hover:bg-background text-destructive transition-colors active:scale-95">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <p className="p-2 text-xs text-muted-foreground truncate">{file.name}</p>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </motion.div>

      <AlertDialog open={!!deleteFile} onOpenChange={() => setDeleteFile(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this image?</AlertDialogTitle>
            <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  );
}
