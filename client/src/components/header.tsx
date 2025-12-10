import { SiWordpress } from "react-icons/si";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { Menu, X } from "lucide-react";
import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import logoUrl from '@assets/mascot-logo-optimized.png';
import { Moon, Sun } from 'lucide-react';


interface HeaderProps {
  isDark?: boolean;
  onToggleDark?: () => void;
}

export default function Header({ isDark, onToggleDark }: HeaderProps = {}) {
  const { user, isAuthenticated } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [usageStats, setUsageStats] = useState<any>(null);
  const [location] = useLocation();

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
        } else {
          console.error('Failed to fetch usage stats:', response.status);
        }
      } catch (error) {
        console.error('Error fetching usage stats:', error);
      }
    };

    fetchStats();
    const interval = setInterval(fetchStats, 30000);
    const handleRefresh = () => {
      fetchStats();
    };
    
    window.addEventListener('refreshUniversalCounter', handleRefresh);
    
    return () => {
      clearInterval(interval);
      window.removeEventListener('refreshUniversalCounter', handleRefresh);
    };
  }, []);

  return (
    <>
      {/* Mobile Header */}
      <header className="lg:hidden sticky top-0 left-0 right-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur border-b border-gray-200/50 dark:border-gray-700/50 h-16">
        <div className="flex items-center justify-between h-16 px-4">
          <div className="flex items-center gap-2">
            <img src={logoUrl} alt="MicroJPEG Logo" className="w-8 h-8 object-contain" />
            
            <div className="flex flex-col">
              <span className="text-lg font-bold font-poppins text-brand-dark dark:text-white">MicroJPEG</span>
              <span className="text-xs font-opensans text-brand-dark dark:text-gray-300 opacity-70 tracking-wider">PICTURE PERFECT</span>
            </div>
          </div>
{/* Dark Mode Toggle - Mobile */}
          {onToggleDark && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onToggleDark}
              className="rounded-full mr-2"
            >
              {isDark ? (
                <Sun className="h-5 w-5 text-yellow-500" />
              ) : (
                <Moon className="h-5 w-5 text-gray-700 dark:text-gray-300" />
              )}
            </Button>
          )}

          
          {/* Mobile: No counter display - silent tracking only */}
          
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 border border-gray-300 dark:border-gray-600 rounded bg-transparent"
            aria-label="Open menu"
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
            <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
              <img src={logoUrl} alt="MicroJPEG Logo" className="w-8 h-8 sm:w-[45px] sm:h-[45px]" />
              <div className="flex flex-col">
                <span className="text-lg sm:text-2xl font-bold font-poppins text-brand-dark dark:text-white">MicroJPEG</span>
                <span className="text-xs font-opensans text-brand-dark/70 dark:text-gray-300/70 tracking-widest">PICTURE PERFECT</span>
              </div>
            </div>
            
            {/* Navigation */}
            <nav className="hidden lg:flex items-center gap-6 xl:gap-8">
              <a href="/web/overview" className="text-brand-dark/80 dark:text-gray-300/80 hover:text-brand-dark dark:hover:text-white font-opensans font-medium transition-colors">
                Web
              </a>
              <a href="/api-docs#overview" className="text-brand-dark/80 dark:text-gray-300/80 hover:text-brand-dark dark:hover:text-white font-opensans font-medium transition-colors">
                API
              </a>
              <a href="/wordpress-plugin" className="text-brand-dark/80 dark:text-gray-300/80 hover:text-brand-dark dark:hover:text-white font-opensans font-medium transition-colors flex items-center gap-1">
                <SiWordpress className="w-4 h-4" />
                Plugin
              </a>
              <a href="/remove-background" className="text-brand-dark/80 dark:text-gray-300/80 hover:text-brand-dark dark:hover:text-white font-opensans font-medium transition-colors">
                Remove Background
              </a>
              <button
                onClick={() => window.location.href = "/pricing"}
                className="text-brand-dark/80 dark:text-gray-300/80 hover:text-brand-dark dark:hover:text-white font-opensans font-medium bg-transparent border-none cursor-pointer transition-colors"
              >
                Pricing
              </button>
            </nav>
{/* Dark Mode Toggle - Desktop */}
            {onToggleDark && (
              <Button
                variant="ghost"
                size="icon"
                onClick={onToggleDark}
                className="rounded-full"
              >
                {isDark ? (
                  <Sun className="h-5 w-5 text-yellow-500" />
                ) : (
                  <Moon className="h-5 w-5 text-gray-700 dark:text-gray-300" />
                )}
              </Button>
            )}

            {/* Desktop: No counter display - silent tracking only */}

            {/* Auth Buttons */}
            <div className="hidden lg:flex items-center gap-2 lg:gap-4 flex-shrink-0">
              {isAuthenticated ? (
                <div className="flex items-center gap-2 lg:gap-3">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => window.location.href = '/dashboard'}
                  >
                    Dashboard
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => {
                      fetch('/api/logout', { method: 'GET', credentials: 'include' })
                        .finally(() => window.location.href = '/');
                    }}
                  >
                    Sign Out
                  </Button>
                </div>
              ) : (
                <Button 
                  size="sm" 
                  className="bg-brand-gold hover:bg-brand-gold-dark text-white" 
                  onClick={() => window.location.href = '/login'}
                >
                  Login
                </Button>
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
              >
                <X className="w-4 h-4 text-gray-600 dark:text-gray-400" />
              </button>
            </div>

            <div className="px-4 pb-4 space-y-3">
              {/* Navigation Links */}
              <div>
                <a
                  href="/web/overview"
                  className="block py-2 text-brand-dark dark:text-white font-medium hover:bg-gray-50 dark:hover:bg-gray-700 rounded px-2"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Web
                </a>
                <a
                  href="/api-docs#overview"
                  className="block py-2 text-brand-dark dark:text-white font-medium hover:bg-gray-50 dark:hover:bg-gray-700 rounded px-2"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  API
                </a>
                <a
                  href="/wordpress-plugin"
                  className="block py-2 text-brand-dark dark:text-white font-medium hover:bg-gray-50 dark:hover:bg-gray-700 rounded px-2"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <div className="flex items-center gap-2">
                    <SiWordpress className="w-4 h-4" />
                    <span>Plugin</span>
                  </div>
                </a>
                <a
                  href="/remove-background"
                  className="block py-2 text-brand-dark dark:text-white font-medium hover:bg-gray-50 dark:hover:bg-gray-700 rounded px-2"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Remove Background
                </a>
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    window.location.href = "/pricing";
                  }}
                  className="block w-full text-left py-2 text-brand-dark dark:text-white font-medium hover:bg-gray-50 dark:hover:bg-gray-700 rounded px-2 bg-transparent border-none cursor-pointer"
                >
                  Pricing
                </button>
              </div>

                            {/* Dark Mode Toggle in Menu */}
              {onToggleDark && (
                <button 
                  onClick={() => { 
                    onToggleDark(); 
                  }} 
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

              {/* Auth Buttons */}
              {isAuthenticated ? (
                <div className="space-y-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full justify-start" 
                    onClick={() => { 
                      setIsMobileMenuOpen(false); 
                      window.location.href = '/dashboard'; 
                    }}
                  >
                    Dashboard
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full justify-start" 
                    onClick={() => { 
                      setIsMobileMenuOpen(false); 
                      fetch('/api/logout', { method: 'GET', credentials: 'include' })
                        .finally(() => window.location.href = '/'); 
                    }}
                  >
                    Sign Out
                  </Button>
                </div>
              ) : (
                <Button 
                  size="sm" 
                  className="w-full justify-center bg-brand-gold hover:bg-brand-gold-dark text-white" 
                  onClick={() => { 
                    setIsMobileMenuOpen(false); 
                    window.location.href = '/login'; 
                  }}
                >
                  Login
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}