// components/forms/EditSectionForm.jsx
"use client";
import { useState } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export default function EditSectionForm({
  section,
  categoryId,
  onSave,
  onCancel,
}) {
  const [formData, setFormData] = useState({
    name: section?.name || "",
    description: section?.description || "",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (section) {
        await axios.patch(
          `/api/users/update-section/${categoryId}/sections/${section._id}`,
          formData
        );
      } else {
        await axios.post(
          `/api/users/create-section/${categoryId}/sections`,
          formData
        );
      }
      onSave();
    } catch (error) {
      console.error("Error saving section:", error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="name">Section Name</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
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
        />
      </div>
      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">Save</Button>
      </div>
    </form>
  );
}
