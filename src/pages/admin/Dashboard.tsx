import { useProducts } from "@/contexts/ProductContext";
import AdminLayout from "@/components/AdminLayout";
import { motion } from "framer-motion";
import { Package, Star, TrendingUp, AlertTriangle } from "lucide-react";

export default function AdminDashboard() {
  const { products } = useProducts();
  const featured = products.filter((p) => p.featured).length;
  const outOfStock = products.filter((p) => !p.in_stock).length;

  const stats = [
    { label: "Total Products", value: products.length, icon: Package, color: "bg-blue-50 text-blue-600" },
    { label: "Featured", value: featured, icon: Star, color: "bg-amber-50 text-amber-600" },
    { label: "In Stock", value: products.length - outOfStock, icon: TrendingUp, color: "bg-emerald-50 text-emerald-600" },
    { label: "Out of Stock", value: outOfStock, icon: AlertTriangle, color: "bg-red-50 text-red-600" },
  ];

  return (
    <AdminLayout>
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <h1 className="font-display text-3xl font-bold tracking-tight mb-1">Dashboard</h1>
        <p className="text-muted-foreground mb-8">Overview of your product catalog</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 12, filter: "blur(4px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0)" }}
              transition={{ duration: 0.5, delay: i * 0.08, ease: [0.16, 1, 0.3, 1] }}
              className="bg-card rounded-xl p-5 shadow-sm border hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-muted-foreground">{stat.label}</span>
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${stat.color}`}>
                  <stat.icon className="w-4 h-4" />
                </div>
              </div>
              <p className="text-3xl font-bold tabular-nums">{stat.value}</p>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </AdminLayout>
  );
}
