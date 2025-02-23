"use client";
import { useState, useEffect, Suspense } from "react";
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
  FileQuestion,
  PenToolIcon,
  BriefcaseBusiness,
} from "lucide-react";
import CategoryPage from "@/app/components/pages/CategoryPage";
import { useRouter, useSearchParams } from "next/navigation";
import SuggestionsPage from "@/app/components/pages/SuggestionsPage";
import AnnouncementsPage from "@/app/components/pages/AnnouncementsPage";
import HomePage from "@/app/components/pages/HomePage";
import axios from "axios";
import { useToast } from "@/hooks/use-toast";
import QAPairsManager from "@/app/components/pages/QAImportPage";
import QATestingInterface from "@/app/components/pages/ChatbotTest";
import BusinessPage from "@/app/components/pages/BusinessesPage";

// Separate the content that uses useSearchParams
function DashboardContent() {
  const searchParams = useSearchParams();
  const currentPage = searchParams.get("p") || "";

  // Function to render the correct component based on URL
  const renderComponent = () => {
    switch (currentPage) {
      case "categories":
        return <CategoryPage />;
      case "suggestions":
        return <SuggestionsPage />;
      case "announcements":
        return <AnnouncementsPage />;
      case "chatbot":
        return <QAPairsManager />;
      case "test":
        return <QATestingInterface />;
      case "business":
        return <BusinessPage />;
      default:
        return <HomePage />;
    }
  };

  return <>{renderComponent()}</>;
}

export default function Dashboard() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const sidebarVariants = {
    open: { x: 0 },
    closed: { x: "-100%" },
  };

  const handleNavigation = (page) => {
    router.push(`/pages/dashboard?p=${page}`);
    setIsMenuOpen(false);
  };

  const handleLogout = async () => {
    try {
      await axios.get(`${process.env.NEXT_PUBLIC_URL}/api/auth/logout`, {
        withCredentials: true,
      });
      toast({
        title: "Success",
        description: "Logout successfully",
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
            className="w-full p-4 flex items-center space-x-4 hover:bg-gray-100"
            onClick={() => handleNavigation("categories")}
          >
            <FolderTree className="w-5 h-5" />
            <span>Categories</span>
          </button>
          <button
            className="w-full p-4 flex items-center space-x-4 hover:bg-gray-100"
            onClick={() => handleNavigation("business")}
          >
            <BriefcaseBusiness className="w-5 h-5" />
            <span>Businesses</span>
          </button>
          <button
            className="w-full p-4 flex items-center space-x-4 hover:bg-gray-100"
            onClick={() => handleNavigation("suggestions")}
          >
            <Box className="w-5 h-5" />
            <span>Suggestions</span>
          </button>
          <button
            className="w-full p-4 flex items-center space-x-4 hover:bg-gray-100"
            onClick={() => handleNavigation("announcements")}
          >
            <Megaphone className="w-5 h-5" />
            <span>Announcements</span>
          </button>
          <button
            className="w-full p-4 flex items-center space-x-4 hover:bg-gray-100"
            onClick={() => handleNavigation("chatbot")}
          >
            <FileQuestion className="w-5 h-5" />
            <span>Chatbox Config</span>
          </button>
          <button
            className="w-full p-4 flex items-center space-x-4 hover:bg-gray-100"
            onClick={() => handleNavigation("test")}
          >
            <PenToolIcon className="w-5 h-5" />
            <span>Chatbox Test</span>
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

      {/* Main Content with Suspense */}
      <Suspense fallback={<div>Loading...</div>}>
        <DashboardContent />
      </Suspense>
    </div>
  );
}
