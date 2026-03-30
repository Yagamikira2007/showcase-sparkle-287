import { useState } from "react";
import { useProducts } from "@/contexts/ProductContext";
import AdminLayout from "@/components/AdminLayout";
import { motion, AnimatePresence, Reorder } from "framer-motion";
import { Plus, Pencil, Trash2, Search, GripVertical } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import type { Product } from "@/data/products";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface ProductForm {
  name: string;
  description: string;
  category: string;
  price: number | null;
  images: string[];
  featured: boolean;
  in_stock: boolean;
  sort_order: number;
  social_telegram: string;
  social_whatsapp: string;
  social_messenger: string;
}

const emptyForm: ProductForm = {
  name: "",
  description: "",
  category: "",
  price: null,
  images: [""],
  featured: false,
  in_stock: true,
  sort_order: 0,
  social_telegram: "",
  social_whatsapp: "",
  social_messenger: "",
};

export default function AdminProducts() {
  const { products, categories, addProduct, updateProduct, deleteProduct, reorderProducts } = useProducts();
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<ProductForm>(emptyForm);
  const [reorderMode, setReorderMode] = useState(false);
  const [orderedIds, setOrderedIds] = useState<string[]>([]);

  const filtered = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  const openAdd = () => {
    setEditingId(null);
    setForm({ ...emptyForm, category: categories[0]?.name || "", sort_order: products.length });
    setDialogOpen(true);
  };

  const openEdit = (product: Product) => {
    setEditingId(product.id);
    setForm({
      name: product.name,
      description: product.description,
      category: product.category,
      price: product.price,
      images: product.images.length ? product.images : [""],
      featured: product.featured,
      in_stock: product.in_stock,
      sort_order: product.sort_order,
      social_telegram: product.social_telegram || "",
      social_whatsapp: product.social_whatsapp || "",
      social_messenger: product.social_messenger || "",
    });
    setDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleaned = {
      ...form,
      images: form.images.filter(Boolean),
      social_telegram: form.social_telegram || null,
      social_whatsapp: form.social_whatsapp || null,
      social_messenger: form.social_messenger || null,
    };
    if (!cleaned.name.trim()) return toast.error("Product name is required");
    if (cleaned.images.length === 0) cleaned.images = ["https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&q=80"];

    if (editingId) {
      await updateProduct(editingId, cleaned);
      toast.success("Product updated");
    } else {
      await addProduct(cleaned);
      toast.success("Product added");
    }
    setDialogOpen(false);
  };

  const confirmDelete = async () => {
    if (deleteId) {
      await deleteProduct(deleteId);
      toast.success("Product deleted");
      setDeleteId(null);
    }
  };

  const startReorder = () => {
    setReorderMode(true);
    setOrderedIds(products.map((p) => p.id));
  };

  const saveOrder = async () => {
    await reorderProducts(orderedIds);
    toast.success("Order saved");
    setReorderMode(false);
  };

  return (
    <AdminLayout>
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="font-display text-3xl font-bold tracking-tight mb-1">Products</h1>
            <p className="text-muted-foreground">{products.length} products in catalog</p>
          </div>
          <div className="flex gap-2">
            {reorderMode ? (
              <>
                <Button variant="outline" onClick={() => setReorderMode(false)}>Cancel</Button>
                <Button onClick={saveOrder} className="gradient-accent text-primary-foreground border-0">Save Order</Button>
              </>
            ) : (
              <>
                <Button variant="outline" onClick={startReorder} disabled={products.length < 2}>
                  <GripVertical className="w-4 h-4 mr-2" />
                  Reorder
                </Button>
                <Button onClick={openAdd} className="gradient-accent text-primary-foreground border-0 hover:opacity-90 active:scale-[0.97] transition-all">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Product
                </Button>
              </>
            )}
          </div>
        </div>

        {!reorderMode && (
          <div className="relative max-w-sm mb-6">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Search..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
          </div>
        )}

        {reorderMode ? (
          <Reorder.Group axis="y" values={orderedIds} onReorder={setOrderedIds} className="space-y-2">
            {orderedIds.map((id) => {
              const product = products.find((p) => p.id === id);
              if (!product) return null;
              return (
                <Reorder.Item key={id} value={id} className="bg-card rounded-xl p-4 border cursor-grab active:cursor-grabbing flex items-center gap-4 hover:shadow-md transition-shadow">
                  <GripVertical className="w-5 h-5 text-muted-foreground shrink-0" />
                  <img src={product.images[0]} alt="" className="w-12 h-12 rounded-lg object-cover bg-muted shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="font-medium truncate">{product.name}</p>
                    <p className="text-xs text-muted-foreground">{product.category}</p>
                  </div>
                </Reorder.Item>
              );
            })}
          </Reorder.Group>
        ) : (
          <div className="bg-card rounded-xl border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="text-left p-3 font-medium text-muted-foreground">Product</th>
                    <th className="text-left p-3 font-medium text-muted-foreground hidden sm:table-cell">Category</th>
                    <th className="text-left p-3 font-medium text-muted-foreground hidden md:table-cell">Price</th>
                    <th className="text-left p-3 font-medium text-muted-foreground hidden md:table-cell">Status</th>
                    <th className="text-right p-3 font-medium text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <AnimatePresence>
                    {filtered.map((product) => (
                      <motion.tr
                        key={product.id}
                        layout
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="border-b last:border-0 hover:bg-muted/30 transition-colors"
                      >
                        <td className="p-3">
                          <div className="flex items-center gap-3">
                            <img src={product.images[0]} alt="" className="w-10 h-10 rounded-lg object-cover bg-muted shrink-0" />
                            <div className="min-w-0">
                              <p className="font-medium truncate">{product.name}</p>
                              {product.featured && <span className="text-xs text-accent">⭐ Featured</span>}
                            </div>
                          </div>
                        </td>
                        <td className="p-3 text-muted-foreground hidden sm:table-cell">{product.category}</td>
                        <td className="p-3 tabular-nums hidden md:table-cell">{product.price ? `$${product.price}` : "—"}</td>
                        <td className="p-3 hidden md:table-cell">
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${product.in_stock ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"}`}>
                            {product.in_stock ? "In Stock" : "Out of Stock"}
                          </span>
                        </td>
                        <td className="p-3">
                          <div className="flex justify-end gap-1">
                            <button onClick={() => openEdit(product)} className="p-2 rounded-lg hover:bg-muted transition-colors active:scale-95">
                              <Pencil className="w-4 h-4" />
                            </button>
                            <button onClick={() => setDeleteId(product.id)} className="p-2 rounded-lg hover:bg-destructive/10 text-destructive transition-colors active:scale-95">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                </tbody>
              </table>
            </div>
          </div>
        )}
      </motion.div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-display">{editingId ? "Edit Product" : "Add Product"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Name</Label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Category</Label>
                <select
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                >
                  {categories.map((cat) => <option key={cat.id} value={cat.name}>{cat.name}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <Label>Price</Label>
                <Input type="number" value={form.price ?? ""} onChange={(e) => setForm({ ...form, price: e.target.value ? Number(e.target.value) : null })} placeholder="Optional" />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Image URL</Label>
              <Input value={form.images[0]} onChange={(e) => setForm({ ...form, images: [e.target.value] })} placeholder="https://..." />
            </div>
            <div className="flex items-center justify-between">
              <Label>Featured</Label>
              <Switch checked={form.featured} onCheckedChange={(v) => setForm({ ...form, featured: v })} />
            </div>
            <div className="flex items-center justify-between">
              <Label>In Stock</Label>
              <Switch checked={form.in_stock} onCheckedChange={(v) => setForm({ ...form, in_stock: v })} />
            </div>

            <div className="space-y-2 border-t pt-4">
              <Label className="text-muted-foreground">Social Links</Label>
              <Input placeholder="Telegram URL" value={form.social_telegram} onChange={(e) => setForm({ ...form, social_telegram: e.target.value })} />
              <Input placeholder="WhatsApp URL" value={form.social_whatsapp} onChange={(e) => setForm({ ...form, social_whatsapp: e.target.value })} />
              <Input placeholder="Messenger URL" value={form.social_messenger} onChange={(e) => setForm({ ...form, social_messenger: e.target.value })} />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
              <Button type="submit" className="gradient-accent text-primary-foreground border-0 hover:opacity-90">{editingId ? "Update" : "Add"}</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this product?</AlertDialogTitle>
            <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
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
