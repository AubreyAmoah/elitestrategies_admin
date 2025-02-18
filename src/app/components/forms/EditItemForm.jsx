// components/forms/EditItemForm.jsx
"use client";
import { useState } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export default function EditItemForm({
  item,
  categoryId,
  sectionId,
  onSave,
  onCancel,
}) {
  const [formData, setFormData] = useState({
    name: item?.name || "",
    description: item?.description || "",
    fields: item?.fields || {},
  });

  const [newField, setNewField] = useState({ key: "", value: "" });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (item) {
        await axios.patch(
          `/api/users/update-item/${categoryId}/sections/${sectionId}/items/${item._id}`,
          formData
        );
      } else {
        await axios.post(
          `/api/users/add-item/${categoryId}/sections/${sectionId}/items`,
          formData
        );
      }
      onSave();
    } catch (error) {
      console.error("Error saving item:", error);
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

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="name">Item Name</Label>
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

      {/* Custom Fields */}
      <div className="space-y-2">
        <Label>Custom Fields</Label>
        {Object.entries(formData.fields).map(([key, value]) => (
          <div key={key} className="flex gap-2">
            <Input value={key} disabled />
            <Input value={value} disabled />
            <Button
              type="button"
              variant="destructive"
              onClick={() => {
                const { [key]: _, ...rest } = formData.fields;
                setFormData({ ...formData, fields: rest });
              }}
            >
              Remove
            </Button>
          </div>
        ))}

        {/* Add New Field */}
        <div className="flex gap-2">
          <Input
            placeholder="Field Name"
            value={newField.key}
            onChange={(e) => setNewField({ ...newField, key: e.target.value })}
          />
          <Input
            placeholder="Field Value"
            value={newField.value}
            onChange={(e) =>
              setNewField({ ...newField, value: e.target.value })
            }
          />
          <Button type="button" onClick={addField}>
            Add Field
          </Button>
        </div>
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
