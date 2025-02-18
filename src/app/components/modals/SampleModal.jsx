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
import { Plus, X, Link as LinkIcon, Image as ImageIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import SectionSelect from "../SectionSelect";

export default function SampleModal({
  isOpen,
  onClose,
  onSuccess,
  categoryId,
  sections,
  sectionId = null,
  sample = null,
  mode = "create",
}) {
  const [formData, setFormData] = useState({
    name: sample?.name || "",
    description: sample?.description || "",
    image: sample?.image || "",
    preview: sample?.preview || "",
    links: sample?.links || [],
  });

  const [imagePreview, setImagePreview] = useState(sample?.image || "");
  const [newLink, setNewLink] = useState({ title: "", url: "" });
  const [newImage, setNewImage] = useState({ url: "", caption: "" });
  const [loading, setLoading] = useState(false);
  const [selectedSectionId, setSelectedSectionId] = useState(sectionId || "");
  const { toast } = useToast();

  const handleImageUrlChange = (e) => {
    const url = e.target.value;
    setFormData({ ...formData, image: url });
    setImagePreview(url);
  };

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
      if (mode === "create") {
        await axios.post(
          `/api/users/add-sample/${categoryId}/sections/${sectionId}/samples`,
          formData
        );
        toast({
          title: "Success",
          description: "Sample created successfully",
        });
      } else {
        await axios.patch(
          `/api/users/update-sample/${categoryId}/sections/${sectionId}/samples/${sample._id}`,
          formData
        );
        toast({
          title: "Success",
          description: "Sample updated successfully",
        });
      }
      onSuccess();
      onClose();
    } catch (error) {
      toast({
        title: "Error",
        description:
          error.response?.data?.message || `Failed to ${mode} sample`,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const addLink = () => {
    if (newLink.title && newLink.url) {
      setFormData({
        ...formData,
        links: [...formData.links, newLink],
      });
      setNewLink({ title: "", url: "" });
    }
  };

  const removeLink = (index) => {
    setFormData({
      ...formData,
      links: formData.links.filter((_, i) => i !== index),
    });
  };

  const addImage = () => {
    if (newImage.url && newImage.caption) {
      setFormData({
        ...formData,
        images: [...formData.image, newImage],
      });
      setNewImage({ url: "", caption: "" });
    }
  };

  const removeImage = (index) => {
    setFormData({
      ...formData,
      images: formData.image.filter((_, i) => i !== index),
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {mode === "create" ? "Create New Sample" : "Edit Sample"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          {mode === "create" && (
            <SectionSelect
              sections={sections}
              value={selectedSectionId}
              onChange={setSelectedSectionId}
            />
          )}
          <div>
            <Label htmlFor="name">Sample Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              placeholder="Enter sample name"
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
              placeholder="Enter sample description"
              rows={3}
            />
          </div>

          <div>
            <Label htmlFor="imageUrl">Background Image URL</Label>
            <Input
              id="imageUrl"
              value={formData.image}
              onChange={handleImageUrlChange}
              placeholder="Enter image URL"
            />
          </div>

          {/* Image Preview */}
          {imagePreview && (
            <div className="relative w-full h-40 rounded-lg overflow-hidden">
              <img
                src={imagePreview}
                alt="Preview"
                className="w-full h-full object-cover"
                onError={() => setImagePreview("")}
              />
            </div>
          )}

          <div>
            <Label htmlFor="preview">Preview Link</Label>
            <Input
              id="preview"
              value={formData.preview}
              onChange={(e) =>
                setFormData({ ...formData, preview: e.target.value })
              }
              placeholder="Enter preview link URL"
            />
          </div>

          {/* Links Section */}
          <div className="space-y-2">
            <Label>Additional Links</Label>
            <div className="flex space-x-2">
              <Input
                placeholder="Link title"
                value={newLink.title}
                onChange={(e) =>
                  setNewLink({ ...newLink, title: e.target.value })
                }
              />
              <Input
                placeholder="URL"
                value={newLink.url}
                onChange={(e) =>
                  setNewLink({ ...newLink, url: e.target.value })
                }
              />
              <Button type="button" onClick={addLink} variant="secondary">
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            {/* Display links */}
            <div className="mt-2 space-y-2">
              {formData.links.map((link, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-2 bg-gray-50 rounded-md"
                >
                  <div className="flex items-center space-x-2">
                    <LinkIcon className="h-4 w-4 text-blue-500" />
                    <span>{link.title}</span>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeLink(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>

          {/* Images Section */}
          <div className="space-y-2">
            <Label>Images</Label>
            <div className="flex space-x-2">
              <Input
                placeholder="Image URL"
                value={newImage.url}
                onChange={(e) =>
                  setNewImage({ ...newImage, url: e.target.value })
                }
              />
              <Input
                placeholder="Caption"
                value={newImage.caption}
                onChange={(e) =>
                  setNewImage({ ...newImage, caption: e.target.value })
                }
              />
              <Button type="button" onClick={addImage} variant="secondary">
                <Plus className="h-4 w-4" />
              </Button>
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
                ? "Create Sample"
                : "Save Changes"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
