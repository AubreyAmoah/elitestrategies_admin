// pages/dashboard/page.jsx
"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  FolderTree,
  FileText,
  Package,
  MenuIcon,
  LogOut,
  Box,
  Megaphone,
} from "lucide-react";
import CategoryPage from "@/app/components/pages/CategoryPage";
import { useRouter, useSearchParams } from "next/navigation";

// Add components for other pages (create these components)
import SuggestionsPage from "@/app/components/pages/SuggestionsPage";
import AnnouncementsPage from "@/app/components/pages/AnnouncementsPage";
import HomePage from "@/app/components/pages/HomePage";
import axios from "axios";
import { useToast } from "@/hooks/use-toast";

export default function Dashboard() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentPage = searchParams.get("p") || "";
  const { toast } = useToast();

  const sidebarVariants = {
    open: { x: 0 },
    closed: { x: "-100%" },
  };

  const handleNavigation = (page) => {
    router.push(`/pages/dashboard?p=${page}`);
    setIsMenuOpen(false); // Close mobile menu after navigation
  };

  // Function to render the correct component based on URL
  const renderComponent = () => {
    switch (currentPage) {
      case "categories":
        return <CategoryPage />;
      case "suggestions":
        return <SuggestionsPage />;
      case "announcements":
        return <AnnouncementsPage />;
      default:
        return <HomePage />;
    }
  };

  const handleLogout = async () => {
    try {
      await axios.get(`${process.env.NEXT_PUBLIC_URL}/api/auth/logout`, {
        withCredentials: true,
      });
      toast({
        title: "Success",
        description: "Logout  successfully",
      });
      router.push("/");
    } catch (error) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to logout",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Mobile Menu Button */}
      <div className="fixed top-4 left-4 z-50">
        <Button variant="ghost" onClick={() => setIsMenuOpen(!isMenuOpen)}>
          <MenuIcon />
        </Button>
      </div>

      {/* Sidebar */}
      <motion.div
        initial="closed"
        animate={isMenuOpen ? "open" : "closed"}
        variants={sidebarVariants}
        className="fixed w-64 h-screen bg-white shadow-lg z-40 lg:translate-x-0"
      >
        <div className="p-6">
          <h1 className="text-2xl font-bold mt-8">Dashboard</h1>
        </div>
        <nav className="mt-6">
          <div className="px-4 py-2 text-gray-500">Menu</div>
          <button
            className={`w-full p-4 flex items-center space-x-4 hover:bg-gray-100 ${
              currentPage === "categories" ? "bg-gray-100" : ""
            }`}
            onClick={() => handleNavigation("categories")}
          >
            <FolderTree className="w-5 h-5" />
            <span>Categories</span>
          </button>
          <button
            className={`w-full p-4 flex items-center space-x-4 hover:bg-gray-100 ${
              currentPage === "suggestions" ? "bg-gray-100" : ""
            }`}
            onClick={() => handleNavigation("suggestions")}
          >
            <Box className="w-5 h-5" />
            <span>Suggestions</span>
          </button>
          <button
            className={`w-full p-4 flex items-center space-x-4 hover:bg-gray-100 ${
              currentPage === "announcements" ? "bg-gray-100" : ""
            }`}
            onClick={() => handleNavigation("announcements")}
          >
            <Megaphone className="w-5 h-5" />
            <span>Announcements</span>
          </button>
          <button
            className="w-full p-4 flex items-center space-x-4 hover:bg-gray-100"
            onClick={handleLogout}
          >
            <LogOut className="w-5 h-5" />
            <span>Logout</span>
          </button>
        </nav>
      </motion.div>

      {/* Main Content */}
      {renderComponent()}
    </div>
  );
}
