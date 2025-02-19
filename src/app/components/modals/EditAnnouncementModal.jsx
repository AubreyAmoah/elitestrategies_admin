"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import toast from "react-hot-toast";

const API_URL = process.env.NEXT_PUBLIC_URL;

export default function EditAnnouncementModal({
  isOpen,
  onClose,
  announcementId,
  onSuccess,
}) {
  const [formData, setFormData] = useState({
    title: "",
    type: "info",
    imageUrl: "",
    content: "",
    expiryDate: "",
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchAnnouncement = async () => {
      if (!announcementId) return;

      setLoading(true);
      try {
        const response = await axios.get(
          `${API_URL}/api/announcements/${announcementId}`,
          { withCredentials: true }
        );
        const announcement = response.data.data;

        // Format the date to work with datetime-local input
        const formattedDate = new Date(announcement.expiryDate)
          .toISOString()
          .slice(0, 16);

        setFormData({
          title: announcement.title || "",
          type: announcement.type || "info",
          imageUrl: announcement.imageUrl || "",
          content: announcement.content || "",
          expiryDate: formattedDate,
        });
      } catch (error) {
        toast.error("Failed to fetch announcement details");
        onClose();
      } finally {
        setLoading(false);
      }
    };

    if (isOpen && announcementId) {
      fetchAnnouncement();
    }
  }, [isOpen, announcementId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.patch(
        `${API_URL}/api/announcements/${announcementId}`,
        formData,
        { withCredentials: true }
      );

      toast.success("Announcement updated successfully");
      onSuccess();
      onClose();
    } catch (error) {
      console.error(error);
      toast.error(
        error.response?.data?.message || "Failed to update announcement"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] max-h-[95vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Announcement</DialogTitle>
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
                <SelectItem value="info">Info</SelectItem>
                <SelectItem value="warning">Warning</SelectItem>
                <SelectItem value="alert">Alert</SelectItem>
                <SelectItem value="success">Success</SelectItem>
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
              maxLength={200}
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
              required
              pattern="^(http|https):\/\/[^ ]+$"
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
              min={new Date().toISOString().slice(0, 16)}
              required
            />
          </div>

          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={onClose} type="button">
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Updating..." : "Update"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
