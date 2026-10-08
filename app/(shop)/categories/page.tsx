import CategoryList from "@/components/shop/CategoryList";
import ProductGrid from "@/components/shop/ProductGrid";

export default function CategoriesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
          หมวดหมู่สินค้าดิจิทัล
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          เลือกหมวดหมู่ที่สนใจเพื่อค้นหาสินค้า E-Book, Template, คอร์สออนไลน์ และซอฟต์แวร์
        </p>
      </div>
      <CategoryList />
      <ProductGrid />
    </div>
  );
}
