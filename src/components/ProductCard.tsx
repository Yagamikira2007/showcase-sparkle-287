import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Product } from "@/data/products";
import { Star } from "lucide-react";

interface ProductCardProps {
  product: Product;
  index: number;
}

export default function ProductCard({ product, index }: ProductCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16, filter: "blur(4px)" }}
      whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.5, delay: index * 0.08, ease: [0.16, 1, 0.3, 1] }}
    >
      <Link to={`/product/${product.id}`} className="group block">
        <div className="relative overflow-hidden rounded-xl bg-card shadow-sm hover:shadow-lg transition-shadow duration-300">
          <div className="aspect-[4/3] overflow-hidden bg-muted">
            <img
              src={product.images[0]}
              alt={product.name}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              loading="lazy"
            />
          </div>

          {product.featured && (
            <div className="absolute top-3 left-3 flex items-center gap-1 gradient-accent text-primary-foreground text-xs font-medium px-2.5 py-1 rounded-full">
              <Star className="w-3 h-3" />
              Featured
            </div>
          )}

          {!product.inStock && (
            <div className="absolute top-3 right-3 bg-foreground/80 text-primary-foreground text-xs font-medium px-2.5 py-1 rounded-full">
              Out of Stock
            </div>
          )}

          <div className="p-4">
            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">{product.category}</p>
            <h3 className="font-display text-lg font-semibold leading-snug mb-1 group-hover:text-accent transition-colors">
              {product.name}
            </h3>
            <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{product.description}</p>
            {product.price && (
              <p className="text-lg font-semibold tabular-nums">${product.price}</p>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
