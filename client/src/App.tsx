import DynamicCompressPage from './pages/DynamicCompressPage';
import { Switch, Route, useLocation, Router } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { lazy, Suspense, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";

// Loading component
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
  </div>
);

// Lazy load components
const Landing = lazy(() => import("@/pages/micro-jpeg-landing"));
const Login = lazy(() => import("@/pages/login"));
const Signup = lazy(() => import("@/pages/signup"));
const EmailVerification = lazy(() => import("@/pages/email-verification"));
const FreeSignedCompress = lazy(() => import("@/pages/free-signed-compress"));
const PremiumCompress = lazy(() => import("@/pages/premium-compress"));
const TestPremiumCompress = lazy(() => import("@/pages/test-premium-compress"));
const EnterpriseCompress = lazy(() => import("@/pages/enterprise-compress"));
const Profile = lazy(() => import("@/pages/profile"));
const Dashboard = lazy(() => import("@/pages/dashboard"));
const SimplePricing = lazy(() => import("@/pages/simple-pricing"));
const PricingPage = lazy(() => import("@/pages/PricingPage"));
const PaymentProtection = lazy(() => import("@/pages/payment-protection"));
const EnhancedPricingPage = lazy(() => import("@/pages/EnhancedPricingPage"));
const CheckoutPage = lazy(() => import("@/pages/CheckoutPage"));
const ApiDashboard = lazy(() => import("@/pages/api-dashboard"));
const ApiDocs = lazy(() => import("@/pages/api-docs"));
const ApiDemo = lazy(() => import("@/pages/api-demo"));
const ApiSignup = lazy(() => import("@/pages/api-signup"));
const WebOverview = lazy(() => import("@/pages/web-overview"));
const WebCompress = lazy(() => import("@/pages/web-compress"));
const WebConvert = lazy(() => import("@/pages/web-convert"));
const Tools = lazy(() => import("@/pages/tools"));
const ToolsCompress = lazy(() => import("@/pages/tools-compress"));
const ToolsConvert = lazy(() => import("@/pages/tools-convert"));
const ToolsBatch = lazy(() => import("@/pages/tools-batch"));
const ToolsOptimizer = lazy(() => import("@/pages/tools-optimizer"));
const RemoveBackgroundPage = lazy(() => import("@/pages/remove-background"));
const EnhanceImagePage = lazy(() => import("@/pages/enhance-image"));
const WordPressDetails = lazy(() => import("@/pages/wordpress-details"));
const WordPressInstallation = lazy(() => import("@/pages/wordpress-installation"));
const WordPressDevelopment = lazy(() => import("@/pages/wordpress-development"));
const WordPressImagePlugin = lazy(() => import("@/pages/wordpress-image-plugin"));
const CompressRawFiles = lazy(() => import("@/pages/compress-raw-files"));
const BulkImageCompression = lazy(() => import("@/pages/bulk-image-compression"));
const ConversionPage = lazy(() => import("@/pages/ConversionPage"));
const About = lazy(() => import("@/pages/about"));
const Contact = lazy(() => import("@/pages/contact"));
const Support = lazy(() => import("@/pages/support"));
const Features = lazy(() => import("@/pages/features"));
const Blog = lazy(() => import("@/pages/blog"));
const BlogPost = lazy(() => import("@/pages/blog-post"));
const CancellationPolicy = lazy(() => import("@/pages/cancellation-policy"));
const LegalTerms = lazy(() => import("@/pages/legal-terms"));
const LegalPrivacy = lazy(() => import("@/pages/legal-privacy"));
const LegalCookies = lazy(() => import("@/pages/legal-cookies"));
const LegalCancellation = lazy(() => import("@/pages/legal-cancellation"));
const LegalPaymentProtection = lazy(() => import("@/pages/legal-payment-protection"));
const AirtableExtension = lazy(() => import("@/pages/airtable-extension"));
const IntegrationsPage = lazy(() => import("@/pages/IntegrationsPage"));

