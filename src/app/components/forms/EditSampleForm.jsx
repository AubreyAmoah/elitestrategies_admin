// components/forms/EditSampleForm.jsx
"use client";
import { useState } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import ImageUpload from "./ImageUpload";

export default function EditSampleForm({
  sample,
  categoryId,
  sectionId,
  onSave,
  onCancel,
}) {
  const [formData, setFormData] = useState({
    name: sample?.name || "",
    description: sample?.description || "",
    links: sample?.links || [],
    images: sample?.images || [],
    fields: sample?.fields || {},
  });

  const [newLink, setNewLink] = useState({ title: "", url: "" });
  const [newField, setNewField] = useState({ key: "", value: "" });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (sample) {
        await axios.patch(
          `/api/users/update-sample/${categoryId}/sections/${sectionId}/samples/${sample._id}`,
          formData
        );
      } else {
        await axios.post(
          `/api/users/add-sample/${categoryId}/sections/${sectionId}/samples`,
          formData
        );
      }
      onSave();
    } catch (error) {
      console.error("Error saving sample:", error);
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

  const addImage = (imageUrl) => {
    setFormData({
      ...formData,
      images: [...formData.images, { url: imageUrl }],
    });
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
        <Label htmlFor="name">Sample Name</Label>
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

      {/* Links */}
      <div className="space-y-2">
        <Label>Links</Label>
        {formData.links.map((link, index) => (
          <div key={index} className="flex gap-2">
            <Input value={link.title} disabled />
            <Input value={link.url} disabled />
            <Button
              type="button"
              variant="destructive"
              onClick={() => {
                const newLinks = formData.links.filter((_, i) => i !== index);
                setFormData({ ...formData, links: newLinks });
              }}
            >
              Remove
            </Button>
          </div>
        ))}

        <div className="flex gap-2">
          <Input
            placeholder="Link Title"
            value={newLink.title}
            onChange={(e) => setNewLink({ ...newLink, title: e.target.value })}
          />
          <Input
            placeholder="URL"
            value={newLink.url}
            onChange={(e) => setNewLink({ ...newLink, url: e.target.value })}
          />
          <Button type="button" onClick={addLink}>
            Add Link
          </Button>
        </div>
      </div>

      {/* Images */}
      <div className="space-y-2">
        <Label>Images</Label>
        <div className="grid grid-cols-3 gap-4">
          {formData.images.map((image, index) => (
            <div key={index} className="relative">
              <img
                src={image.url}
                alt={`Sample ${index + 1}`}
                className="w-full h-32 object-cover rounded"
              />
              <Button
                type="button"
                variant="destructive"
                size="sm"
                className="absolute top-2 right-2"
                onClick={() => {
                  const newImages = formData.images.filter(
                    (_, i) => i !== index
                  );
                  setFormData({ ...formData, images: newImages });
                }}
              >
                Remove
              </Button>
            </div>
          ))}
        </div>
        <ImageUpload onUpload={addImage} />
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
