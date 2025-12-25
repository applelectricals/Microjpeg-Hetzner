import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { Menu, X, Crown } from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { useLocation } from "wouter";
import logoUrl from '@assets/mascot-logo-optimized.png';
import { Moon, Sun } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';


interface HeaderProps {
  isDark?: boolean;
  onToggleDark?: () => void;
}

export default function Header({ isDark, onToggleDark }: HeaderProps = {}) {
  const { user, isAuthenticated, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [usageStats, setUsageStats] = useState<any>(null);
  const [location, setLocation] = useLocation();
  const [isSigningOut, setIsSigningOut] = useState(false);

  // Fetch tier info to determine if user is paid
  const { data: tierInfo } = useQuery({
    queryKey: ['/api/user/tier-info'],
    enabled: isAuthenticated,
    retry: false,
    staleTime: 60000, // Cache for 1 minute
  });

  // Check if user is on a paid tier (Starter)
  const isPaidUser = tierInfo?.tier?.tierName && 
    !['free', 'free_registered', 'free_anonymous'].includes(tierInfo.tier.tierName);

  // Silent tracking - fetch stats but don't display counter
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('/api/universal-usage-stats', {
          method: 'GET',
          credentials: 'include',
          cache: 'no-store',
        });
        
        if (response.ok) {
          const data = await response.json();
          setUsageStats(data);
        }
      } catch (error) {
        // Silent fail for stats
      }
    };

    fetchStats();
    const interval = setInterval(fetchStats, 30000);
    const handleRefresh = () => fetchStats();
    
    window.addEventListener('refreshUniversalCounter', handleRefresh);
    
    return () => {
      clearInterval(interval);
      window.removeEventListener('refreshUniversalCounter', handleRefresh);
    };
  }, []);

  // Robust sign out handler
  const handleSignOut = useCallback(async (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    if (isSigningOut) return;
    
    setIsSigningOut(true);
    console.log('[Header] Sign out initiated');
    
    try {
      // Clear all local storage
      localStorage.clear();
      sessionStorage.clear();
      
      // Try multiple logout endpoints - your backend might use different ones
      const logoutEndpoints = [
        { url: '/api/auth/logout', method: 'POST' },
        { url: '/api/logout', method: 'POST' },
        { url: '/api/logout', method: 'GET' },
      ];
      
      for (const endpoint of logoutEndpoints) {
        try {
          const response = await fetch(endpoint.url, {
            method: endpoint.method,
            credentials: 'include',
            headers: {
              'Content-Type': 'application/json',
            },
          });
          
          if (response.ok) {
            console.log(`[Header] Logout successful via ${endpoint.url}`);
            break;
          }
        } catch (err) {
          // Continue to next endpoint
        }
      }
      
      // If useAuth has a logout method, call it too
      if (typeof logout === 'function') {
        await logout();
      }
      
    } catch (error) {
      console.error('[Header] Sign out error:', error);
    } finally {
      // ALWAYS redirect to home, even if API calls failed
      // Use window.location for a full page refresh to clear all state
      window.location.href = '/';
    }
  }, [isSigningOut, logout]);

  // Navigate to dashboard
  const handleDashboardClick = useCallback((e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    console.log('[Header] Dashboard clicked');
    // Use full page navigation to ensure route is properly loaded
    window.location.href = '/dashboard';
  }, []);

  return (
    <>
      {/* Mobile Header */}
      <header className="lg:hidden sticky top-0 left-0 right-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur border-b border-gray-200/50 dark:border-gray-700/50 h-16">
        <div className="flex items-center justify-between h-16 px-4">
          <a href="/" className="flex items-center gap-2">
            <img src={logoUrl} alt="MicroJPEG Logo" className="w-8 h-8 object-contain" />
            <div className="flex flex-col">
              <span className="text-lg font-bold font-poppins text-brand-dark dark:text-white">MicroJPEG</span>
              <span className="text-xs font-opensans text-brand-dark dark:text-gray-300 opacity-70 tracking-wider">PICTURE PERFECT</span>
            </div>
          </a>

          {/* Dark Mode Toggle - Mobile */}
          {onToggleDark && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onToggleDark}
              className="rounded-full mr-2"
              type="button"
            >
              {isDark ? (
                <Sun className="h-5 w-5 text-yellow-500" />
              ) : (
                <Moon className="h-5 w-5 text-gray-700 dark:text-gray-300" />
              )}
            </Button>
          )}
          
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 border border-gray-300 dark:border-gray-600 rounded bg-transparent"
            aria-label="Open menu"
            type="button"
          >
            <Menu className="w-5 h-5 text-brand-dark dark:text-white" />
          </button>
        </div>
      </header>

      {/* Desktop Header */}
      <header className="hidden lg:block sticky top-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur border-b border-brand-gold/20 dark:border-gray-700/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <a href="/" className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
              <img src={logoUrl} alt="MicroJPEG Logo" className="w-8 h-8 sm:w-[45px] sm:h-[45px]" />
              <div className="flex flex-col">
                <span className="text-lg sm:text-2xl font-bold font-poppins text-brand-dark dark:text-white">MicroJPEG</span>
                <span className="text-xs font-opensans text-brand-dark/70 dark:text-gray-300/70 tracking-widest">PICTURE PERFECT</span>
              </div>
            </a>
            
            {/* Navigation - Using <a> tags for reliable navigation */}
            <nav className="hidden lg:flex items-center gap-6 xl:gap-8">
              {/* Premium Tools Link - Only show for paid users */}
              {isPaidUser && (
                <a 
                  href="/compress" 
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-teal-500 to-teal-600 text-white rounded-lg font-medium hover:from-teal-600 hover:to-teal-700 transition-all shadow-sm"
                >
                  <Crown className="w-4 h-4" />
                  <span>Premium Tools</span>
                </a>
              )}
              <a href="/tools/convert" className="text-brand-dark/80 dark:text-gray-300/80 hover:text-brand-dark dark:hover:text-white font-opensans font-medium transition-colors">
                Convert
              </a>
              <a href="/api-docs#overview" className="text-brand-dark/80 dark:text-gray-300/80 hover:text-brand-dark dark:hover:text-white font-opensans font-medium transition-colors">
                API
              </a>
              <a href="/remove-background" className="text-brand-dark/80 dark:text-gray-300/80 hover:text-brand-dark dark:hover:text-white font-opensans font-medium transition-colors">
                AI Remove Background
              </a>
              <a href="/enhance-image" className="text-brand-dark/80 dark:text-gray-300/80 hover:text-brand-dark dark:hover:text-white font-opensans font-medium transition-colors">
                AI Image Upscaler
              </a>
              <a href="/blog" className="text-brand-dark/80 dark:text-gray-300/80 hover:text-brand-dark dark:hover:text-white font-opensans font-medium transition-colors">
                Blogs
              </a>
              <a href="/pricing" className="text-brand-dark/80 dark:text-gray-300/80 hover:text-brand-dark dark:hover:text-white font-opensans font-medium transition-colors">
                Pricing
              </a>
            </nav>

            {/* Dark Mode Toggle - Desktop */}
            {onToggleDark && (
              <Button
                variant="ghost"
                size="icon"
                onClick={onToggleDark}
                className="rounded-full"
                type="button"
              >
                {isDark ? (
                  <Sun className="h-5 w-5 text-yellow-500" />
                ) : (
                  <Moon className="h-5 w-5 text-gray-700 dark:text-gray-300" />
                )}
              </Button>
            )}

            {/* Auth Buttons - Desktop */}
            <div className="hidden lg:flex items-center gap-2 lg:gap-4 flex-shrink-0">
              {isAuthenticated ? (
                <div className="flex items-center gap-2 lg:gap-3">
                  {/* Dashboard - Using <a> tag for reliable navigation */}
                  <a
                    href="/dashboard"
                    className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 px-3"
                  >
                    Dashboard
                  </a>
                  {/* Sign Out - Using button with explicit handler */}
                  <button
                    type="button"
                    disabled={isSigningOut}
                    onClick={handleSignOut}
                    className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 px-3 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSigningOut ? 'Signing out...' : 'Sign Out'}
                  </button>
                </div>
              ) : (
                <a 
                  href="/login"
                  className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 bg-brand-gold hover:bg-brand-gold-dark text-white h-9 px-3"
                >
                  Login
                </a>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div 
          className="lg:hidden fixed inset-0 z-40" 
          onClick={() => setIsMobileMenuOpen(false)} 
          style={{ backgroundColor: 'rgba(0,0,0,0.3)' }}
        >
          <div 
            className="absolute top-16 right-4 w-60 bg-white dark:bg-gray-800 rounded-lg shadow-2xl border dark:border-gray-700" 
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <div className="flex justify-end p-2">
              <button 
                onClick={() => setIsMobileMenuOpen(false)} 
                className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
                aria-label="Close menu"
                type="button"
              >
                <X className="w-4 h-4 text-gray-600 dark:text-gray-400" />
              </button>
            </div>

            <div className="px-4 pb-4 space-y-3">
              {/* Premium Tools Link - Only show for paid users (Mobile) */}
              {isPaidUser && (
                <a
                  href="/compress"
                  className="flex items-center gap-2 py-2 px-3 bg-gradient-to-r from-teal-500 to-teal-600 text-white rounded-lg font-medium"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <Crown className="w-4 h-4" />
                  Premium Tools
                </a>
              )}
              
              {/* Navigation Links - Using <a> tags */}
              <div>
                <a
                  href="/tools/convert"
                  className="block py-2 text-brand-dark dark:text-white font-medium hover:bg-gray-50 dark:hover:bg-gray-700 rounded px-2"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Convert
                </a>
                <a
                  href="/api-docs#overview"
                  className="block py-2 text-brand-dark dark:text-white font-medium hover:bg-gray-50 dark:hover:bg-gray-700 rounded px-2"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  API
                </a>
                <a
                  href="/remove-background"
                  className="block py-2 text-brand-dark dark:text-white font-medium hover:bg-gray-50 dark:hover:bg-gray-700 rounded px-2"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Remove Background
                </a>
                <a
                  href="/enhance-image"
                  className="block py-2 text-brand-dark dark:text-white font-medium hover:bg-gray-50 dark:hover:bg-gray-700 rounded px-2"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  AI Enhancer
                </a>
                <a
                  href="/blog"
                  className="block py-2 text-brand-dark dark:text-white font-medium hover:bg-gray-50 dark:hover:bg-gray-700 rounded px-2"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Blogs
                </a>
                <a
                  href="/pricing"
                  className="block py-2 text-brand-dark dark:text-white font-medium hover:bg-gray-50 dark:hover:bg-gray-700 rounded px-2"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Pricing
                </a>
              </div>

              {/* Dark Mode Toggle in Menu */}
              {onToggleDark && (
                <button 
                  type="button"
                  onClick={() => onToggleDark()} 
                  className="flex items-center gap-2 w-full text-left py-2 text-brand-dark dark:text-white font-medium hover:bg-gray-50 dark:hover:bg-gray-700 rounded px-2 bg-transparent border-none cursor-pointer"
                >
                  {isDark ? (
                    <>
                      <Sun className="h-4 w-4 text-yellow-500" />
                      <span>Light Mode</span>
                    </>
                  ) : (
                    <>
                      <Moon className="h-4 w-4" />
                      <span>Dark Mode</span>
                    </>
                  )}
                </button>
              )}

              <hr className="border-gray-200 dark:border-gray-600" />

              {/* Auth Buttons - Mobile */}
              {isAuthenticated ? (
                <div className="space-y-2">
                  <a 
                    href="/dashboard"
                    className="flex items-center justify-start w-full py-2 px-3 text-sm font-medium rounded-md border border-input bg-background hover:bg-accent hover:text-accent-foreground"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Dashboard
                  </a>
                  <button 
                    type="button"
                    disabled={isSigningOut}
                    onClick={(e) => {
                      setIsMobileMenuOpen(false);
                      handleSignOut(e);
                    }}
                    className="flex items-center justify-start w-full py-2 px-3 text-sm font-medium rounded-md border border-input bg-background hover:bg-accent hover:text-accent-foreground cursor-pointer disabled:opacity-50"
                  >
                    {isSigningOut ? 'Signing out...' : 'Sign Out'}
                  </button>
                </div>
              ) : (
                <a 
                  href="/login"
                  className="flex items-center justify-center w-full py-2 px-3 text-sm font-medium rounded-md bg-brand-gold hover:bg-brand-gold-dark text-white"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Login
                </a>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
