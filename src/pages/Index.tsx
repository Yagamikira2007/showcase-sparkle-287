import { useProducts } from "@/contexts/ProductContext";
import UserLayout from "@/components/UserLayout";
import HeroSection from "@/components/HeroSection";
import ProductCard from "@/components/ProductCard";
import { motion } from "framer-motion";

export default function Index() {
  const { products } = useProducts();
  const featured = products.filter((p) => p.featured);

  return (
    <UserLayout>
      <HeroSection />

      <section className="py-16">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 16, filter: "blur(4px)" }}
            whileInView={{ opacity: 1, y: 0, filter: "blur(0)" }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          >
            <p className="text-sm font-medium uppercase tracking-widest text-accent mb-2">Featured</p>
            <h2 className="font-display text-3xl md:text-4xl font-bold tracking-tight mb-8">Editor's Picks</h2>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {featured.map((product, i) => (
              <ProductCard key={product.id} product={product} index={i} />
            ))}
          </div>
        </div>
      </section>
    </UserLayout>
  );
}
