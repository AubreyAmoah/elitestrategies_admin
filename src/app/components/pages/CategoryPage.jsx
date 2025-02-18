"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import axios from "axios";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { FolderTree, FileText, Package, MenuIcon } from "lucide-react";
import CategoryDetailsModal from "../modals/CategoryDetailsModal";
import DeleteConfirmModal from "../modals/DeleteConfirmModal";
import EditCategoryModal from "../modals/EditCategoryModal";
import CategorySkeleton from "../skeletons/CategorySkeleton";
import CreateCategoryModal from "../modals/CreateCategoryModal";
import { useToast } from "@/hooks/use-toast";

const CategoryPage = () => {
  const [categories, setCategories] = useState([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const fetchCategories = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_URL}/api/users/categories`,
        { withCredentials: true }
      );
      console.log(response);
      setCategories(response.data.data);
    } catch (error) {
      console.error("Error fetching categories:", error);
    } finally {
      setLoading(false);
    }
  };
  const handleViewDetails = (category) => {
    setSelectedCategory(category);
    setIsModalOpen(true);
  };

  const handleEdit = (category) => {
    setSelectedCategory(category);
    setIsEditModalOpen(true);
  };

  const handleDelete = (category) => {
    setSelectedCategory(category);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    setLoading(true);
    try {
      await axios.delete(
        `${process.env.NEXT_PUBLIC_URL}/api/users/categories/${selectedCategory._id}`,
        { withCredentials: true }
      );
      toast({
        title: "Success",
        description: "Category deleted successfully",
      });
      fetchCategories(); // Refresh the list
      setIsDeleteModalOpen(false);
      setSelectedCategory(null);
    } catch (error) {
      toast({
        title: "Error",
        description:
          error.response?.data?.message || "Failed to delete category",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);
  return (
    <>
      {/* Main Content */}
      <div className="lg:ml-64 p-6">
        <div className="mb-8 flex justify-between items-center">
          <h2 className="text-3xl font-bold">Overview</h2>
          <Button onClick={() => setIsCreateModalOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            New Category
          </Button>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Card>
              <CardHeader>
                <CardTitle>Total Categories</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{categories.length}</p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Card>
              <CardHeader>
                <CardTitle>Total Sections</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">
                  {categories.reduce(
                    (acc, cat) => acc + cat.sections.length,
                    0
                  )}
                </p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Card>
              <CardHeader>
                <CardTitle>Total Items</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">
                  {categories.reduce(
                    (acc, cat) =>
                      acc +
                      cat.sections.reduce(
                        (secAcc, sec) => secAcc + sec.items.length,
                        0
                      ),
                    0
                  )}
                </p>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Recent Categories */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Recent Categories</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {loading ? (
                // Show 3 skeleton loaders while loading
                <>
                  <CategorySkeleton />
                  <CategorySkeleton />
                  <CategorySkeleton />
                </>
              ) : (
                // Show actual categories when loaded
                categories.map((category) => (
                  <motion.div
                    key={category._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 bg-gray-50 rounded-lg flex justify-between items-center"
                  >
                    <div>
                      <h3 className="font-semibold">{category.name}</h3>
                      <p className="text-sm text-gray-500">
                        {category.sections?.length || 0} sections
                      </p>
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(category)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(category)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        onClick={() => handleViewDetails(category)}
                      >
                        View Details
                      </Button>
                    </div>
                  </motion.div>
                ))
              )}

              {/* Show message if no categories and not loading */}
              {!loading && categories.length === 0 && (
                <div className="text-center py-8">
                  <p className="text-gray-500">
                    No categories found. Create one to get started!
                  </p>
                </div>
              )}
            </div>

            {/* Add CreateCategoryModal */}
            <CreateCategoryModal
              isOpen={isCreateModalOpen}
              onClose={() => setIsCreateModalOpen(false)}
              onSuccess={fetchCategories}
            />
            <CategoryDetailsModal
              category={selectedCategory}
              isOpen={isModalOpen}
              onClose={() => setIsModalOpen(false)}
              onSuccess={fetchCategories}
            />
            {selectedCategory && (
              <>
                <EditCategoryModal
                  category={selectedCategory}
                  isOpen={isEditModalOpen}
                  onClose={() => {
                    setIsEditModalOpen(false);
                    setSelectedCategory(null);
                  }}
                  onSuccess={fetchCategories}
                />
                <DeleteConfirmModal
                  isOpen={isDeleteModalOpen}
                  onClose={() => {
                    setIsDeleteModalOpen(false);
                    setSelectedCategory(null);
                  }}
                  onConfirm={handleDeleteConfirm}
                  title="Delete Category"
                  description="Are you sure you want to delete this category? This action cannot be undone."
                />
              </>
            )}
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {categories.slice(0, 3).map((category) => (
                <div key={category._id} className="flex items-center space-x-4">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <div>
                    <p className="text-sm">
                      New category "{category.name}" was created
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date().toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default CategoryPage;
