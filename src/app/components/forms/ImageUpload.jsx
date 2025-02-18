"use client";
// components/forms/ImageUpload.jsx
import { useState } from "react";
import { Upload } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ImageUpload({ onUpload }) {
  const [uploading, setUploading] = useState(false);

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("image", file);

    try {
      setUploading(true);
      const response = await axios.post("/api/users/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      onUpload(response.data.url);
    } catch (error) {
      console.error("Upload failed:", error);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Button variant="outline" disabled={uploading}>
        <Upload className="h-4 w-4 mr-2" />
        {uploading ? "Uploading..." : "Upload Image"}
        <input
          type="file"
          className="hidden"
          accept="image/*"
          onChange={handleFileChange}
        />
      </Button>
    </div>
  );
}
