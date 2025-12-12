import DynamicCompressPage from './pages/DynamicCompressPage';
import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { lazy, Suspense, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";

// Loading component for better UX during chunk loading
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
  </div>
);

// ProtectedRoute wrapper — redirects unauthenticated users to /login
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  const [, setLocation] = useLocation();

  // While auth status is loading, show loader
  if (isLoading) return <PageLoader />;

  // If not authenticated, redirect to login
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      setLocation('/login');
    }
  }, [isLoading, isAuthenticated, setLocation]);

  if (!isAuthenticated) return null;

  return <>{children}</>;
};

// Lazy load components - Critical pages first
const Landing = lazy(() => import("@/pages/micro-jpeg-landing"));

// Authentication pages
const Login = lazy(() => import("@/pages/login"));
const Signup = lazy(() => import("@/pages/signup"));
const EmailVerification = lazy(() => import("@/pages/email-verification"));

// Core compression pages
const FreeSignedCompress = lazy(() => import("@/pages/free-signed-compress"));
const PremiumCompress = lazy(() => import("@/pages/premium-compress"));
const TestPremiumCompress = lazy(() => import("@/pages/test-premium-compress"));
const EnterpriseCompress = lazy(() => import("@/pages/enterprise-compress"));

// User dashboard pages
const Profile = lazy(() => import("@/pages/profile"));
const Dashboard = lazy(() => import("@/pages/dashboard"));

// Payment and subscription pages
const SimplePricing = lazy(() => import("@/pages/simple-pricing"));
const PricingPage = lazy(() => import("@/pages/PricingPage"));
const PaymentProtection = lazy(() => import("@/pages/payment-protection"));
const EnhancedPricingPage = lazy(() => import("@/pages/EnhancedPricingPage"));
const CheckoutPage = lazy(() => import("@/pages/CheckoutPage"));

// API related pages
const ApiDashboard = lazy(() => import("@/pages/api-dashboard"));
const ApiDocs = lazy(() => import("@/pages/api-docs"));
const ApiDemo = lazy(() => import("@/pages/api-demo"));
const ApiSignup = lazy(() => import("@/pages/api-signup"));

// Web tools pages
const WebOverview = lazy(() => import("@/pages/web-overview"));
const WebCompress = lazy(() => import("@/pages/web-compress"));
const WebConvert = lazy(() => import("@/pages/web-convert"));

// Tools pages
const Tools = lazy(() => import("@/pages/tools"));
const ToolsCompress = lazy(() => import("@/pages/tools-compress"));
const ToolsConvert = lazy(() => import("@/pages/tools-convert"));
const ToolsBatch = lazy(() => import("@/pages/tools-batch"));
const ToolsOptimizer = lazy(() => import("@/pages/tools-optimizer"));
const RemoveBackgroundPage = lazy(() => import("@/pages/remove-background"));
const EnhanceImagePage = lazy(() => import("@/pages/enhance-image"));

// WordPress integration pages
const WordPressDetails = lazy(() => import("@/pages/wordpress-details"));
const WordPressInstallation = lazy(() => import("@/pages/wordpress-installation"));
const WordPressDevelopment = lazy(() => import("@/pages/wordpress-development"));
const WordPressImagePlugin = lazy(() => import("@/pages/wordpress-image-plugin"));

// SEO and marketing pages
const CompressRawFiles = lazy(() => import("@/pages/compress-raw-files"));
const BulkImageCompression = lazy(() => import("@/pages/bulk-image-compression"));

// Dynamic conversion page
const ConversionPage = lazy(() => import("@/pages/ConversionPage"));

// Content pages
const About = lazy(() => import("@/pages/about"));
const Contact = lazy(() => import("@/pages/contact"));
const Support = lazy(() => import("@/pages/support"));
const Features = lazy(() => import("@/pages/features"));
const Blog = lazy(() => import("@/pages/blog"));
const BlogPost = lazy(() => import("@/pages/blog-post"));

