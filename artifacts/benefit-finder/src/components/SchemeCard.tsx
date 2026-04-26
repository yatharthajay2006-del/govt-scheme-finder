import { useState, useEffect } from "react";
import { Link } from "wouter";
import { Scheme } from "@workspace/api-client-react";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { CategoryBadge } from "./CategoryBadge";
import { Button } from "@/components/ui/button";
import { Heart, Sparkles, Building, ArrowRight, CheckCircle2 } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { useToast } from "@/hooks/use-toast";

interface SchemeCardProps {
  scheme: Scheme;
  matchedReasons?: string[];
  matchScore?: number;
  showSaveButton?: boolean;
}

export function SchemeCard({ scheme, matchedReasons, matchScore, showSaveButton = true }: SchemeCardProps) {
  const { language, t } = useI18n();
  const { toast } = useToast();
  const [isSaved, setIsSaved] = useState(false);

  const title = language === "hi" && scheme.nameHindi ? scheme.nameHindi : scheme.name;

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("saved-schemes") || "[]");
    setIsSaved(saved.includes(scheme.id));
  }, [scheme.id]);

  const toggleSave = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    let saved: number[] = JSON.parse(localStorage.getItem("saved-schemes") || "[]");
    if (isSaved) {
      saved = saved.filter(id => id !== scheme.id);
      toast({ title: "Removed from saved", description: "Scheme removed from your saved list." });
    } else {
      saved.push(scheme.id);
      toast({ title: "Saved for later", description: "Scheme added to your saved list." });
    }
    localStorage.setItem("saved-schemes", JSON.stringify(saved));
    setIsSaved(!isSaved);
  };

  return (
    <Card className="h-full flex flex-col overflow-hidden transition-all duration-200 hover:shadow-md border-border/50 group bg-card">
      <CardHeader className="p-5 pb-4 space-y-3">
        <div className="flex justify-between items-start gap-2">
          <div className="flex items-center gap-2 flex-wrap">
            <CategoryBadge category={scheme.category} />
            <span
              className={
                scheme.isCentralScheme
                  ? "text-[10px] font-semibold uppercase tracking-wider bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300 px-2 py-0.5 rounded-full"
                  : "text-[10px] font-semibold uppercase tracking-wider bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300 px-2 py-0.5 rounded-full"
              }
              title={scheme.isCentralScheme ? "Central Government Scheme" : `State Scheme — ${scheme.applicableStates.join(", ")}`}
            >
              {scheme.isCentralScheme ? "Central" : scheme.applicableStates[0] ?? "State"}
            </span>
          </div>
          {showSaveButton && (
            <button 
              onClick={toggleSave}
              className="text-muted-foreground hover:text-red-500 transition-colors p-1"
              aria-label={isSaved ? "Remove from saved" : "Save for later"}
            >
              <Heart size={20} className={isSaved ? "fill-red-500 text-red-500" : ""} />
            </button>
          )}
        </div>
        
        <div>
          {scheme.ministry && (
            <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground mb-1.5 uppercase tracking-wider">
              <Building size={12} />
              {scheme.ministry}
            </div>
          )}
          <h3 className="font-bold text-lg leading-tight line-clamp-2 group-hover:text-primary transition-colors">
            {title}
          </h3>
        </div>
      </CardHeader>
      
      <CardContent className="p-5 pt-0 flex-1 flex flex-col">
        {matchScore !== undefined && matchScore > 0 && (
          <div className="mb-4 inline-flex items-center gap-1.5 bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400 text-xs font-semibold px-2 py-1 rounded-md border border-green-200 dark:border-green-800/50 w-fit">
            <Sparkles size={12} />
            {matchScore}% Match
          </div>
        )}

        <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
          {scheme.shortDescription}
        </p>

        {matchedReasons && matchedReasons.length > 0 && (
          <div className="mt-2 mb-4 bg-primary/5 border border-primary/10 rounded-lg p-3">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-primary mb-2">
              <CheckCircle2 size={14} />
              {t("scheme.why")}
            </div>
            <ul className="space-y-1.5">
              {matchedReasons.slice(0, 2).map((reason, i) => (
                <li key={i} className="text-xs text-foreground/80 flex items-start gap-1.5">
                  <span className="text-primary mt-0.5">•</span>
                  <span className="leading-snug">{reason}</span>
                </li>
              ))}
              {matchedReasons.length > 2 && (
                <li className="text-xs text-muted-foreground pl-3 italic">
                  +{matchedReasons.length - 2} more reasons
                </li>
              )}
            </ul>
          </div>
        )}

        {!matchedReasons && scheme.benefits && scheme.benefits.length > 0 && (
          <div className="mt-auto">
            <h4 className="text-xs font-semibold text-foreground/80 mb-2 uppercase tracking-wide">Key Benefits</h4>
            <ul className="space-y-1.5">
              {scheme.benefits.slice(0, 2).map((benefit, i) => (
                <li key={i} className="text-xs text-muted-foreground flex items-start gap-1.5">
                  <span className="text-secondary mt-0.5">•</span>
                  <span className="line-clamp-1">{benefit}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
      
      <CardFooter className="p-5 pt-4 border-t border-border/50 bg-muted/10">
        <Link href={`/schemes/${scheme.id}`} className="w-full">
          <Button variant="ghost" className="w-full justify-between hover:bg-primary/5 hover:text-primary group/btn">
            View Details
            <ArrowRight size={16} className="transition-transform group-hover/btn:translate-x-1" />
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
}