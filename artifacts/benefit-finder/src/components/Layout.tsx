import { ReactNode, useState } from "react";
import { Link, useLocation } from "wouter";
import { useI18n } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { Menu, X, Heart, ShieldCheck, Search, Home as HomeIcon } from "lucide-react";

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const { language, setLanguage, t } = useI18n();
  const [location] = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleLanguage = () => {
    setLanguage(language === "en" ? "hi" : "en");
  };

  const navLinks = [
    { href: "/", label: t("nav.home"), icon: HomeIcon },
    { href: "/schemes", label: t("nav.schemes"), icon: Search },
    { href: "/saved", label: t("nav.saved"), icon: Heart },
    { href: "/admin", label: "Admin", icon: ShieldCheck },
  ];

  return (
    <div className="min-h-[100dvh] flex flex-col bg-background text-foreground selection:bg-primary/20">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-bold shadow-md group-hover:shadow-lg transition-all">
              AI
            </div>
            <span className="font-bold text-lg tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">
              Benefit Finder
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <Link key={link.href} href={link.href} className={`text-sm font-medium transition-colors hover:text-primary ${location === link.href ? "text-primary" : "text-muted-foreground"}`}>
                {link.label}
              </Link>
            ))}
            <div className="h-4 w-px bg-border mx-2" />
            <button onClick={toggleLanguage} className="text-sm font-medium hover:text-primary transition-colors px-2 py-1 rounded-md hover:bg-muted">
              {language === "en" ? "हिंदी" : "EN"}
            </button>
            <Link href="/check">
              <Button className="rounded-full shadow-md hover:shadow-lg transition-all" size="sm">
                {t("nav.check")}
              </Button>
            </Link>
          </nav>

          {/* Mobile Menu Toggle */}
          <div className="flex md:hidden items-center gap-4">
            <button onClick={toggleLanguage} className="text-sm font-medium">
              {language === "en" ? "HI" : "EN"}
            </button>
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 text-foreground"
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Nav */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-border/40 bg-background absolute w-full left-0 top-16 shadow-lg">
            <nav className="flex flex-col p-4 gap-4">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center gap-3 text-sm font-medium p-2 rounded-md ${location === link.href ? "bg-primary/10 text-primary" : "text-muted-foreground"}`}
                >
                  <link.icon size={18} />
                  {link.label}
                </Link>
              ))}
              <div className="mt-2 pt-4 border-t border-border/40 flex justify-center">
                <Link href="/check" onClick={() => setIsMobileMenuOpen(false)} className="w-full">
                  <Button className="w-full rounded-full">{t("nav.check")}</Button>
                </Link>
              </div>
            </nav>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col">
        {children}
      </main>

      {/* Footer */}
      <footer className="border-t border-border/40 bg-muted/30 py-12 mt-auto">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div className="col-span-1 md:col-span-2">
              <Link href="/" className="flex items-center gap-2 mb-4">
                <div className="w-6 h-6 rounded bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-bold text-xs">
                  AI
                </div>
                <span className="font-bold text-foreground">Benefit Finder</span>
              </Link>
              <p className="text-sm text-muted-foreground max-w-sm mb-4">
                Empowering citizens to discover and access government schemes easily through AI-powered matching.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-4 text-sm">Quick Links</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/" className="hover:text-primary transition-colors">Home</Link></li>
                <li><Link href="/schemes" className="hover:text-primary transition-colors">Browse Schemes</Link></li>
                <li><Link href="/check" className="hover:text-primary transition-colors">Check Eligibility</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4 text-sm">Legal</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-primary transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Terms of Service</a></li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-border/40 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-xs text-muted-foreground">
              © {new Date().getFullYear()} AI Benefit Finder. Built for India.
            </p>
            <div className="flex items-center gap-2 text-xs text-muted-foreground bg-primary/5 px-3 py-1.5 rounded-full border border-primary/10">
              <ShieldCheck size={14} className="text-primary" />
              <span>This is an unofficial discovery tool. Always verify on the official portal.</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}