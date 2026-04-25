import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { EligibilityResult } from "@workspace/api-client-react";
import { SchemeCard } from "@/components/SchemeCard";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { CheckCircle2, FileText, ArrowRight, Download, RefreshCcw, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";

export function Results() {
  const [location, setLocation] = useLocation();
  const [result, setResult] = useState<EligibilityResult | null>(null);
  
  useEffect(() => {
    const saved = sessionStorage.getItem("last-eligibility-result");
    if (!saved) {
      setLocation("/check");
      return;
    }
    setResult(JSON.parse(saved));
  }, [setLocation]);

  if (!result) return null;

  const handlePrint = () => {
    window.print();
  };

  if (result.matches.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16 max-w-3xl text-center">
        <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center mx-auto mb-6">
          <AlertCircle size={40} className="text-muted-foreground" />
        </div>
        <h1 className="text-3xl font-bold mb-4">No exact matches found</h1>
        <p className="text-lg text-muted-foreground mb-8">
          Based on the details provided, we couldn't find schemes that match your exact profile right now. Government schemes change frequently, and new ones are added regularly.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/check">
            <Button variant="outline" size="lg" className="rounded-full">
              <RefreshCcw className="mr-2" size={18} /> Try different details
            </Button>
          </Link>
          <Link href="/schemes">
            <Button size="lg" className="rounded-full">
              Browse all schemes <ArrowRight className="ml-2" size={18} />
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12 max-w-5xl pb-32">
      {/* Header for print - hidden on screen */}
      <div className="hidden print:block mb-8 pb-8 border-b">
        <h1 className="text-2xl font-bold text-black mb-2">AI Benefit Finder - Eligibility Report</h1>
        <p className="text-gray-600">Generated on {new Date().toLocaleDateString()}</p>
        <div className="mt-4 p-4 border rounded bg-gray-50">
          <h3 className="font-semibold mb-2">Profile Used:</h3>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>Age: {result.profile.age || 'N/A'}</div>
            <div>State: {result.profile.state || 'N/A'}</div>
            <div>Student: {result.profile.isStudent ? 'Yes' : 'No'}</div>
            <div>Income: {result.profile.annualIncome ? `₹${result.profile.annualIncome}` : 'N/A'}</div>
          </div>
        </div>
      </div>

      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 print:hidden">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-100 text-green-700 text-sm font-semibold mb-4">
            <CheckCircle2 size={16} /> Matches Found
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight">
            You qualify for <span className="text-primary">{result.totalMatched}</span> schemes
          </h1>
          <p className="text-muted-foreground mt-3 text-lg">
            We've analyzed your profile and found these government benefits you can apply for today.
          </p>
        </div>
        
        <div className="flex items-center gap-3 shrink-0">
          <Button variant="outline" onClick={handlePrint} className="bg-white/50 backdrop-blur">
            <Download className="mr-2" size={16} /> Download Report
          </Button>
          <Link href="/check">
            <Button variant="ghost">Start Over</Button>
          </Link>
        </div>
      </div>

      <div className="space-y-8">
        {result.matches.sort((a, b) => b.matchScore - a.matchScore).map((match, index) => (
          <motion.div 
            key={match.scheme.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-card border rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow print:shadow-none print:border-gray-300 print:break-inside-avoid"
          >
            {/* Top Card Section */}
            <div className="p-0 border-b border-border/40">
              <SchemeCard 
                scheme={match.scheme} 
                matchedReasons={match.matchedReasons}
                matchScore={match.matchScore}
              />
            </div>
            
            {/* Expandable Details Section */}
            <div className="px-6 py-4 bg-muted/10 print:block">
              <Accordion type="single" collapsible className="w-full" defaultValue="item-1">
                <AccordionItem value="item-1" className="border-b-0">
                  <AccordionTrigger className="text-sm font-semibold hover:no-underline print:hidden">
                    View application steps and requirements
                  </AccordionTrigger>
                  <AccordionContent className="pt-4 pb-2 print:block">
                    <div className="grid md:grid-cols-2 gap-8">
                      {/* Documents */}
                      <div>
                        <h4 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                          <FileText size={18} className="text-secondary" />
                          Required Documents
                        </h4>
                        <ul className="space-y-3">
                          {match.scheme.requiredDocuments.map((doc, i) => (
                            <li key={i} className="flex items-start gap-3 bg-background p-3 rounded-lg border shadow-sm">
                              <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center shrink-0 text-xs font-medium mt-0.5">
                                {i + 1}
                              </div>
                              <span className="text-sm text-foreground/80 leading-snug">{doc}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      
                      {/* Steps */}
                      <div>
                        <h4 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                          <CheckCircle2 size={18} className="text-primary" />
                          How to Apply
                        </h4>
                        <div className="relative pl-4 border-l-2 border-muted-foreground/20 space-y-6">
                          {match.scheme.applySteps.map((step, i) => (
                            <div key={i} className="relative">
                              <div className="absolute -left-[25px] bg-background border-2 border-primary w-4 h-4 rounded-full top-1" />
                              <p className="text-sm text-foreground/80 leading-relaxed pl-2">{step}</p>
                            </div>
                          ))}
                        </div>
                        
                        <div className="mt-6 pt-6 border-t border-border/50 print:hidden">
                          <Button className="w-full rounded-full" onClick={() => window.open(match.scheme.officialLink, '_blank')}>
                            Apply on Official Portal <ArrowRight className="ml-2" size={16} />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>
          </motion.div>
        ))}
      </div>
      
      <div className="mt-12 text-center print:hidden bg-muted/30 p-8 rounded-2xl border border-dashed">
        <h3 className="font-semibold mb-2">Didn't find what you need?</h3>
        <p className="text-muted-foreground mb-4">You might qualify for other schemes if you change your profile details.</p>
        <Link href="/schemes">
          <Button variant="outline">Browse all {result.totalMatched} schemes manually</Button>
        </Link>
      </div>
    </div>
  );
}