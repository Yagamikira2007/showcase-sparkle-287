import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Product, Category } from "@/data/products";

interface ProductContextType {
  products: Product[];
  categories: Category[];
  loading: boolean;
  addProduct: (product: Omit<Product, "id" | "created_at" | "updated_at">) => Promise<void>;
  updateProduct: (id: string, product: Partial<Product>) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  getProduct: (id: string) => Product | undefined;
  addCategory: (name: string) => Promise<void>;
  updateCategory: (id: string, name: string) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;
  refreshProducts: () => Promise<void>;
  refreshCategories: () => Promise<void>;
}

const ProductContext = createContext<ProductContextType | null>(null);

export function ProductProvider({ children }: { children: ReactNode }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  const refreshProducts = useCallback(async () => {
    const { data } = await supabase
      .from("products")
      .select("*")
      .order("created_at", { ascending: false });
    if (data) setProducts(data);
  }, []);

  const refreshCategories = useCallback(async () => {
    const { data } = await supabase
      .from("categories")
      .select("*")
      .order("name");
    if (data) setCategories(data);
  }, []);

  useEffect(() => {
    Promise.all([refreshProducts(), refreshCategories()]).then(() => setLoading(false));
  }, [refreshProducts, refreshCategories]);

  const addProduct = async (product: Omit<Product, "id" | "created_at" | "updated_at">) => {
    await supabase.from("products").insert(product);
    await refreshProducts();
  };

  const updateProduct = async (id: string, updates: Partial<Product>) => {
    await supabase.from("products").update(updates).eq("id", id);
    await refreshProducts();
  };

  const deleteProduct = async (id: string) => {
    await supabase.from("products").delete().eq("id", id);
    await refreshProducts();
  };

  const getProduct = (id: string) => products.find((p) => p.id === id);

  const addCategory = async (name: string) => {
    await supabase.from("categories").insert({ name });
    await refreshCategories();
  };

  const updateCategory = async (id: string, name: string) => {
    await supabase.from("categories").update({ name }).eq("id", id);
    await refreshCategories();
  };

  const deleteCategory = async (id: string) => {
    await supabase.from("categories").delete().eq("id", id);
    await refreshCategories();
  };

  return (
    <ProductContext.Provider value={{
      products, categories, loading,
      addProduct, updateProduct, deleteProduct, getProduct,
      addCategory, updateCategory, deleteCategory,
      refreshProducts, refreshCategories,
    }}>
      {children}
    </ProductContext.Provider>
  );
}

export const useProducts = () => {
  const ctx = useContext(ProductContext);
  if (!ctx) throw new Error("useProducts must be used within ProductProvider");
  return ctx;
};
