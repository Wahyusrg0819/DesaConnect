"use client";

import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function RefreshButton() {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const router = useRouter();

  const handleRefresh = () => {
    setIsRefreshing(true);
    
    // Refresh data using Next.js router
    router.refresh();
    
    // Reset state after a short delay
    setTimeout(() => {
      setIsRefreshing(false);
    }, 1000);
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleRefresh}
      disabled={isRefreshing}
      className={`flex items-center gap-2 ${isRefreshing ? 'opacity-70' : ''}`}
      aria-label="Refresh data"
    >
      <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
      <span className="hidden xs:inline">Refresh</span>
    </Button>
  );
} 