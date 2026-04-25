import { useEffect } from "react";
import { Link } from "wouter";
import { useI18n } from "@/lib/i18n";
import { useGetStatsOverview, useListPopularSchemes } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { SchemeCard } from "@/components/SchemeCard";
import { ArrowRight, MessageCircle, ClipboardCheck, CheckCircle, Search, Users, Shield, Award } from "lucide-react";
import { motion } from "framer-motion";
import { Skeleton } from "@/components/ui/skeleton";

export function Home() {
  const { t, language } = useI18n();
  const { data: stats } = useGetStatsOverview();
  const { data: popularSchemes, isLoading: popularLoading } = useListPopularSchemes();

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative pt-20 pb-24 md:pt-32 md:pb-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-secondary/5 -z-10" />
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <motion.div 
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="max-w-2xl"
            >
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-semibold mb-6">
                <Shield size={14} />
                Govt. of India Schemes
              </div>
              <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-foreground mb-6 leading-[1.1]">
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">
                  {t("hero.title")}
                </span>
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground mb-8 leading-relaxed">
                {t("hero.subtitle")}
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/check" className="w-full sm:w-auto">
                  <Button size="lg" className="w-full sm:w-auto text-lg h-14 px-8 rounded-full shadow-lg shadow-primary/20 hover:shadow-xl hover:-translate-y-0.5 transition-all">
                    {t("hero.cta")}
                    <ArrowRight className="ml-2" size={20} />
                  </Button>
                </Link>
                <Link href="/schemes" className="w-full sm:w-auto">
                  <Button size="lg" variant="outline" className="w-full sm:w-auto text-lg h-14 px-8 rounded-full bg-white/50 backdrop-blur-sm border-2">
                    <Search className="mr-2" size={20} />
                    {t("nav.schemes")}
                  </Button>
                </Link>
              </div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
              className="relative hidden md:block"
            >
              <div className="absolute -inset-4 bg-gradient-to-tr from-primary/20 to-secondary/20 rounded-3xl blur-2xl -z-10" />
              <img 
                src="/hero-illustration.png" 
                alt="Indian family discovering benefits" 
                className="w-full h-auto rounded-2xl shadow-2xl border border-white/20"
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Strip */}
      <section className="border-y border-border/40 bg-muted/30">
        <div className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 divide-y md:divide-y-0 md:divide-x divide-border/40 text-center">
            <div className="pt-4 md:pt-0">
              <div className="text-4xl font-extrabold text-primary mb-2">
                {stats ? stats.totalSchemes : <Skeleton className="h-10 w-24 mx-auto" />}
              </div>
              <div className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">{t("stats.schemes")}</div>
            </div>
            <div className="pt-8 md:pt-0">
              <div className="text-4xl font-extrabold text-secondary mb-2">
                {stats ? `${(stats.totalChecks / 1000).toFixed(1)}k+` : <Skeleton className="h-10 w-32 mx-auto" />}
              </div>
              <div className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">{t("stats.checks")}</div>
            </div>
            <div className="pt-8 md:pt-0">
              <div className="text-4xl font-extrabold text-primary mb-2">
                {stats ? stats.totalStatesCovered : <Skeleton className="h-10 w-16 mx-auto" />}
              </div>
              <div className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">{t("stats.states")}</div>
            </div>
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="py-24 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl font-bold mb-4">Finding benefits is easy</h2>
            <p className="text-muted-foreground">Just answer a few questions and our AI will match you with government schemes you qualify for.</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-12 relative">
            <div className="hidden md:block absolute top-12 left-[15%] right-[15%] h-0.5 bg-gradient-to-r from-primary/20 via-secondary/20 to-primary/20" />
            
            {[
              { icon: MessageCircle, title: "1. Tell us about yourself", desc: "Share basic details or just speak naturally using our voice assistant." },
              { icon: ClipboardCheck, title: "2. AI finds your matches", desc: "We scan hundreds of schemes to find exactly what you qualify for." },
              { icon: CheckCircle, title: "3. Apply with confidence", desc: "Get a clear checklist of required documents and step-by-step instructions." }
            ].map((step, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.2 }}
                className="relative bg-card rounded-2xl p-8 border border-border shadow-sm text-center z-10"
              >
                <div className="w-16 h-16 mx-auto bg-gradient-to-br from-primary/10 to-secondary/10 rounded-full flex items-center justify-center mb-6">
                  <step.icon size={32} className="text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-3">{step.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Popular Schemes */}
      <section className="py-24 bg-muted/20">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-4">
            <div>
              <h2 className="text-3xl font-bold mb-4">Popular Schemes</h2>
              <p className="text-muted-foreground max-w-xl">Discover the most frequently accessed benefits by our users across India.</p>
            </div>
            <Link href="/schemes">
              <Button variant="ghost" className="group">
                View all schemes
                <ArrowRight className="ml-2 transition-transform group-hover:translate-x-1" size={16} />
              </Button>
            </Link>
          </div>

          {popularLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-[280px] rounded-xl" />
              ))}
            </div>
          ) : (
            <motion.div 
              variants={container}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: "-100px" }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {popularSchemes?.slice(0, 3).map((scheme) => (
                <motion.div key={scheme.id} variants={item} className="h-full">
                  <SchemeCard scheme={scheme} />
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      </section>

      {/* Why it matters */}
      <section className="py-24 bg-gradient-to-br from-secondary to-indigo-900 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <Award className="w-16 h-16 mx-auto mb-8 text-primary opacity-80" />
            <h2 className="text-3xl md:text-5xl font-bold mb-8 leading-tight">Crores of rupees in benefits go unclaimed every year.</h2>
            <p className="text-xl text-white/80 mb-12 leading-relaxed">
              Language barriers, complex eligibility rules, and lack of awareness keep millions of Indians from accessing the help they deserve. AI Benefit Finder changes that.
            </p>
            <Link href="/check">
              <Button size="lg" className="bg-primary hover:bg-primary/90 text-white border-0 h-14 px-8 rounded-full text-lg shadow-xl shadow-black/20">
                Claim Your Benefits Now
              </Button>
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}