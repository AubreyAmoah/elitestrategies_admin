// app/pages/categories/index.js
import DashboardLayout from "@/app/components/layouts/DashboardLayout";
import CategoryList from "@/app/components/category/CategoryList";

export default function CategoriesPage() {
  return (
    <DashboardLayout>
      <CategoryList />
    </DashboardLayout>
  );
}
