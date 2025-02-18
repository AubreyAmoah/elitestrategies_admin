"use client";

import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Filter, SortAsc, SortDesc } from "lucide-react";

export default function ItemFilters({
  items,
  onFilterChange,
  onSortChange,
  minPrice,
  maxPrice,
}) {
  const [filters, setFilters] = useState({
    search: "",
    minPrice: minPrice,
    maxPrice: maxPrice,
    features: [],
  });
  const [sortConfig, setSortConfig] = useState({
    field: "name",
    direction: "asc",
  });

  // Get unique features from all items
  const allFeatures = [
    ...new Set(items.flatMap((item) => item.features || [])),
  ];

  const handleFilterChange = (newFilters) => {
    const updatedFilters = { ...filters, ...newFilters };
    setFilters(updatedFilters);
    onFilterChange(updatedFilters);
  };

  const handleSortChange = (field) => {
    const direction =
      sortConfig.field === field && sortConfig.direction === "asc"
        ? "desc"
        : "asc";
    const newSortConfig = { field, direction };
    setSortConfig(newSortConfig);
    onSortChange(newSortConfig);
  };

  return (
    <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
      <div className="flex justify-between items-center">
        <Input
          placeholder="Search items..."
          value={filters.search}
          onChange={(e) => handleFilterChange({ search: e.target.value })}
          className="max-w-xs"
        />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">
              <SortAsc className="h-4 w-4 mr-2" />
              Sort By
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={() => handleSortChange("name")}>
              Name{" "}
              {sortConfig.field === "name" &&
                (sortConfig.direction === "asc" ? "↑" : "↓")}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleSortChange("price")}>
              Price{" "}
              {sortConfig.field === "price" &&
                (sortConfig.direction === "asc" ? "↑" : "↓")}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Price Range</Label>
          <div className="flex items-center space-x-2">
            <Input
              type="number"
              value={filters.minPrice}
              onChange={(e) =>
                handleFilterChange({ minPrice: parseFloat(e.target.value) })
              }
              placeholder="Min"
              className="w-24"
            />
            <span>to</span>
            <Input
              type="number"
              value={filters.maxPrice}
              onChange={(e) =>
                handleFilterChange({ maxPrice: parseFloat(e.target.value) })
              }
              placeholder="Max"
              className="w-24"
            />
          </div>
        </div>

        <div>
          <Label>Features</Label>
          <Select
            onValueChange={(feature) => {
              const newFeatures = filters.features.includes(feature)
                ? filters.features.filter((f) => f !== feature)
                : [...filters.features, feature];
              handleFilterChange({ features: newFeatures });
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select features" />
            </SelectTrigger>
            <SelectContent>
              {allFeatures.map((feature) => (
                <SelectItem key={feature} value={feature}>
                  {feature}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {filters.features.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {filters.features.map((feature) => (
            <Button
              key={feature}
              variant="secondary"
              size="sm"
              onClick={() =>
                handleFilterChange({
                  features: filters.features.filter((f) => f !== feature),
                })
              }
            >
              {feature} ×
            </Button>
          ))}
        </div>
      )}
    </div>
  );
}
