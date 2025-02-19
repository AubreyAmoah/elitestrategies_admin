"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Plus, Trash2, Pencil, Calendar } from "lucide-react";
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
import Loading from "../Loading";
import CreateAnnouncementModal from "../modals/CreateAnnouncementModal";
import EditAnnouncementModal from "../modals/EditAnnouncementModal";

const API_URL = process.env.NEXT_PUBLIC_URL;

export default function AnnouncementsPage() {
  const [announcements, setAnnouncements] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const { toast } = useToast();

  const fetchAnnouncements = async () => {
    try {
      const response = await axios.get(
        filter === "active"
          ? `${API_URL}/api/announcements/active`
          : `${API_URL}/api/announcements`,
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
  }, [filter]);

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this announcement?")) {
      try {
        await axios.delete(`${API_URL}/api/announcements/${id}`, {
          withCredentials: true,
        });
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
        await axios.delete(`${API_URL}/api/announcements/expired`, {
          withCredentials: true,
        });
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
    if (filter === "active") return true; // Handled by API
    return announcement.type === filter;
  });

  const getTypeColor = (type) => {
    const colors = {
      info: "bg-blue-100 text-blue-800",
      warning: "bg-yellow-100 text-yellow-800",
      alert: "bg-red-100 text-red-800",
      success: "bg-green-100 text-green-800",
    };
    return colors[type] || colors.info;
  };

  if (loading) {
    return (
      <div className="lg:ml-64 p-6">
        <Loading />
      </div>
    );
  }

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
              <SelectItem value="info">Info</SelectItem>
              <SelectItem value="warning">Warning</SelectItem>
              <SelectItem value="alert">Alert</SelectItem>
              <SelectItem value="success">Success</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="destructive" onClick={handleDeleteExpired}>
            <Trash2 className="w-4 h-4 mr-2" />
            Delete Expired
          </Button>
          <Button onClick={() => setIsNewModalOpen(true)}>
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
              <Card className={isExpired ? "opacity-60" : ""}>
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
                      <Badge className={getTypeColor(announcement.type)}>
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
                          setSelectedAnnouncement(announcement._id);
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

      <CreateAnnouncementModal
        isOpen={isNewModalOpen}
        onClose={() => {
          setIsNewModalOpen(false);
        }}
        onSuccess={fetchAnnouncements}
      />

      <EditAnnouncementModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
        }}
        announcementId={selectedAnnouncement}
        onSuccess={fetchAnnouncements}
      />
    </div>
  );
}
