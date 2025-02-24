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
import BusinessForm from "../forms/BusinessForm";

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
                  <span className=" mt-4 mb-4">{business.description}</span>
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
                        onUpdate={handleUpdate}
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