// 404 Page
const NotFound = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="text-center">
      <h1 className="text-4xl font-bold mb-4">404 - Page Not Found</h1>
      <p className="text-gray-600 mb-4">The page you're looking for doesn't exist.</p>
      <a href="/" className="text-blue-600 hover:underline">Go back to home</a>
    </div>
  </div>
);

// ========================================
// PROTECTED ROUTE WRAPPER
// ========================================
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isLoading } = useAuth();
  const [, setLocation] = useLocation();

  console.log('[ProtectedRoute] isLoading:', isLoading, 'isAuthenticated:', isAuthenticated);

  // Show loader while checking auth
  if (isLoading) {
    return <PageLoader />;
  }

  // Redirect if not authenticated
  if (!isAuthenticated) {
    console.log('[ProtectedRoute] Not authenticated, redirecting to login');
    // Use window.location for guaranteed redirect
    window.location.href = '/login';
    return <PageLoader />;
  }

  return <>{children}</>;
};

// Simple redirect component
const RedirectTo = ({ to }: { to: string }) => {
  useEffect(() => {
    console.log('[RedirectTo] Redirecting to:', to);
    window.location.href = to;
  }, [to]);
  return <PageLoader />;
};

// Debug wrapper to log route matching
const DebugRoute = ({ path, children }: { path: string; children: React.ReactNode }) => {
  console.log('[Route] Matched path:', path);
  return <>{children}</>;
};

