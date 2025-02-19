"use client";

import { useState } from "react";
import axios from "axios";
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Plus, Upload, AlertCircle, FileText } from "lucide-react";
import toast from "react-hot-toast";

const API_URL = process.env.NEXT_PUBLIC_URL;

export default function QAPairsManager() {
  const [uploadedFile, setUploadedFile] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [parseError, setParseError] = useState(null);

  // For manual QA pair entry
  const [formData, setFormData] = useState({
    question: "",
    answer: "",
    category: "general",
    keywords: "",
    language: "en",
  });

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (file.type !== "application/json") {
      toast.error("Please upload a JSON file");
      return;
    }

    setUploadedFile(file);
    const reader = new FileReader();

    reader.onload = async (e) => {
      try {
        const content = JSON.parse(e.target.result);
        // Validate content structure
        if (!Array.isArray(content)) {
          setParseError("File must contain an array of QA pairs");
          return;
        }

        const isValid = content.every((pair) => pair.question && pair.answer);
        if (!isValid) {
          setParseError(
            "All QA pairs must have 'question' and 'answer' fields"
          );
          return;
        }

        setParseError(null);
      } catch (error) {
        setParseError("Invalid JSON format");
      }
    };

    reader.readAsText(file);
  };

  const handleFileSubmit = async () => {
    if (!uploadedFile) return;

    setLoading(true);
    try {
      const content = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(JSON.parse(e.target.result));
        reader.onerror = reject;
        reader.readAsText(uploadedFile);
      });

      const response = await axios.post(
        `${API_URL}/api/chatbot/import`,
        content,
        { withCredentials: true }
      );

      toast(`Imported ${response.data.data.length} QA pairs successfully`);

      setUploadedFile(null);
    } catch (error) {
      console.log(error);
      toast.error(error.response?.data?.message || "Failed to import QA pairs");
    } finally {
      setLoading(false);
    }
  };

  const handleManualSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Convert comma-separated keywords to array
      const qaData = {
        ...formData,
        keywords: formData.keywords
          .split(",")
          .map((k) => k.trim())
          .filter(Boolean),
      };

      await axios.post(`${API_URL}/api/chatbot/import`, [qaData], {
        withCredentials: true,
      });

      toast.success("QA pair added successfully");

      setFormData({
        question: "",
        answer: "",
        category: "general",
        keywords: "",
        language: "en",
      });

      setIsModalOpen(false);
    } catch (error) {
      console.log(error);
      toast.error(error.response?.data?.message || "Failed to add QA pair");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">QA Pairs Manager</h1>
        <div className="flex gap-2">
          <Button onClick={() => setIsModalOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add Single QA Pair
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* File Upload Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="w-5 h-5" />
              Import from JSON
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex flex-col items-center justify-center border-2 border-dashed rounded-lg p-6">
                <Input
                  type="file"
                  accept=".json"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="file-upload"
                />
                <label
                  htmlFor="file-upload"
                  className="cursor-pointer flex flex-col items-center"
                >
                  <FileText className="w-12 h-12 text-gray-400 mb-2" />
                  <span className="text-sm text-gray-600">
                    Click to upload JSON file
                  </span>
                </label>
              </div>

              {parseError && (
                <div className="flex items-center gap-2 text-red-500 text-sm">
                  <AlertCircle className="w-4 h-4" />
                  {parseError}
                </div>
              )}

              {uploadedFile && !parseError && (
                <div className="flex items-center justify-between">
                  <span className="text-sm truncate">{uploadedFile.name}</span>
                  <Button onClick={handleFileSubmit} disabled={loading}>
                    {loading ? "Importing..." : "Import"}
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* JSON Format Guide Card */}
        <Card>
          <CardHeader>
            <CardTitle>JSON Format Guide</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="bg-secondary p-4 rounded-lg text-sm overflow-x-auto">
              {`[
  {
    "question": "What are your hours?",
    "answer": "We're open 9-5",
    "category": "general",
    "keywords": ["hours", "open"],
    "language": "en"
  }
]`}
            </pre>
          </CardContent>
        </Card>
      </div>

      {/* Add Single QA Pair Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add QA Pair</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleManualSubmit} className="space-y-4">
            <div>
              <Label>Question</Label>
              <Input
                value={formData.question}
                onChange={(e) =>
                  setFormData({ ...formData, question: e.target.value })
                }
                placeholder="Enter question"
                required
              />
            </div>

            <div>
              <Label>Answer</Label>
              <Textarea
                value={formData.answer}
                onChange={(e) =>
                  setFormData({ ...formData, answer: e.target.value })
                }
                placeholder="Enter answer"
                required
              />
            </div>

            <div>
              <Label>Category</Label>
              <Select
                value={formData.category}
                onValueChange={(value) =>
                  setFormData({ ...formData, category: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="general">General</SelectItem>
                  <SelectItem value="product">Product</SelectItem>
                  <SelectItem value="support">Support</SelectItem>
                  <SelectItem value="technical">Technical</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Keywords (comma-separated)</Label>
              <Input
                value={formData.keywords}
                onChange={(e) =>
                  setFormData({ ...formData, keywords: e.target.value })
                }
                placeholder="Enter keywords"
              />
            </div>

            <div>
              <Label>Language</Label>
              <Select
                value={formData.language}
                onValueChange={(value) =>
                  setFormData({ ...formData, language: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select language" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="es">Spanish</SelectItem>
                  <SelectItem value="fr">French</SelectItem>
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
              <Button type="submit" disabled={loading}>
                {loading ? "Adding..." : "Add QA Pair"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
