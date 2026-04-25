import { useRoute } from "wouter";
import { useGetScheme } from "@workspace/api-client-react";
import { CategoryBadge } from "@/components/CategoryBadge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, ExternalLink, Building, CheckCircle, FileText, ListOrdered, Share2 } from "lucide-react";
import { Link } from "wouter";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useI18n } from "@/lib/i18n";

export function SchemeDetail() {
  const [match, params] = useRoute("/schemes/:id");
  const id = match && params?.id ? parseInt(params.id) : 0;
  const { language } = useI18n();

  const { data: scheme, isLoading, isError } = useGetScheme(id, { 
    query: { enabled: !!id, queryKey: ["/api/schemes", id] } 
  });

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Skeleton className="h-8 w-32 mb-8" />
        <Skeleton className="h-48 w-full rounded-2xl mb-8" />
        <Skeleton className="h-8 w-64 mb-4" />
        <Skeleton className="h-32 w-full mb-8" />
      </div>
    );
  }

  if (isError || !scheme) {
    return (
      <div className="container mx-auto px-4 py-24 text-center max-w-md">
        <h2 className="text-2xl font-bold mb-4">Scheme Not Found</h2>
        <p className="text-muted-foreground mb-8">The scheme you're looking for doesn't exist or has been removed.</p>
        <Link href="/schemes">
          <Button>Back to Schemes</Button>
        </Link>
      </div>
    );
  }

  const title = language === "hi" && scheme.nameHindi ? scheme.nameHindi : scheme.name;

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: scheme.name,
        text: scheme.shortDescription,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      // Could add toast here
    }
  };

  return (
    <div className="bg-background min-h-screen pb-24">
      {/* Top Nav */}
      <div className="border-b bg-card sticky top-16 z-40">
        <div className="container mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/schemes" className="text-sm font-medium text-muted-foreground hover:text-foreground flex items-center gap-1.5 transition-colors">
            <ArrowLeft size={16} /> Back
          </Link>
          <Button variant="ghost" size="sm" onClick={handleShare} className="gap-2">
            <Share2 size={16} /> Share
          </Button>
        </div>
      </div>

      {/* Hero */}
      <div className="bg-muted/30 border-b">
        <div className="container mx-auto px-4 py-12 max-w-4xl">
          <CategoryBadge category={scheme.category} className="mb-6" />
          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-4 leading-tight">{title}</h1>
          
          <div className="flex flex-wrap items-center gap-x-6 gap-y-3 text-sm text-muted-foreground font-medium mb-8">
            {scheme.ministry && (
              <div className="flex items-center gap-1.5 text-foreground/80">
                <Building size={16} className="text-primary" />
                {scheme.ministry}
              </div>
            )}
            <div className="flex items-center gap-1.5">
              <span className="text-xs uppercase tracking-wider bg-black/5 dark:bg-white/10 px-2 py-1 rounded">
                {scheme.applicableStates.length === 0 ? "All India" : `${scheme.applicableStates.length} States`}
              </span>
            </div>
          </div>

          <p className="text-lg md:text-xl text-muted-foreground leading-relaxed mb-8 max-w-3xl">
            {scheme.description}
          </p>

          <Button size="lg" className="rounded-full shadow-lg px-8 bg-gradient-to-r from-primary to-secondary" onClick={() => window.open(scheme.officialLink, '_blank')}>
            Apply on Official Portal <ExternalLink size={18} className="ml-2" />
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <Tabs defaultValue="benefits" className="w-full">
          <TabsList className="w-full justify-start h-12 bg-transparent border-b rounded-none mb-8 space-x-6 overflow-x-auto pb-px">
            <TabsTrigger value="benefits" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:shadow-none data-[state=active]:bg-transparent px-0">
              Benefits
            </TabsTrigger>
            <TabsTrigger value="eligibility" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:shadow-none data-[state=active]:bg-transparent px-0">
              Eligibility Rules
            </TabsTrigger>
            <TabsTrigger value="process" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:shadow-none data-[state=active]:bg-transparent px-0">
              Application Process
            </TabsTrigger>
          </TabsList>

          <TabsContent value="benefits" className="space-y-8 animate-in fade-in-50">
            <div className="bg-card border rounded-2xl p-6 md:p-8 shadow-sm">
              <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                <CheckCircle className="text-green-500" /> What you get
              </h3>
              <ul className="space-y-4">
                {scheme.benefits.map((benefit, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <div className="mt-1 w-2 h-2 rounded-full bg-primary shrink-0" />
                    <span className="text-foreground leading-relaxed">{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>
          </TabsContent>

          <TabsContent value="eligibility" className="space-y-8 animate-in fade-in-50">
            <div className="bg-card border rounded-2xl p-6 md:p-8 shadow-sm mb-6 bg-primary/5 border-primary/10">
              <h3 className="text-xl font-bold mb-4">Summary</h3>
              <p className="text-foreground/80 leading-relaxed">{scheme.eligibilitySummary}</p>
            </div>
            
            <div className="bg-card border rounded-2xl p-6 md:p-8 shadow-sm">
              <h3 className="text-xl font-bold mb-6">Detailed Criteria</h3>
              <ul className="space-y-4">
                {scheme.eligibilityRules.map((rule, i) => (
                  <li key={i} className="flex items-center gap-3 bg-muted/30 p-4 rounded-lg border border-border/50">
                    <CheckCircle size={18} className="text-primary shrink-0" />
                    <span className="text-foreground">{rule.label}</span>
                  </li>
                ))}
              </ul>
            </div>
          </TabsContent>

          <TabsContent value="process" className="space-y-8 animate-in fade-in-50">
            <div className="grid md:grid-cols-2 gap-8">
              <div className="bg-card border rounded-2xl p-6 md:p-8 shadow-sm">
                <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                  <FileText className="text-secondary" /> Required Documents
                </h3>
                <ul className="space-y-4">
                  {scheme.requiredDocuments.map((doc, i) => (
                    <li key={i} className="flex items-start gap-3 bg-background p-3 rounded-lg border shadow-sm">
                      <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center shrink-0 text-xs font-medium mt-0.5">
                        {i + 1}
                      </div>
                      <span className="text-sm text-foreground/80 leading-snug">{doc}</span>
                    </li>
                  ))}
                </ul>
              </div>
              
              <div className="bg-card border rounded-2xl p-6 md:p-8 shadow-sm">
                <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                  <ListOrdered className="text-primary" /> Step by Step
                </h3>
                <div className="relative pl-4 border-l-2 border-muted-foreground/20 space-y-8">
                  {scheme.applySteps.map((step, i) => (
                    <div key={i} className="relative">
                      <div className="absolute -left-[25px] bg-background border-2 border-primary w-4 h-4 rounded-full top-1" />
                      <p className="text-sm text-foreground/80 leading-relaxed pl-2">{step}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}