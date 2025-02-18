// app/pages/categories/new.js
import DashboardLayout from "@/components/layouts/DashboardLayout";
import CategoryForm from "@/components/categories/CategoryForm";

export default function NewCategoryPage() {
  return (
    <DashboardLayout>
      <CategoryForm />
    </DashboardLayout>
  );
}
