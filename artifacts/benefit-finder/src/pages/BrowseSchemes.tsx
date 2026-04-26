import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { useListSchemes } from "@workspace/api-client-react";
import { SchemeCategory } from "@workspace/api-client-react";
import { SchemeCard } from "@/components/SchemeCard";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Search, Loader2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { useDebounce } from "@/hooks/use-debounce";

// Categories for tabs
const categories = [
  { id: "all", label: "All Schemes" },
  { id: SchemeCategory.scholarship, label: "Scholarships" },
  { id: SchemeCategory.healthcare, label: "Healthcare" },
  { id: SchemeCategory.ration, label: "Ration & Food" },
  { id: SchemeCategory.pension, label: "Pensions" },
  { id: SchemeCategory.employment, label: "Employment" },
  { id: SchemeCategory.women, label: "Women & Child" },
];

export function BrowseSchemes() {
  const [searchParams] = useLocation();
  const initialCategory = new URLSearchParams(window.location.search).get("category") || "all";
  
  const [activeTab, setActiveTab] = useState(initialCategory);
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearch = useDebounce(searchTerm, 500);

  const { data: schemes, isLoading } = useListSchemes({
    category: activeTab === "all" ? undefined : activeTab,
    search: debouncedSearch || undefined
  });

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">Browse Government Schemes</h1>
        <p className="text-lg text-muted-foreground">Explore hundreds of benefits available for Indian citizens. Filter by category or search for something specific.</p>
      </div>

      <div className="flex flex-col md:flex-row gap-6 mb-8 items-center justify-between">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
          <Input 
            placeholder="Search schemes, benefits, ministries..." 
            className="pl-10 rounded-full bg-background border-border/60 focus-visible:ring-primary h-12"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full md:w-auto overflow-x-auto pb-2">
          <TabsList className="bg-muted/50 p-1 h-12 rounded-full inline-flex min-w-max">
            {categories.map((cat) => (
              <TabsTrigger 
                key={cat.id} 
                value={cat.id}
                className="rounded-full px-4 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800 data-[state=active]:text-primary data-[state=active]:shadow-sm transition-all"
              >
                {cat.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-[300px] rounded-xl" />
          ))}
        </div>
      ) : schemes && schemes.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {schemes.map((scheme) => (
            <SchemeCard key={scheme.id} scheme={scheme} />
          ))}
        </div>
      ) : (
        <div className="text-center py-24 bg-muted/20 rounded-2xl border border-dashed border-border/60">
          <div className="w-16 h-16 mx-auto bg-muted rounded-full flex items-center justify-center mb-4">
            <Search className="text-muted-foreground" size={24} />
          </div>
          <h3 className="text-xl font-bold mb-2">No schemes found</h3>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">We couldn't find any schemes matching your current filters and search term.</p>
          <Button variant="outline" onClick={() => { setSearchTerm(""); setActiveTab("all"); }}>
            Clear all filters
          </Button>
        </div>
      )}
    </div>
  );
}