// Legal pages
const CancellationPolicy = lazy(() => import("@/pages/cancellation-policy"));
const LegalTerms = lazy(() => import("@/pages/legal-terms"));
const LegalPrivacy = lazy(() => import("@/pages/legal-privacy"));
const LegalCookies = lazy(() => import("@/pages/legal-cookies"));
const LegalCancellation = lazy(() => import("@/pages/legal-cancellation"));
const LegalPaymentProtection = lazy(() => import("@/pages/legal-payment-protection"));

// Redirect components for legacy URLs
const LegalRedirect = ({ to }: { to: string }) => {
  const [, setLocation] = useLocation();
  useEffect(() => { setLocation(to); }, [to, setLocation]);
  return null;
};

const WordPressRedirect = ({ to }: { to: string }) => {
  const [, setLocation] = useLocation();
  useEffect(() => { setLocation(to); }, [to, setLocation]);
  return null;
};

const CompressRedirect = ({ to }: { to: string }) => {
  const [, setLocation] = useLocation();
  useEffect(() => { setLocation(to); }, [to, setLocation]);
  return null;
};

const WebToolsRedirect = ({ to }: { to: string }) => {
  const [, setLocation] = useLocation();
  useEffect(() => { setLocation(to); }, [to, setLocation]);
  return null;
};

// Error pages
const NotFound = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="text-center">
      <h1 className="text-4xl font-bold mb-4">404 - Page Not Found</h1>
      <p className="text-gray-600 mb-4">The page you're looking for doesn't exist.</p>
      <a href="/" className="text-blue-600 hover:underline">Go back to home</a>
    </div>
  </div>
);

