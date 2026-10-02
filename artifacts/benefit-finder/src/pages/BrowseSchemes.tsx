import { useMemo, useState } from "react";
import { useListSchemes } from "@workspace/api-client-react";
import { SchemeCategory } from "@workspace/api-client-react";
import { SchemeCard } from "@/components/SchemeCard";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { useDebounce } from "@/hooks/use-debounce";

const categories = [
  { id: "all", label: "All categories" },
  { id: SchemeCategory.scholarship, label: "Scholarships" },
  { id: SchemeCategory.healthcare, label: "Healthcare" },
  { id: SchemeCategory.ration, label: "Ration & Food" },
  { id: SchemeCategory.pension, label: "Pensions" },
  { id: SchemeCategory.employment, label: "Employment" },
  { id: SchemeCategory.women, label: "Women & Child" },
  { id: SchemeCategory.housing, label: "Housing" },
  { id: SchemeCategory.agriculture, label: "Agriculture" },
  { id: SchemeCategory.disability, label: "Disability" },
  { id: SchemeCategory.other, label: "Other" },
];

type SchemeScope = "all" | "central" | "state";

export function BrowseSchemes() {
  const initialCategory = new URLSearchParams(window.location.search).get("category") || "all";

  const [activeTab, setActiveTab] = useState(initialCategory);
  const [searchTerm, setSearchTerm] = useState("");
  const [schemeScope, setSchemeScope] = useState<SchemeScope>("all");
  const [selectedState, setSelectedState] = useState("all");
  const debouncedSearch = useDebounce(searchTerm, 500);

  // The catalog is small enough to filter locally, which keeps the state list
  // stable while a text search or another filter is active.
  const { data: schemes, isLoading } = useListSchemes();

  const availableStates = useMemo(
    () =>
      Array.from(
        new Set(
          (schemes ?? [])
            .filter((scheme) => !(scheme.isCentralScheme ?? scheme.applicableStates.length === 0))
            .flatMap((scheme) => scheme.applicableStates ?? [])
            .map((state) => state.trim())
            .filter(Boolean),
        ),
      ).sort((a, b) => a.localeCompare(b)),
    [schemes],
  );

  const filteredSchemes = useMemo(
    () =>
      (schemes ?? []).filter((scheme) => {
        const isCentral = scheme.isCentralScheme ?? scheme.applicableStates.length === 0;
        const searchIndex = [
          scheme.name,
          scheme.nameHindi,
          scheme.shortDescription,
          scheme.description,
          scheme.ministry,
          ...(scheme.tags ?? []),
          ...(scheme.benefits ?? []),
          ...(scheme.applicableStates ?? []),
        ]
          .filter(Boolean)
          .join(" ")
          .toLocaleLowerCase();
        const matchesSearch =
          !debouncedSearch.trim() ||
          searchIndex.includes(debouncedSearch.trim().toLocaleLowerCase());
        const matchesCategory = activeTab === "all" || scheme.category === activeTab;
        const matchesScope =
          schemeScope === "all" ||
          (schemeScope === "central" && isCentral) ||
          (schemeScope === "state" && !isCentral);
        const matchesState =
          selectedState === "all" ||
          isCentral ||
          (scheme.applicableStates ?? []).some(
            (state) => state.trim().toLocaleLowerCase() === selectedState.toLocaleLowerCase(),
          );

        return matchesSearch && matchesCategory && matchesScope && matchesState;
      }),
    [schemes, debouncedSearch, activeTab, schemeScope, selectedState],
  );

  const hasFilters =
    activeTab !== "all" ||
    schemeScope !== "all" ||
    selectedState !== "all" ||
    searchTerm.length > 0;

  const clearFilters = () => {
    setSearchTerm("");
    setActiveTab("all");
    setSchemeScope("all");
    setSelectedState("all");
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">Browse Government Schemes</h1>
        <p className="text-lg text-muted-foreground">
          Explore benefits available for Indian citizens. Combine category, government, and state filters
          to find schemes that fit your needs.
        </p>
      </div>

      <div className="mb-8 rounded-2xl border border-border/60 bg-card p-4 sm:p-6 shadow-sm">
        <div className="flex flex-col lg:flex-row gap-4 lg:items-center lg:justify-between">
          <div className="relative w-full lg:max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
            <Input
              placeholder="Search schemes, benefits, ministries..."
              className="pl-10 rounded-xl bg-background border-border/60 focus-visible:ring-primary h-12"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              aria-label="Search schemes, benefits, or ministries"
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
            <div className="flex items-center gap-2 text-sm text-muted-foreground shrink-0">
              <SlidersHorizontal size={16} />
              <span>Filter by</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full sm:w-auto">
              <Select value={selectedState} onValueChange={setSelectedState}>
                <SelectTrigger className="w-full sm:w-[190px] h-11 rounded-xl bg-background" aria-label="Filter by state">
                  <SelectValue placeholder="All states" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All states</SelectItem>
                  {availableStates.map((state) => (
                    <SelectItem key={state} value={state}>
                      {state}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <div className="mt-5">
          <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
            Government
          </div>
          <div className="flex flex-wrap gap-2" role="group" aria-label="Filter by government">
            {[
              { value: "all", label: "All schemes" },
              { value: "central", label: "Central" },
              { value: "state", label: "State" },
            ].map((option) => (
              <button
                key={option.value}
                type="button"
                aria-pressed={schemeScope === option.value}
                onClick={() => setSchemeScope(option.value as SchemeScope)}
                className={`rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
                  schemeScope === option.value
                    ? "border-primary bg-primary text-primary-foreground shadow-sm"
                    : "border-border bg-background text-muted-foreground hover:border-primary/40 hover:text-foreground"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-5">
          <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
            Category
          </div>
          <div
            className="flex gap-2 overflow-x-auto pb-2 -mx-1 px-1"
            role="group"
            aria-label="Filter by category"
          >
            {categories.map((category) => (
              <button
                key={category.id}
                type="button"
                aria-pressed={activeTab === category.id}
                onClick={() => setActiveTab(category.id)}
                className={`shrink-0 rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
                  activeTab === category.id
                    ? "border-primary bg-primary text-primary-foreground shadow-sm"
                    : "border-border bg-background text-muted-foreground hover:border-primary/40 hover:text-foreground"
                }`}
              >
                {category.label}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-border/60 pt-4">
          <p className="text-sm text-muted-foreground" aria-live="polite">
            Showing <span className="font-semibold text-foreground">{filteredSchemes.length}</span>
            {schemes ? ` of ${schemes.length}` : ""} schemes
            {selectedState !== "all" && schemeScope !== "central" ? ` available in ${selectedState}` : ""}
          </p>
          {hasFilters && (
            <Button variant="ghost" size="sm" onClick={clearFilters} className="h-9 gap-1.5">
              <X size={14} />
              Clear filters
            </Button>
          )}
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-[300px] rounded-xl" />
          ))}
        </div>
      ) : filteredSchemes.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSchemes.map((scheme) => (
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
          <Button variant="outline" onClick={clearFilters}>
            Clear all filters
          </Button>
        </div>
      )}
    </div>
  );
}

