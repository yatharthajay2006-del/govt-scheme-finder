import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { I18nProvider } from "@/lib/i18n";
import NotFound from "@/pages/not-found";
import { Home } from "@/pages/Home";
import { CheckEligibility } from "@/pages/CheckEligibility";
import { Results } from "@/pages/Results";
import { BrowseSchemes } from "@/pages/BrowseSchemes";
import { SchemeDetail } from "@/pages/SchemeDetail";
import { SavedSchemes } from "@/pages/SavedSchemes";
import { Admin } from "@/pages/Admin";
import { Layout } from "@/components/Layout";

const queryClient = new QueryClient();

function Router() {
  return (
    <Layout>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/check" component={CheckEligibility} />
        <Route path="/results" component={Results} />
        <Route path="/schemes" component={BrowseSchemes} />
        <Route path="/schemes/:id" component={SchemeDetail} />
        <Route path="/saved" component={SavedSchemes} />
        <Route path="/admin" component={Admin} />
        <Route component={NotFound} />
      </Switch>
    </Layout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <I18nProvider>
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
            <Router />
          </WouterRouter>
          <Toaster />
        </I18nProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