function AppRouter() {
  const [location] = useLocation();

  // Debug: Log current location on every render
  console.log('[AppRouter] Current location:', location);

  return (
    <Suspense fallback={<PageLoader />}>
      <Switch>
        {/* ========================================
            DASHBOARD - MUST BE VERY EARLY
            Using render function pattern for debugging
            ======================================== */}
        <Route path="/dashboard">
          {() => {
            console.log('[Route /dashboard] Matched! Rendering ProtectedRoute > Dashboard');
            return (
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            );
          }}
        </Route>

        <Route path="/profile">
          {() => {
            console.log('[Route /profile] Matched!');
            return (
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            );
          }}
        </Route>

        <Route path="/compress">
          {() => {
            console.log('[Route /compress] Matched!');
            return (
              <ProtectedRoute>
                <DynamicCompressPage />
              </ProtectedRoute>
            );
          }}
        </Route>

        {/* AUTH ROUTES */}
        <Route path="/login">
          {() => {
            console.log('[Route /login] Matched!');
            return <Login />;
          }}
        </Route>
        <Route path="/signup">
          {() => {
            console.log('[Route /signup] Matched!');
            return <Signup />;
          }}
        </Route>
        <Route path="/verify-email" component={EmailVerification} />

        {/* PRICING & CHECKOUT */}
        <Route path="/pricing" component={EnhancedPricingPage} />
        <Route path="/checkout" component={CheckoutPage} />
        <Route path="/simple-pricing" component={SimplePricing} />

        {/* API PAGES */}
        <Route path="/api-docs" component={ApiDocs} />
        <Route path="/api-signup" component={ApiSignup} />
        <Route path="/api-demo" component={ApiDemo} />
        <Route path="/api-dashboard" component={ApiDashboard} />

        {/* AI TOOLS */}
        <Route path="/remove-background" component={RemoveBackgroundPage} />
        <Route path="/enhance-image" component={EnhanceImagePage} />
        <Route path="/airtable-extension" component={AirtableExtension} />
        <Route path="/integrations" component={IntegrationsPage} />

        {/* TOOLS - Specific paths before wildcard */}
        <Route path="/tools/compress" component={ToolsCompress} />
        <Route path="/tools/convert" component={ToolsConvert} />
        <Route path="/tools/batch" component={ToolsBatch} />
        <Route path="/tools/optimizer" component={ToolsOptimizer} />
        <Route path="/tools/bulk" component={BulkImageCompression} />
        <Route path="/tools/raw" component={CompressRawFiles} />
        <Route path="/tools" component={Tools} />

        {/* COMPRESSION TIERS */}
        <Route path="/premium" component={PremiumCompress} />
        <Route path="/enterprise" component={EnterpriseCompress} />
        <Route path="/test-premium" component={TestPremiumCompress} />

        {/* CONTENT PAGES */}
        <Route path="/about" component={About} />
        <Route path="/contact" component={Contact} />
        <Route path="/support" component={Support} />
        <Route path="/features" component={Features} />
        <Route path="/blog" component={Blog} />

        {/* LEGAL PAGES */}
        <Route path="/legal/terms" component={LegalTerms} />
        <Route path="/legal/privacy" component={LegalPrivacy} />
        <Route path="/legal/cookies" component={LegalCookies} />
        <Route path="/legal/cancellation" component={LegalCancellation} />
        <Route path="/legal/payment-protection" component={LegalPaymentProtection} />

        {/* WORDPRESS */}
        <Route path="/wordpress-plugin/install" component={WordPressInstallation} />
        <Route path="/wordpress-plugin/docs" component={WordPressImagePlugin} />
        <Route path="/wordpress-plugin/api" component={WordPressDevelopment} />
        <Route path="/wordpress-plugin/download" component={WordPressDetails} />
        <Route path="/wordpress-plugin" component={WordPressDetails} />

        {/* ========================================
            LEGACY REDIRECTS
            ======================================== */}
        <Route path="/free">
          {() => {
            console.log('[Route /free] Matched! Redirecting to /');
            return <RedirectTo to="/" />;
          }}
        </Route>
        <Route path="/compress-free">{() => <RedirectTo to="/" />}</Route>
        <Route path="/compress-premium">{() => <RedirectTo to="/premium" />}</Route>
        <Route path="/compress-enterprise">{() => <RedirectTo to="/enterprise" />}</Route>
        <Route path="/terms-of-service">{() => <RedirectTo to="/legal/terms" />}</Route>
        <Route path="/privacy-policy">{() => <RedirectTo to="/legal/privacy" />}</Route>
        <Route path="/cookie-policy">{() => <RedirectTo to="/legal/cookies" />}</Route>
        <Route path="/cancellation-policy">{() => <RedirectTo to="/legal/cancellation" />}</Route>
        <Route path="/payment-protection">{() => <RedirectTo to="/legal/payment-protection" />}</Route>
        <Route path="/wordpress/details">{() => <RedirectTo to="/wordpress-plugin" />}</Route>
        <Route path="/wordpress/installation">{() => <RedirectTo to="/wordpress-plugin/install" />}</Route>
        <Route path="/wordpress-installation">{() => <RedirectTo to="/wordpress-plugin/install" />}</Route>
        <Route path="/wordpress/development">{() => <RedirectTo to="/wordpress-plugin/api" />}</Route>
        <Route path="/wordpress-development">{() => <RedirectTo to="/wordpress-plugin/api" />}</Route>
        <Route path="/wordpress-image-plugin">{() => <RedirectTo to="/wordpress-plugin/docs" />}</Route>
        <Route path="/web/overview">{() => <RedirectTo to="/tools" />}</Route>
        <Route path="/web/compress">{() => <RedirectTo to="/tools/compress" />}</Route>
        <Route path="/web/convert">{() => <RedirectTo to="/tools/convert" />}</Route>
        <Route path="/compress-raw-files">{() => <RedirectTo to="/tools" />}</Route>
        <Route path="/bulk-image-compression">{() => <RedirectTo to="/tools" />}</Route>

        {/* ========================================
            DYNAMIC ROUTES - MUST BE AFTER ALL STATIC ROUTES
            ======================================== */}
        <Route path="/blog/:slug" component={BlogPost} />
        <Route path="/convert/:conversion" component={ConversionPage} />
        <Route path="/compress/:format" component={ConversionPage} />
        <Route path="/tools/:format" component={ConversionPage} />

        {/* ========================================
            HOME - Put near the end to avoid matching other routes
            ======================================== */}
        <Route path="/">
          {() => {
            console.log('[Route /] Matched! Rendering Landing');
            return <Landing />;
          }}
        </Route>

        {/* 404 - Absolute last */}
        <Route>
          {() => {
            console.log('[Route 404] No route matched!');
            return <NotFound />;
          }}
        </Route>
      </Switch>
    </Suspense>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <AppRouter />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
