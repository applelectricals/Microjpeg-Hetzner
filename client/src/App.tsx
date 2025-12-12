import DynamicCompressPage from './pages/DynamicCompressPage';
import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { lazy, Suspense, useEffect, useState } from "react";
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
// DASHBOARD PAGE WRAPPER - Handles auth check inline
// ========================================
const DashboardPage = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const [, setLocation] = useLocation();
  
  console.log('[DashboardPage] Rendering - isLoading:', isLoading, 'isAuthenticated:', isAuthenticated);
  
  // Show loader while checking auth
  if (isLoading) {
    return <PageLoader />;
  }
  
  // Redirect if not authenticated
  if (!isAuthenticated) {
    console.log('[DashboardPage] Not authenticated, redirecting to login');
    // Use useEffect to avoid render-time side effects
    useEffect(() => {
      setLocation('/login');
    }, []);
    return <PageLoader />;
  }
  
  // User is authenticated, render dashboard
  return <Dashboard />;
};

// Profile page wrapper
const ProfilePage = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const [, setLocation] = useLocation();
  
  if (isLoading) {
    return <PageLoader />;
  }
  
  if (!isAuthenticated) {
    useEffect(() => {
      setLocation('/login');
    }, []);
    return <PageLoader />;
  }
  
  return <Profile />;
};

// Compress page wrapper (for authenticated compress)
const CompressPage = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const [, setLocation] = useLocation();
  
  if (isLoading) {
    return <PageLoader />;
  }
  
  if (!isAuthenticated) {
    useEffect(() => {
      setLocation('/login');
    }, []);
    return <PageLoader />;
  }
  
  return <DynamicCompressPage />;
};

// Login page - redirect if already logged in
const LoginPage = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const [, setLocation] = useLocation();
  
  if (isLoading) {
    return <PageLoader />;
  }
  
  if (isAuthenticated) {
    useEffect(() => {
      setLocation('/dashboard');
    }, []);
    return <PageLoader />;
  }
  
  return <Login />;
};

// Signup page - redirect if already logged in
const SignupPage = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const [, setLocation] = useLocation();
  
  if (isLoading) {
    return <PageLoader />;
  }
  
  if (isAuthenticated) {
    useEffect(() => {
      setLocation('/dashboard');
    }, []);
    return <PageLoader />;
  }
  
  return <Signup />;
};

// Simple redirect component
const RedirectTo = ({ to }: { to: string }) => {
  const [, setLocation] = useLocation();
  useEffect(() => {
    setLocation(to);
  }, [to, setLocation]);
  return <PageLoader />;
};

function Router() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Switch>
        {/* HOME - must be exact */}
        <Route path="/" component={Landing} />
        
        {/* ========================================
            CRITICAL: DASHBOARD ROUTE - MUST BE BEFORE ANY WILDCARDS
            ======================================== */}
        <Route path="/dashboard" component={DashboardPage} />
        <Route path="/profile" component={ProfilePage} />
        <Route path="/compress" component={CompressPage} />
        
        {/* AUTH ROUTES */}
        <Route path="/login" component={LoginPage} />
        <Route path="/signup" component={SignupPage} />
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
        
        {/* TOOLS */}
        <Route path="/tools" component={Tools} />
        <Route path="/tools/compress" component={ToolsCompress} />
        <Route path="/tools/convert" component={ToolsConvert} />
        <Route path="/tools/batch" component={ToolsBatch} />
        <Route path="/tools/optimizer" component={ToolsOptimizer} />
        <Route path="/tools/bulk" component={BulkImageCompression} />
        <Route path="/tools/raw" component={CompressRawFiles} />
        
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
        <Route path="/wordpress-plugin" component={WordPressDetails} />
        <Route path="/wordpress-plugin/install" component={WordPressInstallation} />
        <Route path="/wordpress-plugin/docs" component={WordPressImagePlugin} />
        <Route path="/wordpress-plugin/api" component={WordPressDevelopment} />
        <Route path="/wordpress-plugin/download" component={WordPressDetails} />
        
        {/* ========================================
            LEGACY REDIRECTS - After all static routes
            ======================================== */}
        <Route path="/free">{() => <RedirectTo to="/" />}</Route>
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
            DYNAMIC ROUTES - MUST BE LAST (before 404)
            These have wildcards that could match anything
            ======================================== */}
        <Route path="/blog/:slug" component={BlogPost} />
        <Route path="/convert/:conversion" component={ConversionPage} />
        <Route path="/compress/:format" component={ConversionPage} />
        <Route path="/tools/:format" component={ConversionPage} />
        
        {/* 404 - Absolute last */}
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
