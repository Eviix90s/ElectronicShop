import type { MetadataRoute } from "next";
import { categories, products } from "@/lib/data";

const base = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticPages = ["", "/tienda", "/servicios", "/nosotros", "/preguntas-frecuentes", "/contacto"].map((p) => ({
    url: `${base}${p}`,
    changeFrequency: "weekly" as const,
    priority: p === "" ? 1 : 0.7,
  }));
  const categoryPages = categories.map((c) => ({
    url: `${base}/tienda?categoria=${c.slug}`,
    changeFrequency: "weekly" as const,
    priority: 0.6,
  }));
  const productPages = products.map((p) => ({
    url: `${base}/producto/${p.slug}`,
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));
  return [...staticPages, ...categoryPages, ...productPages];
}