function Router() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Switch>
        {/* ========================================== */}
        {/* STATIC ROUTES - MUST COME FIRST */}
        {/* ========================================== */}
        
        {/* Home */}
        <Route path="/" component={Landing} />
        
        {/* Authentication - Always available */}
        <Route path="/login" component={Login} />
        <Route path="/signup" component={Signup} />
        <Route path="/verify-email" component={EmailVerification} />
        
        {/* Dashboard & Profile - Protected but ALWAYS REGISTERED */}
        <Route path="/dashboard">
          {() => (
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          )}
        </Route>
        <Route path="/profile">
          {() => (
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          )}
        </Route>
        
        {/* Pricing & Checkout */}
        <Route path="/pricing" component={EnhancedPricingPage} />
        <Route path="/checkout" component={CheckoutPage} />
        <Route path="/simple-pricing" component={SimplePricing} />
        
        {/* API pages */}
        <Route path="/api-docs" component={ApiDocs} />
        <Route path="/api-signup" component={ApiSignup} />
        <Route path="/api-demo" component={ApiDemo} />
        <Route path="/api-dashboard" component={ApiDashboard} />
        
        {/* AI Tools */}
        <Route path="/remove-background" component={RemoveBackgroundPage} />
        <Route path="/enhance-image" component={EnhanceImagePage} />
        
        {/* Tools hierarchy */}
        <Route path="/tools" component={Tools} />
        <Route path="/tools/compress" component={ToolsCompress} />
        <Route path="/tools/convert" component={ToolsConvert} />
        <Route path="/tools/batch" component={ToolsBatch} />
        <Route path="/tools/optimizer" component={ToolsOptimizer} />
        <Route path="/tools/bulk" component={BulkImageCompression} />
        <Route path="/tools/raw" component={CompressRawFiles} />
        
        {/* Compression pages */}
        <Route path="/compress">
          {() => (
            <ProtectedRoute>
              <DynamicCompressPage />
            </ProtectedRoute>
          )}
        </Route>
        <Route path="/premium" component={PremiumCompress} />
        <Route path="/enterprise" component={EnterpriseCompress} />
        <Route path="/test-premium" component={TestPremiumCompress} />
        
        {/* Content pages */}
        <Route path="/about" component={About} />
        <Route path="/contact" component={Contact} />
        <Route path="/support" component={Support} />
        <Route path="/features" component={Features} />
        <Route path="/blog" component={Blog} />
        <Route path="/blog/:slug" component={BlogPost} />
        
        {/* Legal pages - New hierarchy */}
        <Route path="/legal/terms" component={LegalTerms} />
        <Route path="/legal/privacy" component={LegalPrivacy} />
        <Route path="/legal/cookies" component={LegalCookies} />
        <Route path="/legal/cancellation" component={LegalCancellation} />
        <Route path="/legal/payment-protection" component={LegalPaymentProtection} />
        
        {/* WordPress Plugin hierarchy */}
        <Route path="/wordpress-plugin" component={WordPressDetails} />
        <Route path="/wordpress-plugin/install" component={WordPressInstallation} />
        <Route path="/wordpress-plugin/docs" component={WordPressImagePlugin} />
        <Route path="/wordpress-plugin/api" component={WordPressDevelopment} />
        <Route path="/wordpress-plugin/download" component={WordPressDetails} />
        
        {/* ========================================== */}
        {/* LEGACY REDIRECTS */}
        {/* ========================================== */}
        <Route path="/free" component={() => <CompressRedirect to="/" />} />
        <Route path="/compress-free" component={() => <CompressRedirect to="/" />} />
        <Route path="/compress-premium" component={() => <CompressRedirect to="/premium" />} />
        <Route path="/compress-enterprise" component={() => <CompressRedirect to="/enterprise" />} />
        
        {/* Legacy legal redirects */}
        <Route path="/terms-of-service" component={() => <LegalRedirect to="/legal/terms" />} />
        <Route path="/privacy-policy" component={() => <LegalRedirect to="/legal/privacy" />} />
        <Route path="/cookie-policy" component={() => <LegalRedirect to="/legal/cookies" />} />
        <Route path="/cancellation-policy" component={() => <LegalRedirect to="/legal/cancellation" />} />
        <Route path="/payment-protection" component={() => <LegalRedirect to="/legal/payment-protection" />} />
        
        {/* Legacy WordPress redirects */}
        <Route path="/wordpress/details" component={() => <WordPressRedirect to="/wordpress-plugin" />} />
        <Route path="/wordpress/installation" component={() => <WordPressRedirect to="/wordpress-plugin/install" />} />
        <Route path="/wordpress-installation" component={() => <WordPressRedirect to="/wordpress-plugin/install" />} />
        <Route path="/wordpress/development" component={() => <WordPressRedirect to="/wordpress-plugin/api" />} />
        <Route path="/wordpress-development" component={() => <WordPressRedirect to="/wordpress-plugin/api" />} />
        <Route path="/wordpress-image-plugin" component={() => <WordPressRedirect to="/wordpress-plugin/docs" />} />
        
        {/* Legacy web tools redirects */}
        <Route path="/web/overview" component={() => <WebToolsRedirect to="/tools" />} />
        <Route path="/web/compress" component={() => <WebToolsRedirect to="/tools/compress" />} />
        <Route path="/web/convert" component={() => <WebToolsRedirect to="/tools/convert" />} />
        
        {/* Legacy SEO redirects */}
        <Route path="/compress-raw-files" component={() => <CompressRedirect to="/tools" />} />
        <Route path="/bulk-image-compression" component={() => <CompressRedirect to="/tools" />} />
        
        {/* ========================================== */}
        {/* DYNAMIC ROUTES - MUST COME LAST */}
        {/* ========================================== */}
        <Route path="/convert/:conversion" component={ConversionPage} />
        <Route path="/compress/:format" component={ConversionPage} />
        <Route path="/tools/:format" component={ConversionPage} />
        
        {/* 404 - Very last */}
        <Route component={NotFound} />
      </Switch>
    </Suspense>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
