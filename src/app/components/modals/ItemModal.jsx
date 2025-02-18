// components/modals/ItemModal.jsx
"use client";

import { useState } from "react";
import axios from "axios";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import SectionSelect from "../SectionSelect";

export default function ItemModal({
  isOpen,
  onClose,
  onSuccess,
  categoryId,
  sections,
  sectionId = null,
  item = null,
  mode = "create",
}) {
  const [formData, setFormData] = useState({
    name: item?.name || "",
    description: item?.description || "",
    price: item?.price || "",
    features: item?.features || [],
    fields: item?.fields || {},
  });
  const [newField, setNewField] = useState({ key: "", value: "" });
  const [newFeature, setNewFeature] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedSectionId, setSelectedSectionId] = useState(sectionId || "");
  const { toast } = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedSectionId) {
      toast({
        title: "Error",
        description: "Please select a section",
        variant: "destructive",
      });
      return;
    }
    setLoading(true);
    try {
      // Ensure price is a number
      const dataToSubmit = {
        ...formData,
        price: parseFloat(formData.price),
      };

      if (mode === "create") {
        await axios.post(
          `${process.env.NEXT_PUBLIC_URL}/api/users/add-item/${categoryId}/sections/${sectionId}/items`,
          dataToSubmit,
          { withCredentials: true }
        );
        toast({
          title: "Success",
          description: "Item created successfully",
        });
      } else {
        await axios.patch(
          `${process.env.NEXT_PUBLIC_URL}/api/users/update-item/${categoryId}/sections/${sectionId}/items/${item._id}`,
          dataToSubmit,
          { withCredentials: true }
        );
        toast({
          title: "Success",
          description: "Item updated successfully",
        });
      }
      onSuccess();
      onClose();
    } catch (error) {
      toast({
        title: "Error",
        description: error.response?.data?.message || `Failed to ${mode} item`,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const addField = () => {
    if (newField.key && newField.value) {
      setFormData({
        ...formData,
        fields: {
          ...formData.fields,
          [newField.key]: newField.value,
        },
      });
      setNewField({ key: "", value: "" });
    }
  };

  const removeField = (key) => {
    const newFields = { ...formData.fields };
    delete newFields[key];
    setFormData({ ...formData, fields: newFields });
  };

  const addFeature = () => {
    if (newFeature.trim()) {
      setFormData({
        ...formData,
        features: [...formData.features, newFeature.trim()],
      });
      setNewFeature("");
    }
  };

  const removeFeature = (index) => {
    const newFeatures = formData.features.filter((_, i) => i !== index);
    setFormData({ ...formData, features: newFeatures });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl h-[95vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {mode === "create" ? "Create New Item" : "Edit Item"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === "create" && (
            <SectionSelect
              sections={sections}
              value={selectedSectionId}
              onChange={setSelectedSectionId}
            />
          )}
          <div>
            <Label htmlFor="name">Item Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              placeholder="Enter item name"
              required
            />
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              placeholder="Enter item description"
              rows={3}
            />
          </div>

          <div>
            <Label htmlFor="price">Price</Label>
            <Input
              id="price"
              type="number"
              step="0.01"
              value={formData.price}
              onChange={(e) =>
                setFormData({ ...formData, price: e.target.value })
              }
              placeholder="Enter price"
              required
            />
          </div>

          {/* Features Section */}
          <div className="space-y-2">
            <Label>Features</Label>
            <div className="flex space-x-2">
              <Input
                placeholder="Add a feature"
                value={newFeature}
                onChange={(e) => setNewFeature(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addFeature();
                  }
                }}
              />
              <Button type="button" onClick={addFeature} variant="secondary">
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            {/* Display features */}
            <div className="mt-2 space-y-2">
              {formData.features.map((feature, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-2 bg-gray-50 rounded-md"
                >
                  <span>{feature}</span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeFeature(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>

          {/* Custom Fields Section */}
          <div className="space-y-2">
            <Label>Custom Fields</Label>
            <div className="flex space-x-2">
              <Input
                placeholder="Field name"
                value={newField.key}
                onChange={(e) =>
                  setNewField({ ...newField, key: e.target.value })
                }
              />
              <Input
                placeholder="Field value"
                value={newField.value}
                onChange={(e) =>
                  setNewField({ ...newField, value: e.target.value })
                }
              />
              <Button type="button" onClick={addField} variant="secondary">
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            {/* Display custom fields */}
            <div className="mt-2 space-y-2">
              {Object.entries(formData.fields).map(([key, value]) => (
                <div
                  key={key}
                  className="flex items-center justify-between p-2 bg-gray-50 rounded-md"
                >
                  <div>
                    <span className="font-medium">{key}:</span> {value}
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeField(key)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading
                ? `${mode === "create" ? "Creating" : "Saving"}...`
                : mode === "create"
                ? "Create Item"
                : "Save Changes"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
