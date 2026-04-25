import { useState, useEffect } from "react";
import { Link } from "wouter";
import { useListSchemes } from "@workspace/api-client-react";
import { SchemeCard } from "@/components/SchemeCard";
import { Button } from "@/components/ui/button";
import { Heart, Search } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export function SavedSchemes() {
  const [savedIds, setSavedIds] = useState<number[]>([]);
  
  useEffect(() => {
    // Read from localStorage on mount and when storage changes
    const readSaved = () => {
      const saved = JSON.parse(localStorage.getItem("saved-schemes") || "[]");
      setSavedIds(saved);
    };
    
    readSaved();
    
    // Listen for changes from other tabs or same tab
    window.addEventListener('storage', readSaved);
    // Custom event dispatch from SchemeCard won't trigger 'storage' event in same window, 
    // so we just rely on the component re-mounting or a manual refresh for now.
    
    return () => window.removeEventListener('storage', readSaved);
  }, []);

  const { data: allSchemes, isLoading } = useListSchemes();
  
  const savedSchemes = allSchemes?.filter(s => savedIds.includes(s.id)) || [];

  return (
    <div className="container mx-auto px-4 py-12 max-w-6xl min-h-[60vh]">
      <div className="mb-10 flex items-center gap-3">
        <div className="p-3 bg-red-100 dark:bg-red-900/30 text-red-500 rounded-xl">
          <Heart size={28} className="fill-red-500" />
        </div>
        <div>
          <h1 className="text-3xl font-bold">Saved Schemes</h1>
          <p className="text-muted-foreground mt-1">Schemes you've bookmarked for later ({savedSchemes.length})</p>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-[300px] rounded-xl" />
          ))}
        </div>
      ) : savedSchemes.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {savedSchemes.map((scheme) => (
            <SchemeCard key={scheme.id} scheme={scheme} />
          ))}
        </div>
      ) : (
        <div className="text-center py-24 bg-muted/20 rounded-3xl border border-dashed border-border/60 max-w-2xl mx-auto">
          <div className="w-20 h-20 mx-auto bg-card rounded-full flex items-center justify-center mb-6 shadow-sm">
            <Heart className="text-muted-foreground/50" size={32} />
          </div>
          <h3 className="text-2xl font-bold mb-3">No saved schemes yet</h3>
          <p className="text-muted-foreground mb-8 text-lg px-6">
            When you find a scheme you're interested in, click the heart icon to save it here for quick access later.
          </p>
          <Link href="/schemes">
            <Button size="lg" className="rounded-full shadow-md">
              <Search className="mr-2" size={18} /> Browse Schemes
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
}