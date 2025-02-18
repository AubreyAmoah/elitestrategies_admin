// components/pages/AnnouncementsPage.jsx
"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import axios from "axios";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import {
  Plus,
  Trash2,
  Pencil,
  AlertCircle,
  Megaphone,
  Calendar,
} from "lucide-react";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

// Create a new Announcement Modal
function AnnouncementModal({
  isOpen,
  onClose,
  announcement = null,
  onSuccess,
}) {
  const [formData, setFormData] = useState({
    type: announcement?.type || "announcement",
    title: announcement?.title || "",
    content: announcement?.content || "",
    imageUrl: announcement?.imageUrl || "",
    expiryDate: announcement?.expiryDate || "",
  });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (announcement) {
        await axios.patch(
          `${process.env.NEXT_PUBLIC_URL}/api/announcements/${announcement._id}`,
          formData,
          { withCredentials: true }
        );
      } else {
        await axios.post(
          `${process.env.NEXT_PUBLIC_URL}/api/announcements`,
          formData,
          { withCredentials: true }
        );
      }
      toast({
        title: "Success",
        description: `Announcement ${
          announcement ? "updated" : "created"
        } successfully`,
      });
      onSuccess();
      onClose();
    } catch (error) {
      toast({
        title: "Error",
        description:
          error.response?.data?.message ||
          `Failed to ${announcement ? "update" : "create"} announcement`,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {announcement ? "Edit Announcement" : "Create Announcement"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>Type</Label>
            <Select
              value={formData.type}
              onValueChange={(value) =>
                setFormData({ ...formData, type: value })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="announcement">Announcement</SelectItem>
                <SelectItem value="promo">Promo</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Title</Label>
            <Input
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              placeholder="Enter announcement title"
              required
            />
          </div>

          <div>
            <Label>Content</Label>
            <Textarea
              value={formData.content}
              onChange={(e) =>
                setFormData({ ...formData, content: e.target.value })
              }
              placeholder="Enter announcement content"
              rows={4}
              required
            />
          </div>

          <div>
            <Label>Image URL</Label>
            <Input
              value={formData.imageUrl}
              onChange={(e) =>
                setFormData({ ...formData, imageUrl: e.target.value })
              }
              placeholder="Enter image URL"
            />
            {formData.imageUrl && (
              <div className="mt-2 relative w-full h-32">
                <img
                  src={formData.imageUrl}
                  alt="Preview"
                  className="w-full h-full object-cover rounded-md"
                />
              </div>
            )}
          </div>

          <div>
            <Label>Expiry Date</Label>
            <Input
              type="datetime-local"
              value={formData.expiryDate}
              onChange={(e) =>
                setFormData({ ...formData, expiryDate: e.target.value })
              }
              required
            />
          </div>

          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={onClose} type="button">
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : announcement ? "Update" : "Create"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// Main Announcements Page
export default function AnnouncementsPage() {
  const [announcements, setAnnouncements] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const { toast } = useToast();

  const fetchAnnouncements = async () => {
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_URL}/api/announcements`,
        { withCredentials: true }
      );
      setAnnouncements(response.data.data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch announcements",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this announcement?")) {
      try {
        await axios.delete(
          `${process.env.NEXT_PUBLIC_URL}/api/announcements/${id}`,
          { withCredentials: true }
        );
        toast({
          title: "Success",
          description: "Announcement deleted successfully",
        });
        fetchAnnouncements();
      } catch (error) {
        toast({
          title: "Error",
          description:
            error.response?.data?.message || "Failed to delete announcement",
          variant: "destructive",
        });
      }
    }
  };

  const handleDeleteExpired = async () => {
    if (
      window.confirm(
        "Are you sure you want to delete all expired announcements?"
      )
    ) {
      try {
        await axios.delete(
          `${process.env.NEXT_PUBLIC_URL}/api/announcements/expired`,
          { withCredentials: true }
        );
        toast({
          title: "Success",
          description: "Expired announcements deleted successfully",
        });
        fetchAnnouncements();
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to delete expired announcements",
          variant: "destructive",
        });
      }
    }
  };

  const filteredAnnouncements = announcements.filter((announcement) => {
    if (filter === "all") return true;
    if (filter === "active")
      return new Date(announcement.expiryDate) > new Date();
    if (filter === "expired")
      return new Date(announcement.expiryDate) <= new Date();
    return announcement.type === filter;
  });

  return (
    <div className="lg:ml-64 p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Announcements</h1>
        <div className="flex space-x-2">
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter announcements" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="expired">Expired</SelectItem>
              <SelectItem value="announcement">Announcements</SelectItem>
              <SelectItem value="promo">Promos</SelectItem>
            </SelectContent>
          </Select>
          <Button
            variant="destructive"
            onClick={handleDeleteExpired}
            className="ml-2"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Delete Expired
          </Button>
          <Button onClick={() => setIsModalOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            New Announcement
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredAnnouncements.map((announcement) => {
          const isExpired = new Date(announcement.expiryDate) <= new Date();

          return (
            <motion.div
              key={announcement._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card className={`${isExpired ? "opacity-60" : ""}`}>
                {announcement.imageUrl && (
                  <div className="relative w-full h-48">
                    <img
                      src={announcement.imageUrl}
                      alt={announcement.title}
                      className="w-full h-full object-cover rounded-t-lg"
                    />
                  </div>
                )}
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <Badge
                        variant={
                          announcement.type === "promo"
                            ? "default"
                            : "secondary"
                        }
                      >
                        {announcement.type}
                      </Badge>
                      <CardTitle className="mt-2">
                        {announcement.title}
                      </CardTitle>
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSelectedAnnouncement(announcement);
                          setIsModalOpen(true);
                        }}
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(announcement._id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-4">{announcement.content}</p>
                  <div className="flex items-center text-sm text-gray-500">
                    <Calendar className="w-4 h-4 mr-1" />
                    <span>
                      Expires:{" "}
                      {format(new Date(announcement.expiryDate), "PPp")}
                    </span>
                  </div>
                  {isExpired && (
                    <Badge variant="destructive" className="mt-2">
                      Expired
                    </Badge>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      <AnnouncementModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedAnnouncement(null);
        }}
        announcement={selectedAnnouncement}
        onSuccess={fetchAnnouncements}
      />
    </div>
  );
}
