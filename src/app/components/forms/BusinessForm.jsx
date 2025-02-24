"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export const BusinessForm = ({
  id,
  business,
  onSubmit,
  onUpdate,
  mode = "create",
}) => {
  // State declarations
  const [formData, setFormData] = useState(() => {
    // If business data exists, ensure it has all required arrays
    if (business) {
      return {
        ...business,
        contacts: business.contacts || [],
        websites: business.websites || [],
        images: business.images || [],
      };
    }
    // Default state for new business
    return {
      name: "",
      category: "",
      description: "",
      location: {
        type: "Point",
        coordinates: [0, 0],
      },
      address: {
        street: "",
        city: "",
        state: "",
        country: "",
        postalCode: "",
      },
      baseImage: "",
      contacts: [],
      websites: [],
      images: [],
    };
  });

  const [newContact, setNewContact] = useState({ type: "email", value: "" });
  const [newWebsite, setNewWebsite] = useState("");
  const [newImage, setNewImage] = useState("");

  // Business categories list
  const categories = [
    "Restaurant",
    "Retail",
    "Healthcare",
    "Education",
    "Technology",
    "Finance",
    "Real Estate",
    "Entertainment",
    "Hospitality",
    "Professional Services",
    "Manufacturing",
    "Beauty & Wellness",
    "Automotive",
    "Other",
  ];

  // Handle form field changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.includes(".")) {
      const [parent, child] = name.split(".");
      setFormData((prev) => ({
        ...prev,
        [parent]: { ...prev[parent], [child]: value },
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  // Handle select changes (for category)
  const handleSelectChange = (value, field) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Handle coordinate changes
  const handleCoordinateChange = (index, value) => {
    const newCoordinates = [...formData.location.coordinates];
    newCoordinates[index] = parseFloat(value) || 0;
    setFormData((prev) => ({
      ...prev,
      location: {
        ...prev.location,
        coordinates: newCoordinates,
      },
    }));
  };

  // Contact functions
  const addContact = () => {
    if (newContact.value) {
      setFormData((prev) => ({
        ...prev,
        contacts: [...prev.contacts, { ...newContact }],
      }));
      setNewContact({ type: "email", value: "" });
    }
  };

  const removeContact = (index) => {
    setFormData((prev) => ({
      ...prev,
      contacts: prev.contacts.filter((_, i) => i !== index),
    }));
  };

  // Website functions
  const addWebsite = () => {
    if (newWebsite) {
      setFormData((prev) => ({
        ...prev,
        websites: [...prev.websites, { url: newWebsite, type: "main" }],
      }));
      setNewWebsite("");
    }
  };

  const removeWebsite = (index) => {
    setFormData((prev) => ({
      ...prev,
      websites: prev.websites.filter((_, i) => i !== index),
    }));
  };

  // Image functions
  const addImage = () => {
    if (newImage.trim()) {
      setFormData((prev) => ({
        ...prev,
        images: [...(prev.images || []), newImage.trim()],
      }));
      setNewImage("");
    }
  };

  const removeImage = (index) => {
    setFormData((prev) => ({
      ...prev,
      images: (prev.images || []).filter((_, i) => i !== index),
    }));
  };

  // Submit form
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (mode === "create") {
        await onSubmit(formData);
      } else if (mode === "edit") {
        await onUpdate(id, formData);
      }
    } catch (error) {
      console.error("Form submission error:", error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <label className="text-sm font-medium">
          Business Name <span className="text-red-500">*</span>
        </label>
        <Input
          name="name"
          value={formData.name}
          onChange={handleChange}
          placeholder="Business Name"
          required
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">
          Business Category <span className="text-red-500">*</span>
        </label>
        <Select
          value={formData.category}
          onValueChange={(value) => handleSelectChange(value, "category")}
          required
        >
          <SelectTrigger>
            <SelectValue placeholder="Select a category" />
          </SelectTrigger>
          <SelectContent>
            {categories.map((category) => (
              <SelectItem key={category} value={category}>
                {category}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Business Description</label>
        <Textarea
          name="description"
          value={formData.description || ""}
          onChange={handleChange}
          placeholder="Describe your business..."
          rows={4}
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">
          Coordinates <span className="text-red-500">*</span>
        </label>
        <div className="grid grid-cols-2 gap-4">
          <Input
            type="number"
            value={formData.location.coordinates[0]}
            onChange={(e) => handleCoordinateChange(0, e.target.value)}
            placeholder="Longitude"
            step="any"
            required
          />
          <Input
            type="number"
            value={formData.location.coordinates[1]}
            onChange={(e) => handleCoordinateChange(1, e.target.value)}
            placeholder="Latitude"
            step="any"
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">
          Address <span className="text-red-500">*</span>
        </label>
        <div className="grid grid-cols-2 gap-4">
          <Input
            name="address.street"
            value={formData.address.street}
            onChange={handleChange}
            placeholder="Street"
            required
          />
          <Input
            name="address.city"
            value={formData.address.city}
            onChange={handleChange}
            placeholder="City"
            required
          />
          <Input
            name="address.state"
            value={formData.address.state}
            onChange={handleChange}
            placeholder="State"
            required
          />
          <Input
            name="address.country"
            value={formData.address.country}
            onChange={handleChange}
            placeholder="Country"
            required
          />
          <Input
            name="address.postalCode"
            value={formData.address.postalCode}
            onChange={handleChange}
            placeholder="Postal Code"
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">
          Base Image URL <span className="text-red-500">*</span>
        </label>
        <Input
          name="baseImage"
          value={formData.baseImage}
          onChange={handleChange}
          placeholder="Base Image URL"
          required
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Additional Images</label>
        <div className="flex gap-2">
          <Input
            placeholder="Image URL"
            value={newImage}
            onChange={(e) => setNewImage(e.target.value)}
            className="flex-1"
          />
          <Button type="button" onClick={addImage}>
            Add
          </Button>
        </div>
        <div className="grid grid-cols-2 gap-4 mt-2">
          {formData?.images?.map((image, index) => (
            <div key={index} className="relative group">
              <img
                src={image}
                alt={`Additional image ${index + 1}`}
                className="w-full h-32 object-cover rounded-md"
              />
              <Button
                type="button"
                variant="destructive"
                size="sm"
                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => removeImage(index)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Contacts</label>
        <div className="flex gap-2">
          <select
            value={newContact.type}
            onChange={(e) =>
              setNewContact((prev) => ({ ...prev, type: e.target.value }))
            }
            className="px-3 py-2 border rounded-md"
          >
            <option value="email">Email</option>
            <option value="phone">Phone</option>
            <option value="whatsapp">WhatsApp</option>
          </select>
          <Input
            value={newContact.value}
            onChange={(e) =>
              setNewContact((prev) => ({ ...prev, value: e.target.value }))
            }
            placeholder="Contact value"
            className="flex-1"
          />
          <Button type="button" onClick={addContact}>
            Add
          </Button>
        </div>
        {formData.contacts.map((contact, index) => (
          <div
            key={index}
            className="flex items-center justify-between bg-gray-50 p-2 rounded"
          >
            <span>
              {contact.type}: {contact.value}
            </span>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => removeContact(index)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Websites</label>
        <div className="flex gap-2">
          <Input
            value={newWebsite}
            onChange={(e) => setNewWebsite(e.target.value)}
            placeholder="Website URL"
            className="flex-1"
          />
          <Button type="button" onClick={addWebsite}>
            Add
          </Button>
        </div>
        {formData.websites.map((website, index) => (
          <div
            key={index}
            className="flex items-center justify-between bg-gray-50 p-2 rounded"
          >
            <span>{website.url}</span>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => removeWebsite(index)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>

      <Button type="submit" className="w-full">
        {mode === "create" ? "Create Business" : "Update Business"}
      </Button>
    </form>
  );
};

export default BusinessForm;
