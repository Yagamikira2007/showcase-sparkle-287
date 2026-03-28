import { useParams, Link } from "react-router-dom";
import { useProducts } from "@/contexts/ProductContext";
import UserLayout from "@/components/UserLayout";
import { motion } from "framer-motion";
import { ArrowLeft, Star, MessageCircle, Send } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const { getProduct } = useProducts();
  const product = getProduct(id!);

  if (!product) {
    return (
      <UserLayout>
        <div className="container py-24 text-center">
          <h1 className="font-display text-3xl font-bold mb-4">Product Not Found</h1>
          <Link to="/products" className="text-accent hover:underline">Back to products</Link>
        </div>
      </UserLayout>
    );
  }

  const contactMessage = encodeURIComponent(`Hello, I'm interested in ${product.name}`);

  return (
    <UserLayout>
      <section className="py-12">
        <div className="container">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
            <Link to="/products" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8">
              <ArrowLeft className="w-4 h-4" />
              Back to products
            </Link>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
            <motion.div
              initial={{ opacity: 0, x: -20, filter: "blur(4px)" }}
              animate={{ opacity: 1, x: 0, filter: "blur(0)" }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="aspect-square rounded-2xl overflow-hidden bg-muted"
            >
              <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20, filter: "blur(4px)" }}
              animate={{ opacity: 1, x: 0, filter: "blur(0)" }}
              transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
              className="flex flex-col justify-center"
            >
              <p className="text-xs uppercase tracking-widest text-accent font-medium mb-2">{product.category}</p>
              <h1 className="font-display text-3xl md:text-4xl font-bold tracking-tight mb-4 leading-tight">{product.name}</h1>

              <div className="flex items-center gap-3 mb-4">
                {product.featured && (
                  <span className="inline-flex items-center gap-1 gradient-accent text-primary-foreground text-xs font-medium px-2.5 py-1 rounded-full">
                    <Star className="w-3 h-3" /> Featured
                  </span>
                )}
                <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${product.in_stock ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"}`}>
                  {product.in_stock ? "In Stock" : "Out of Stock"}
                </span>
              </div>

              {product.price && (
                <p className="text-3xl font-bold tabular-nums mb-6">${product.price}</p>
              )}

              <p className="text-muted-foreground leading-relaxed mb-8">{product.description}</p>

              <div className="space-y-3">
                <p className="text-sm font-medium text-muted-foreground">Contact the seller</p>
                <div className="flex flex-wrap gap-3">
                  {product.social_whatsapp && (
                    <Button asChild variant="outline" className="active:scale-95 transition-transform">
                      <a href={`${product.social_whatsapp}?text=${contactMessage}`} target="_blank" rel="noopener noreferrer">
                        <MessageCircle className="w-4 h-4 mr-2" />
                        WhatsApp
                      </a>
                    </Button>
                  )}
                  {product.social_telegram && (
                    <Button asChild variant="outline" className="active:scale-95 transition-transform">
                      <a href={product.social_telegram} target="_blank" rel="noopener noreferrer">
                        <Send className="w-4 h-4 mr-2" />
                        Telegram
                      </a>
                    </Button>
                  )}
                  {product.social_messenger && (
                    <Button asChild variant="outline" className="active:scale-95 transition-transform">
                      <a href={product.social_messenger} target="_blank" rel="noopener noreferrer">
                        <MessageCircle className="w-4 h-4 mr-2" />
                        Messenger
                      </a>
                    </Button>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </UserLayout>
  );
}
