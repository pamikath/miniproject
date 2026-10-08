"use client";

import HeroBanner from "@/components/shop/HeroBanner";
import CategoryList from "@/components/shop/CategoryList";
import ProductGrid from "@/components/shop/ProductGrid";

export default function HomePage() {
  return (
    <div className="space-y-6">
      <HeroBanner />
      <CategoryList />
      <ProductGrid />
    </div>
  );
}
