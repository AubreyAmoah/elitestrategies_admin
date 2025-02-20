"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Plus,
  Trash2,
  Pencil,
  Filter,
  MessageSquare,
  ThumbsUp,
} from "lucide-react";
import Loading from "../Loading";
import toast from "react-hot-toast";

const API_URL = process.env.NEXT_PUBLIC_URL;

// Status badge colors
const getStatusColor = (status) => {
  const colors = {
    pending: "bg-yellow-100 text-yellow-800",
    "under-review": "bg-blue-100 text-blue-800",
    approved: "bg-green-100 text-green-800",
    rejected: "bg-red-100 text-red-800",
    implemented: "bg-purple-100 text-purple-800",
  };
  return colors[status] || colors.pending;
};

// Priority badge colors
const getPriorityColor = (priority) => {
  const colors = {
    low: "bg-gray-100 text-gray-800",
    medium: "bg-yellow-100 text-yellow-800",
    high: "bg-red-100 text-red-800",
  };
  return colors[priority] || colors.low;
};

export default function SuggestionsPage() {
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSuggestion, setSelectedSuggestion] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filters, setFilters] = useState({
    status: "all",
    category: "all",
    priority: "all",
  });

  // Fetch suggestions with filters
  const fetchSuggestions = async () => {
    try {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value && value !== "all") params.append(key, value);
      });

      const response = await axios.get(
        `${API_URL}/api/suggestions?${params.toString()}`,
        { withCredentials: true }
      );
      setSuggestions(response.data.data);
    } catch (error) {
      toast.error("Failed to fetch suggestions");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSuggestions();
  }, [filters]);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this suggestion?")) {
      return;
    }

    try {
      await axios.delete(`${API_URL}/api/suggestions/${id}`, {
        withCredentials: true,
      });
      toast.success("Suggestion deleted successfully");
      fetchSuggestions();
    } catch (error) {
      toast.error("Failed to delete suggestion");
    }
  };

  const handleUpdate = async (formData) => {
    try {
      await axios.patch(
        `${API_URL}/api/suggestions/${selectedSuggestion._id}`,
        formData,
        { withCredentials: true }
      );
      toast.success("Suggestion updated successfully");
      setIsModalOpen(false);
      setSelectedSuggestion(null);
      fetchSuggestions();
    } catch (error) {
      toast.error('"Failed to update suggestion"');
    }
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
        <h1 className="text-2xl font-bold">Suggestions</h1>
        <div className="flex gap-2">
          {/* Filters */}
          <Select
            value={filters.status}
            onValueChange={(value) => setFilters({ ...filters, status: value })}
          >
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="under-review">Under Review</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
              <SelectItem value="implemented">Implemented</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={filters.category}
            onValueChange={(value) =>
              setFilters({ ...filters, category: value })
            }
          >
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Filter by category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="feature">Feature</SelectItem>
              <SelectItem value="improvement">Improvement</SelectItem>
              <SelectItem value="bug">Bug</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={filters.priority}
            onValueChange={(value) =>
              setFilters({ ...filters, priority: value })
            }
          >
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Filter by priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Priorities</SelectItem>
              <SelectItem value="low">Low</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="high">High</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {suggestions.map((suggestion) => (
          <Card key={suggestion._id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div className="flex gap-2 flex-wrap">
                  <Badge className={getStatusColor(suggestion.status)}>
                    {suggestion.status}
                  </Badge>
                  <Badge className={getPriorityColor(suggestion.priority)}>
                    {suggestion.priority}
                  </Badge>
                  <Badge variant="outline">{suggestion.category}</Badge>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setSelectedSuggestion(suggestion);
                      setIsModalOpen(true);
                    }}
                  >
                    <Pencil className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(suggestion._id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              <CardTitle className="mt-2">{suggestion.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4">
                {suggestion.description}
              </p>
              <div className="flex justify-between items-center text-sm text-gray-500">
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-4 h-4" />
                  {suggestion.comments?.length || 0} comments
                </div>
                <div className="flex items-center gap-2">
                  <ThumbsUp className="w-4 h-4" />
                  {suggestion.upvotes?.length || 0} upvotes
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Edit Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Suggestion</DialogTitle>
          </DialogHeader>
          {selectedSuggestion && (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.target);
                handleUpdate(Object.fromEntries(formData));
              }}
              className="space-y-4"
            >
              <div>
                <Label>Title</Label>
                <Input
                  name="title"
                  defaultValue={selectedSuggestion.title}
                  required
                  maxLength={200}
                />
              </div>

              <div>
                <Label>Description</Label>
                <Textarea
                  name="description"
                  defaultValue={selectedSuggestion.description}
                  required
                  maxLength={1000}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Status</Label>
                  <Select
                    name="status"
                    defaultValue={selectedSuggestion.status}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="under-review">Under Review</SelectItem>
                      <SelectItem value="approved">Approved</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
                      <SelectItem value="implemented">Implemented</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Priority</Label>
                  <Select
                    name="priority"
                    defaultValue={selectedSuggestion.priority}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label>Category</Label>
                <Select
                  name="category"
                  defaultValue={selectedSuggestion.category}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="feature">Feature</SelectItem>
                    <SelectItem value="improvement">Improvement</SelectItem>
                    <SelectItem value="bug">Bug</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit">Update</Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
