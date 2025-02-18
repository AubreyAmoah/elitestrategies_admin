// components/modals/SectionModal.jsx
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
import { useToast } from "@/hooks/use-toast";
import RichTextEditor from "../editor/RichTextEditor";

export default function SectionModal({
  isOpen,
  onClose,
  onSuccess,
  categoryId,
  section = null, // null for create, section object for edit
  mode = "create",
}) {
  const [formData, setFormData] = useState({
    title: section?.title || "",
    image: section?.image || "",
    description: section?.description || "",
    additionalInfo: section?.additionalInfo || "",
  });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === "create") {
        await axios.post(
          `${process.env.NEXT_PUBLIC_URL}/api/users/create-section/${categoryId}/sections`,
          formData,
          { withCredentials: true }
        );
        toast({
          title: "Success",
          description: "Section created successfully",
        });
      } else {
        await axios.patch(
          `${process.env.NEXT_PUBLIC_URL}/api/users/update-section/${categoryId}/sections/${section._id}`,
          formData,
          { withCredentials: true }
        );
        toast({
          title: "Success",
          description: "Section updated successfully",
        });
      }
      onSuccess();
      onClose();
    } catch (error) {
      console.log(error);
      toast({
        title: "Error",
        description:
          error.response?.data?.message || `Failed to ${mode} section`,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {mode === "create" ? "Create New Section" : "Edit Section"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="title">Section Name</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              placeholder="Enter section title"
              required
            />
          </div>
          <div>
            <Label htmlFor="imageurl">Image Url</Label>
            <Input
              id="imageurl"
              value={formData.image}
              onChange={(e) =>
                setFormData({ ...formData, image: e.target.value })
              }
              placeholder="Enter image url"
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
              placeholder="Enter section description"
              rows={3}
            />
          </div>
          <div>
            <Label htmlFor="additionalInfo">Additional Information</Label>
            <Textarea
              id="additionalInfo"
              value={formData.additionalInfo}
              onChange={(e) =>
                setFormData({ ...formData, additionalInfo: e.target.value })
              }
              placeholder="Enter additional information"
              rows={5}
              className="resize-vertical"
            />
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
                ? "Create Section"
                : "Save Changes"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
