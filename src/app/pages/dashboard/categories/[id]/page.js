// app/pages/categories/[id].js
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import api from "@/lib/axios";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export default function CategoryDetailsPage() {
  const [category, setCategory] = useState(null);
  const router = useRouter();
  const { id } = router.query;

  useEffect(() => {
    const fetchCategory = async () => {
      try {
        const response = await api.get(`/api/users/categories/${id}`);
        setCategory(response.data.data);
      } catch (error) {
        console.error("Error fetching category:", error);
      }
    };

    if (id) {
      fetchCategory();
    }
  }, [id]);

  if (!category) {
    return <div>Loading...</div>;
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-3xl font-bold">{category.name}</h2>
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Add Section
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {category.sections.map((section) => (
            <Card key={section._id}>
              <CardHeader>
                <CardTitle>{section.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2">Items</h4>
                    {section.items.map((item) => (
                      <div key={item._id} className="p-2 bg-gray-50 rounded">
                        {item.name}
                      </div>
                    ))}
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Samples</h4>
                    {section.samples.map((sample) => (
                      <div key={sample._id} className="p-2 bg-gray-50 rounded">
                        {sample.name}
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
