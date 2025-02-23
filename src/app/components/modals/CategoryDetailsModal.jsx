"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DialogContent, DialogHeader } from "@/components/ui/dialog";
import { Dialog, DialogTitle } from "@radix-ui/react-dialog";
import axios from "axios";
import { Pencil, Plus, Trash2, ChevronDown, ChevronUp } from "lucide-react";
import React, { useEffect, useState } from "react";
import SectionModal from "./SectionModal";
import ItemModal from "./ItemModal";
import ItemFilters from "../filters/ItemFilters";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Link as LinkIcon } from "lucide-react";
import SampleModal from "./SampleModal";
import CollapsibleText from "../CollapsibleText";
import toast from "react-hot-toast";

export default function CategoryDetailsModal({
  category,
  isOpen,
  onClose,
  onSuccess,
}) {
  const [isAddSectionModalOpen, setIsAddSectionModalOpen] = useState(false);
  const [isEditSectionModalOpen, setIsEditSectionModalOpen] = useState(false);
  const [selectedSection, setSelectedSection] = useState(null);
  const [expandedSection, setExpandedSection] = useState(null);
  const [isAddItemModalOpen, setIsAddItemModalOpen] = useState(false);
  const [isEditItemModalOpen, setIsEditItemModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [selectedSectionId, setSelectedSectionId] = useState(null);
  const [isAddSampleModalOpen, setIsAddSampleModalOpen] = useState(false);
  const [isEditSampleModalOpen, setIsEditSampleModalOpen] = useState(false);
  const [selectedSample, setSelectedSample] = useState(null);
  const [sectionToDelete, setSectionToDelete] = useState(null);

  const [itemFilters, setItemFilters] = useState({
    search: "",
    minPrice: 0,
    maxPrice: 999999,
    features: [],
  });
  const [sortConfig, setSortConfig] = useState({
    field: "name",
    direction: "asc",
  });
  const [filteredItems, setFilteredItems] = useState({});

  const fetchCategoryData = async () => {
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_URL}/api/users/categories/${category._id}`,
        { withCredentials: true }
      );
      // Update the local category data
      if (onSuccess) {
        onSuccess(response.data.data);
      }
    } catch (error) {
      toast.error("Failed to refresh category data");
    }
  };

  // Add this useEffect to initialize filtered items when sections change
  useEffect(() => {
    const initialFilteredItems = {};
    category?.sections.forEach((section) => {
      initialFilteredItems[section._id] = filterAndSortItems(
        section.items,
        itemFilters,
        sortConfig
      );
    });
    setFilteredItems(initialFilteredItems);
  }, [category?.sections]);

  const handleFilterChange = (sectionId, newFilters) => {
    setItemFilters(newFilters);
    setFilteredItems((prev) => ({
      ...prev,
      [sectionId]: filterAndSortItems(
        category?.sections.find((s) => s._id === sectionId).items,
        newFilters,
        sortConfig
      ),
    }));
  };

  const handleSortChange = (sectionId, newSortConfig) => {
    setSortConfig(newSortConfig);
    setFilteredItems((prev) => ({
      ...prev,
      [sectionId]: filterAndSortItems(
        category?.sections.find((s) => s._id === sectionId).items,
        itemFilters,
        newSortConfig
      ),
    }));
  };

  const handleDeleteSection = async (sectionId) => {
    try {
      await axios.delete(
        `${process.env.NEXT_PUBLIC_URL}/api/users/delete-section/${category._id}/sections/${sectionId}`,
        { withCredentials: true }
      );
      toast.success("Section deleted successfully");

      // Fetch updated data
      if (onSuccess) {
        onSuccess();
      }

      await fetchCategoryData();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete section");
    }
  };

  const handleDeleteItem = async (sectionId, itemId) => {
    try {
      await axios.delete(
        `${process.env.NEXT_PUBLIC_URL}/api/users/delete-item/${category._id}/sections/${sectionId}/items/${itemId}`,
        { withCredentials: true }
      );
      toast.success("Item deleted successfully");
      onSuccess();

      await fetchCategoryData();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete item");
    }
  };

  // Add this function to handle sample deletion
  const handleDeleteSample = async (categoryId, sectionId, sampleId) => {
    try {
      await axios.delete(
        `${process.env.NEXT_PUBLIC_URL}/api/users/delete-sample/${categoryId}/sections/${sectionId}/samples/${sampleId}`,
        { withCredentials: true }
      );
      toast.success("Sample deleted successfully");
      onSuccess();

      await fetchCategoryData();
    } catch (error) {
      console.log(error);
      toast.error(error.response?.data?.message || "Failed to delete sample");
    }
  };

  const filterAndSortItems = (items, filters, sortConfig) => {
    let filteredItems = [...items];

    // Apply filters
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filteredItems = filteredItems.filter(
        (item) =>
          item.name.toLowerCase().includes(searchLower) ||
          item.description.toLowerCase().includes(searchLower)
      );
    }

    if (filters.minPrice !== undefined) {
      filteredItems = filteredItems.filter(
        (item) => item.price >= filters.minPrice
      );
    }

    if (filters.maxPrice !== undefined) {
      filteredItems = filteredItems.filter(
        (item) => item.price <= filters.maxPrice
      );
    }

    if (filters.features.length > 0) {
      filteredItems = filteredItems.filter((item) =>
        filters.features.every((feature) => item.features?.includes(feature))
      );
    }

    // Apply sorting
    filteredItems.sort((a, b) => {
      const multiplier = sortConfig.direction === "asc" ? 1 : -1;

      if (sortConfig.field === "price") {
        return (a.price - b.price) * multiplier;
      }

      // Default to name sorting
      return a.name.localeCompare(b.name) * multiplier;
    });

    return filteredItems;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl h-[80vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex justify-between items-center">
            <DialogTitle>{category?.name}</DialogTitle>
          </div>
        </DialogHeader>

        <Tabs defaultValue="sections" className="mt-6">
          <TabsList className="grid grid-cols-3 gap-4 mb-6">
            <TabsTrigger value="sections">Sections</TabsTrigger>
            <TabsTrigger value="items">Items</TabsTrigger>
            <TabsTrigger value="samples">Samples</TabsTrigger>
          </TabsList>

          {/* Sections Tab */}
          <TabsContent value="sections">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Sections</h2>
              <Button onClick={() => setIsAddSectionModalOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Add Section
              </Button>
            </div>
            <div className="space-y-4">
              {category?.sections?.map((section) => (
                <Card
                  key={section?._id}
                  className="relative overflow-hidden"
                  style={{
                    backgroundImage: section.image
                      ? `url(${section.image})`
                      : "none",
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                  }}
                >
                  <h1 className="text-white text-2xl font-bold ml-4 mt-4">
                    {section.title}
                  </h1>
                  {/* Add overlay if there's an image */}
                  {section.image && (
                    <div className="absolute inset-0 bg-black bg-opacity-50"></div>
                  )}
                  <CardHeader className="relative z-10">
                    {" "}
                    {/* z-10 to appear above overlay */}
                    <div className="flex justify-between items-start">
                      <div
                        className="flex items-center cursor-pointer"
                        onClick={() =>
                          setExpandedSection(
                            expandedSection === section._id ? null : section._id
                          )
                        }
                      >
                        {expandedSection === section._id ? (
                          <ChevronUp
                            className={`h-4 w-4 mr-2 ${
                              section.image ? "text-white" : ""
                            }`}
                          />
                        ) : (
                          <ChevronDown
                            className={`h-4 w-4 mr-2 ${
                              section.image ? "text-white" : ""
                            }`}
                          />
                        )}
                        <div>
                          <CardTitle
                            className={section.image ? "text-white" : ""}
                          >
                            {section.name}
                          </CardTitle>
                          {section.description && (
                            <p
                              className={`text-sm mt-1 ${
                                section.image
                                  ? "text-gray-200"
                                  : "text-gray-500"
                              }`}
                            >
                              {section.description}
                            </p>
                          )}
                          {section.additionalInfo && (
                            <div
                              className={`mt-4 ${
                                section.image ? "text-white" : "text-gray-700"
                              }`}
                            >
                              <h4
                                className={`text-sm font-medium mb-2 ${
                                  section.image ? "text-white" : "text-gray-900"
                                }`}
                              >
                                Additional Information
                              </h4>
                              <CollapsibleText
                                content={section.additionalInfo}
                              />
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedSection(section);
                            setIsEditSectionModalOpen(true);
                          }}
                        >
                          <Pencil className="h-4 w-4 mr-2" />
                          Edit
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            if (
                              window.confirm(
                                "Are you sure you want to delete this section?"
                              )
                            ) {
                              handleDeleteSection(section._id);
                            }
                          }}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Items Tab */}
          <TabsContent value="items">
            <div className="space-y-6">
              {category?.sections?.map((section) => (
                <div key={section._id}>
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold">{section.title}</h3>
                    <Button
                      onClick={() => {
                        setSelectedSectionId(section._id);
                        setIsAddItemModalOpen(true);
                      }}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add Item
                    </Button>
                  </div>

                  <ItemFilters
                    items={section.items}
                    onFilterChange={(filters) =>
                      handleFilterChange(section._id, filters)
                    }
                    onSortChange={(sortConfig) =>
                      handleSortChange(section._id, sortConfig)
                    }
                    minPrice={Math.min(
                      ...section.items.map((item) => item.price)
                    )}
                    maxPrice={Math.max(
                      ...section.items.map((item) => item.price)
                    )}
                  />

                  {section.items?.length > 0 ? (
                    <div className="grid gap-4">
                      {filteredItems[section._id]?.map((item) => (
                        <div
                          key={item._id}
                          className="p-4 bg-gray-50 rounded-lg"
                        >
                          <div className="flex justify-between items-start">
                            <div className="space-y-2 flex-1">
                              <div className="flex justify-between items-start">
                                <h4 className="font-medium">{item.name}</h4>
                                <span className="text-sm font-medium text-green-600">
                                  ₵{parseFloat(item.price)}
                                </span>
                              </div>
                              {item.description && (
                                <p className="text-sm text-gray-500">
                                  {item.description}
                                </p>
                              )}
                              {item.features?.length > 0 && (
                                <div className="mt-2">
                                  <h5 className="text-sm font-medium mb-1">
                                    Features:
                                  </h5>
                                  <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                                    {item.features.map((feature, index) => (
                                      <li key={index}>{feature}</li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                              {Object.entries(item.fields || {}).length > 0 && (
                                <div className="mt-2 grid grid-cols-2 gap-2">
                                  {Object.entries(item.fields).map(
                                    ([key, value]) => (
                                      <div key={key} className="text-sm">
                                        <span className="font-medium">
                                          {key}:
                                        </span>{" "}
                                        {value}
                                      </div>
                                    )
                                  )}
                                </div>
                              )}
                            </div>
                            <div className="flex space-x-2 ml-4">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setSelectedItem(item);
                                  setSelectedSectionId(section._id);
                                  setIsEditItemModalOpen(true);
                                }}
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() =>
                                  handleDeleteItem(section._id, item._id)
                                }
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-center text-gray-500 py-4">
                      No items in this section yet
                    </p>
                  )}
                </div>
              ))}
            </div>
          </TabsContent>

          {/* Samples Tab */}
          <TabsContent value="samples">
            <div className="space-y-6">
              {category?.sections?.map((section) => (
                <div key={section._id}>
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold">{section.title}</h3>
                    <Button
                      onClick={() => {
                        setSelectedSectionId(section._id);
                        setIsAddSampleModalOpen(true);
                      }}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add Sample
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {section.samples?.map((sample) => (
                      <Card
                        key={sample._id}
                        className="relative overflow-hidden"
                        style={{
                          backgroundImage: sample.image
                            ? `url(${sample.image})`
                            : "none",
                          backgroundSize: "cover",
                          backgroundPosition: "center",
                        }}
                      >
                        {/* Background overlay */}
                        {sample.imageUrl && (
                          <div className="absolute inset-0 bg-black bg-opacity-50"></div>
                        )}
                        <CardHeader className="relative z-10">
                          <div className="flex justify-between items-start">
                            <CardTitle
                              className={
                                sample.imageUrl ? "text-white" : "text-black"
                              }
                            >
                              {sample.name}
                            </CardTitle>
                            <div className="flex space-x-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setSelectedSample(sample);
                                  setSelectedSectionId(section._id);
                                  setIsEditSampleModalOpen(true);
                                }}
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() =>
                                  handleDeleteSample(
                                    category._id,
                                    section._id,
                                    sample._id
                                  )
                                }
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent className="relative z-10">
                          {sample.description && (
                            <p
                              className={`text-sm mb-4 ${
                                sample.imageUrl
                                  ? "text-gray-200"
                                  : "text-gray-500"
                              }`}
                            >
                              {sample.description}
                            </p>
                          )}

                          {/* Links */}
                          {sample.links?.length > 0 && (
                            <div className="flex flex-wrap gap-2 mb-4">
                              {sample.links.map((link, index) => (
                                <a
                                  key={index}
                                  href={link.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm hover:bg-blue-200"
                                >
                                  <LinkIcon className="h-3 w-3 mr-1" />
                                  {link.title}
                                </a>
                              ))}
                            </div>
                          )}

                          {/* Preview Button */}
                          {sample.preview && (
                            <Button
                              variant="outline"
                              size="sm"
                              className={`mt-2 ${
                                sample.imageUrl
                                  ? "bg-white hover:bg-gray-100"
                                  : ""
                              }`}
                              onClick={() =>
                                window.open(sample.preview, "_blank")
                              }
                            >
                              <LinkIcon className="h-4 w-4 mr-2" />
                              Open Preview
                            </Button>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>

        {/* Existing Section and Item Modals */}
        {/* ... your existing modal code ... */}

        {/* Section Modals */}
        <SectionModal
          isOpen={isAddSectionModalOpen}
          onClose={() => setIsAddSectionModalOpen(false)}
          onSuccess={onSuccess}
          categoryId={category?._id}
          mode="create"
        />

        {selectedSection && (
          <SectionModal
            isOpen={isEditSectionModalOpen}
            onClose={() => {
              setIsEditSectionModalOpen(false);
              setSelectedSection(null);
            }}
            onSuccess={onSuccess}
            categoryId={category?._id}
            section={selectedSection}
            mode="edit"
          />
        )}

        {/* Item Modals */}
        {selectedSectionId && (
          <>
            <ItemModal
              isOpen={isAddItemModalOpen}
              onClose={() => {
                setIsAddItemModalOpen(false);
                setSelectedSectionId(null);
              }}
              onSuccess={onSuccess}
              categoryId={category._id}
              sections={category.sections}
              sectionId={selectedSectionId}
              mode="create"
            />

            {selectedItem && (
              <ItemModal
                isOpen={isEditItemModalOpen}
                onClose={() => {
                  setIsEditItemModalOpen(false);
                  setSelectedSectionId(null);
                  setSelectedItem(null);
                }}
                onSuccess={onSuccess}
                categoryId={category._id}
                sectionId={selectedSectionId}
                item={selectedItem}
                mode="edit"
              />
            )}
          </>
        )}

        {/* Sample Modals */}
        {selectedSectionId && (
          <>
            <SampleModal
              isOpen={isAddSampleModalOpen}
              onClose={() => {
                setIsAddSampleModalOpen(false);
                setSelectedSectionId(null);
              }}
              onSuccess={onSuccess}
              categoryId={category._id}
              sections={category.sections} // Pass all sections
              sectionId={selectedSectionId}
              mode="create"
            />

            {selectedSample && (
              <SampleModal
                isOpen={isEditSampleModalOpen}
                onClose={() => {
                  setIsEditSampleModalOpen(false);
                  setSelectedSectionId(null);
                  setSelectedSample(null);
                }}
                onSuccess={onSuccess}
                categoryId={category._id}
                sectionId={selectedSectionId}
                sample={selectedSample}
                mode="edit"
              />
            )}
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
