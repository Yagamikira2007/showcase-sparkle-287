import { useState } from "react";
import { useProducts } from "@/contexts/ProductContext";
import AdminLayout from "@/components/AdminLayout";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Pencil, Trash2, Tag } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function AdminCategories() {
  const { categories, addCategory, updateCategory, deleteCategory } = useProducts();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState("");

  const openAdd = () => {
    setEditingId(null);
    setName("");
    setDialogOpen(true);
  };

  const openEdit = (cat: { id: string; name: string }) => {
    setEditingId(cat.id);
    setName(cat.name);
    setDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return toast.error("Category name is required");
    if (editingId) {
      await updateCategory(editingId, name.trim());
      toast.success("Category updated");
    } else {
      await addCategory(name.trim());
      toast.success("Category added");
    }
    setDialogOpen(false);
  };

  const confirmDelete = async () => {
    if (deleteId) {
      await deleteCategory(deleteId);
      toast.success("Category deleted");
      setDeleteId(null);
    }
  };

  return (
    <AdminLayout>
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="font-display text-3xl font-bold tracking-tight mb-1">Categories</h1>
            <p className="text-muted-foreground">{categories.length} categories</p>
          </div>
          <Button onClick={openAdd} className="gradient-accent text-primary-foreground border-0 hover:opacity-90 active:scale-[0.97] transition-all">
            <Plus className="w-4 h-4 mr-2" />
            Add Category
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <AnimatePresence>
            {categories.map((cat, i) => (
              <motion.div
                key={cat.id}
                layout
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ delay: i * 0.05 }}
                className="bg-card rounded-xl p-5 border hover:shadow-md transition-shadow flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-accent/10 flex items-center justify-center">
                    <Tag className="w-4 h-4 text-accent" />
                  </div>
                  <span className="font-medium">{cat.name}</span>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => openEdit(cat)} className="p-2 rounded-lg hover:bg-muted transition-colors active:scale-95">
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button onClick={() => setDeleteId(cat.id)} className="p-2 rounded-lg hover:bg-destructive/10 text-destructive transition-colors active:scale-95">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </motion.div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="font-display">{editingId ? "Edit Category" : "Add Category"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Name</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Category name" required />
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
              <Button type="submit" className="gradient-accent text-primary-foreground border-0 hover:opacity-90">{editingId ? "Update" : "Add"}</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this category?</AlertDialogTitle>
            <AlertDialogDescription>Products in this category won't be deleted but will have no category.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  );
}
