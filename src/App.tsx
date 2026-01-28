import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { PageTransition } from "@/components/PageTransition";
import AIChatWidget from "@/components/AIChatWidget";
import { PWAInstallPrompt } from "@/components/PWAInstallPrompt";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { PageLoader } from "@/components/LoadingSpinner";
import { CookieConsent } from "@/components/CookieConsent";
import { SkipToContent } from "@/components/SkipToContent";
import { CommandPalette } from "@/components/CommandPalette";
import { ScrollToTop } from "@/components/ScrollToTop";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import '@/i18n/config';
import { useEffect, Suspense, lazy } from 'react';
import { initGA } from '@/lib/analytics';
import { useAnalytics } from '@/hooks/useAnalytics';
import { GoogleTranslateInitializer } from '@/components/GoogleTranslateInitializer';
import { HelmetProvider } from 'react-helmet-async';

// Lazy load all route components for code splitting
const Index = lazy(() => import("./pages/Index"));
const NotFound = lazy(() => import("./pages/NotFound"));
const WebDevelopment = lazy(() => import("./pages/WebDevelopment"));
const ThreeDArchitecture = lazy(() => import("./pages/ThreeDArchitecture"));
const AIAutomation = lazy(() => import("./pages/AIAutomation"));
const GNexusPlatform = lazy(() => import("./pages/GNexusPlatform"));
const About = lazy(() => import("./pages/About"));
const Team = lazy(() => import("./pages/Team"));
const Careers = lazy(() => import("./pages/Careers"));
const Blog = lazy(() => import("./pages/Blog"));
const Contact = lazy(() => import("./pages/Contact"));
const FAQ = lazy(() => import("./pages/FAQ"));
const Documentation = lazy(() => import("./pages/Documentation"));
const Status = lazy(() => import("./pages/Status"));
const Portfolio = lazy(() => import("./pages/Portfolio"));
const Auth = lazy(() => import("./pages/Auth"));
const Admin = lazy(() => import("./pages/Admin"));
const Chat = lazy(() => import("./pages/Chat"));
const Agent = lazy(() => import("./pages/Agent"));
const Workflow = lazy(() => import("./pages/Workflow"));
const Analytics = lazy(() => import("./pages/Analytics"));
const CodeReview = lazy(() => import("./pages/CodeReview"));
const Voice = lazy(() => import("./pages/Voice"));
const Content = lazy(() => import("./pages/Content"));
const Automation = lazy(() => import("./pages/Automation"));
const PredictiveAnalytics = lazy(() => import("./pages/PredictiveAnalytics"));
const Canvas = lazy(() => import("./pages/Canvas"));

// Phase 3-5 Advanced Features
const SecurityAuditPage = lazy(() => import("./pages/SecurityAudit"));
const PrivacyCenter = lazy(() => import("./pages/PrivacyCenter"));
const BiometricAuth = lazy(() => import("./pages/BiometricAuth"));
const Collaboration = lazy(() => import("./pages/Collaboration"));
const Projects = lazy(() => import("./pages/Projects"));
const KnowledgeBasePage = lazy(() => import("./pages/KnowledgeBase"));
const TeamChat = lazy(() => import("./pages/TeamChat"));
const DashboardPage = lazy(() => import("./pages/Dashboard"));
const Themes = lazy(() => import("./pages/Themes"));
const AccessibilityPage = lazy(() => import("./pages/Accessibility"));
const Gestures = lazy(() => import("./pages/Gestures"));
const AIMonitor = lazy(() => import("./pages/AIMonitor"));

const queryClient = new QueryClient();

const AnalyticsTracker = () => {
  useAnalytics();
  return null;
};

const App = () => {
  console.log("App.tsx: App component rendering");
  useEffect(() => {
    console.log("App.tsx: App component mounted");
    initGA();
  }, []);

  return (
    <ErrorBoundary>
      <HelmetProvider>
        <QueryClientProvider client={queryClient}>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <ScrollToTop />
              <SkipToContent />
              <AnalyticsTracker />
              <GoogleTranslateInitializer />
              <PageTransition>
                <Suspense fallback={<PageLoader message="Loading page..." />}>
                  <Routes>
                    <Route path="/" element={<Index />} />
                    <Route path="/web-development" element={<WebDevelopment />} />
                    <Route path="/3d-architecture" element={<ThreeDArchitecture />} />
                    <Route path="/ai-automation" element={<AIAutomation />} />
                    <Route path="/gnexus" element={<GNexusPlatform />} />
                    <Route path="/about" element={<About />} />
                    <Route path="/team" element={<Team />} />
                    <Route path="/careers" element={<Careers />} />
                    <Route path="/blog" element={<Blog />} />
                    <Route path="/contact" element={<Contact />} />
                    <Route path="/faq" element={<FAQ />} />
                    <Route path="/documentation" element={<Documentation />} />
                    <Route path="/status" element={<Status />} />
                    <Route path="/portfolio" element={<Portfolio />} />
                    <Route path="/auth" element={<Auth />} />

                    {/* Protected Routes */}
                    <Route element={<ProtectedRoute />}>
                      <Route path="/admin" element={<Admin />} />
                      <Route path="/chat" element={<Chat />} />
                      <Route path="/agent" element={<Agent />} />
                      <Route path="/workflow" element={<Workflow />} />
                      <Route path="/analytics" element={<Analytics />} />
                      <Route path="/code-review" element={<CodeReview />} />
                      <Route path="/voice" element={<Voice />} />
                      <Route path="/content" element={<Content />} />
                      <Route path="/automation" element={<Automation />} />
                      <Route path="/predictive-analytics" element={<PredictiveAnalytics />} />
                      <Route path="/canvas" element={<Canvas />} />

                      {/* Phase 3: Security & Privacy */}
                      <Route path="/security-audit" element={<SecurityAuditPage />} />
                      <Route path="/privacy" element={<PrivacyCenter />} />
                      <Route path="/biometric" element={<BiometricAuth />} />

                      {/* Phase 4: Collaboration & Productivity */}
                      <Route path="/collaboration" element={<Collaboration />} />
                      <Route path="/projects" element={<Projects />} />
                      <Route path="/knowledge-base" element={<KnowledgeBasePage />} />
                      <Route path="/team-chat" element={<TeamChat />} />

                      {/* Phase 5: User Experience */}
                      <Route path="/dashboard" element={<DashboardPage />} />
                      <Route path="/themes" element={<Themes />} />
                      <Route path="/accessibility" element={<AccessibilityPage />} />
                      <Route path="/gestures" element={<Gestures />} />
                      <Route path="/ai-monitor" element={<AIMonitor />} />
                    </Route>

                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </Suspense>
              </PageTransition>
              <AIChatWidget />
              <CommandPalette />
              <PWAInstallPrompt />
              <CookieConsent />
            </BrowserRouter>
          </TooltipProvider>
        </QueryClientProvider>
      </HelmetProvider>
    </ErrorBoundary>
  );
};

export default App;
