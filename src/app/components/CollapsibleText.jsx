// components/CollapsibleText.jsx
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp } from "lucide-react";

export default function CollapsibleText({ content, maxLength = 150 }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const shouldCollapse = content.length > maxLength;

  const displayContent =
    !shouldCollapse || isExpanded
      ? content
      : content.slice(0, maxLength) + "...";

  return (
    <div>
      <div
        className="prose max-w-none"
        dangerouslySetInnerHTML={{ __html: displayContent }}
      />
      {shouldCollapse && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsExpanded(!isExpanded)}
          className="mt-2"
        >
          {isExpanded ? (
            <>
              <ChevronUp className="h-4 w-4 mr-2" />
              Show Less
            </>
          ) : (
            <>
              <ChevronDown className="h-4 w-4 mr-2" />
              Show More
            </>
          )}
        </Button>
      )}
    </div>
  );
}
