"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Plus, Edit2, Trash2, MapPin, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import axios from "axios";
import toast from "react-hot-toast";

export default function BusinessPage() {
  const [businesses, setBusinesses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchFilter, setSearchFilter] = useState("name");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  const fetchBusinesses = async () => {
    try {
      let url = `${process.env.NEXT_PUBLIC_URL}/api/businesses?page=${page}`;

      if (debouncedSearchTerm) {
        url += `&search=${debouncedSearchTerm}&filter=${searchFilter}`;
      }

      const response = await axios.get(url);
      const data = response.data;
      setBusinesses(data.data);
      setTotalPages(data.pagination.pages);
    } catch (error) {
      console.error(error);
      toast.error("Failed to fetch businesses");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBusinesses();
  }, [page, debouncedSearchTerm, searchFilter]);

  const handleCreate = async (formData) => {
    try {
      await axios.post(
        `${process.env.NEXT_PUBLIC_URL}/api/create-business`,
        formData,
        { withCredentials: true }
      );
      toast.success("Business created successfully");
      fetchBusinesses();
      setDialogOpen(false);
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.error || "Failed to create business");
    }
  };

  const handleUpdate = async (id, formData) => {
    try {
      await axios.patch(
        `${process.env.NEXT_PUBLIC_URL}/api/businesses/${id}`,
        formData,
        { withCredentials: true }
      );
      toast.success("Business updated successfully");
      fetchBusinesses();
      setDialogOpen(false);
    } catch (error) {
      toast.error(error.response?.data?.error || "Failed to update business");
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(
        `${process.env.NEXT_PUBLIC_URL}/api/businesses/${id}`,
        { withCredentials: true }
      );
      toast.success("Business deleted successfully");
      fetchBusinesses();
    } catch (error) {
      toast.error("Failed to delete business");
    }
  };

  const BusinessForm = ({ business, onSubmit, mode = "create" }) => {
    const [formData, setFormData] = useState(
      business || {
        name: "",
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
      }
    );

    const [newContact, setNewContact] = useState({ type: "email", value: "" });
    const [newWebsite, setNewWebsite] = useState("");
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

    const [newImage, setNewImage] = useState("");

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

    const handleSubmit = async (e) => {
      e.preventDefault();
      try {
        if (mode === "create") {
          await onSubmit(formData);
        } else {
          // For edit mode, we pass both the id and formData
          await handleUpdate(business._id, formData);
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

  return (
    <div className="lg:ml-64 p-6">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Businesses</h1>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Business
            </Button>
          </DialogTrigger>
          <DialogContent className="max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Business</DialogTitle>
            </DialogHeader>
            <BusinessForm onSubmit={handleCreate} />
          </DialogContent>
        </Dialog>
      </div>

      <div className="mb-6 flex gap-4">
        <div className="flex-1 flex gap-4">
          <select
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            className="px-3 py-2 border rounded-md"
          >
            <option value="name">Name</option>
            <option value="city">City</option>
            <option value="state">State</option>
            <option value="country">Country</option>
          </select>
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              type="text"
              placeholder={`Search by ${searchFilter}...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence>
          {businesses.map((business) => (
            <motion.div
              key={business._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="w-full"
            >
              <Card className="h-full flex flex-col">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="truncate">{business.name}</span>
                  </CardTitle>
                  <CardDescription>
                    <MapPin className="inline-block mr-2 h-4 w-4" />
                    {`${business.address.city}, ${business.address.country}`}
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex-grow">
                  <img
                    src={business.baseImage}
                    alt={business.name}
                    className="w-full h-48 object-cover rounded-md mb-4"
                  />
                  {business.images?.length > 0 && (
                    <div className="grid grid-cols-3 gap-2 mb-4">
                      {business.images.slice(0, 3).map((image, index) => (
                        <img
                          key={index}
                          src={image}
                          alt={`${business.name} image ${index + 1}`}
                          className="w-full h-20 object-cover rounded-md"
                        />
                      ))}
                    </div>
                  )}
                  {business.contacts?.length > 0 && (
                    <div className="mt-2">
                      <p className="text-sm font-medium">Contacts:</p>
                      {business.contacts.map((contact, index) => (
                        <p key={index} className="text-sm">
                          {contact.type}: {contact.value}
                        </p>
                      ))}
                    </div>
                  )}
                </CardContent>
                <CardFooter className="flex justify-end space-x-2">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm">
                        <Edit2 className="mr-2 h-4 w-4" />
                        Edit
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-h-[90vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>Edit Business</DialogTitle>
                      </DialogHeader>
                      <BusinessForm
                        business={business}
                        mode="edit"
                        id={business._id}
                      />
                    </DialogContent>
                  </Dialog>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDelete(business._id)}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                  </Button>
                </CardFooter>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {businesses.length === 0 && !loading && (
        <div className="text-center py-12">
          <p className="text-gray-500">No businesses found</p>
        </div>
      )}

      {loading && (
        <div className="text-center py-12">
          <p className="text-gray-500">Loading...</p>
        </div>
      )}

      <div className="flex justify-center mt-8 space-x-2">
        <Button
          variant="outline"
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          disabled={page === 1}
        >
          Previous
        </Button>
        <div className="flex items-center px-4">
          <span className="text-sm">
            Page {page} of {totalPages}
          </span>
        </div>
        <Button
          variant="outline"
          onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          disabled={page === totalPages}
        >
          Next
        </Button>
      </div>
    </div>
  );
}
