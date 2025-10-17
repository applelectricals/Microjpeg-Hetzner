import { SiWordpress } from "react-icons/si";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { Menu, X, Activity } from "lucide-react";
import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import logoUrl from '@assets/mascot-logo-optimized.png';

export default function Header() {
  const { user, isAuthenticated } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [usageStats, setUsageStats] = useState<any>(null);
  const [location] = useLocation();

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

  const MonthlyCounter = () => {
    if (!usageStats?.stats) return null;
    const stats = usageStats.stats;
    const monthlyUsed = (stats.regular?.monthly?.used || 0) + (stats.raw?.monthly?.used || 0);
    const monthlyLimit = (stats.regular?.monthly?.limit || 500) + (stats.raw?.monthly?.limit || 20);

    return (
      <div className="flex items-center gap-2 text-xs" data-testid="header-monthly-counter">
        <Activity className="w-4 h-4 text-blue-600" />
        <span className="font-medium text-brand-dark">
          {monthlyUsed}/{monthlyLimit}
        </span>
        <span className="text-gray-500">operations this month</span>
      </div>
    );
  };

  return (
    <>
      <header className="lg:hidden sticky top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur border-b border-gray-200/50 h-16">
        <div className="flex items-center justify-between h-16 px-4">
          <div className="flex items-center gap-2">
            <img src={logoUrl} alt="MicroJPEG Logo" className="w-8 h-8 object-contain" />
            <div className="flex flex-col">
              <span className="text-lg font-bold font-poppins text-brand-dark">MicroJPEG</span>
              <span className="text-xs font-opensans text-brand-dark opacity-70 tracking-wider">PICTURE PERFECT</span>
            </div>
          </div>
          
          {usageStats?.stats && (
            <div className="flex items-center gap-1 text-xs">
              <Activity className="w-3 h-3 text-blue-600" />
              <span className="font-medium text-brand-dark">
                {((usageStats.stats.regular?.monthly?.used || 0) + (usageStats.stats.raw?.monthly?.used || 0))}/
                {((usageStats.stats.regular?.monthly?.limit || 500) + (usageStats.stats.raw?.monthly?.limit || 20))}
              </span>
            </div>
          )}
          
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 border border-gray-300 rounded bg-transparent"
          >
            <Menu className="w-5 h-5 text-brand-dark" />
          </button>
        </div>
      </header>

      <header className="hidden lg:block sticky top-0 z-50 bg-white/80 backdrop-blur border-b border-brand-gold/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
              <img src={logoUrl} alt="MicroJPEG Logo" className="w-8 h-8 sm:w-[45px] sm:h-[45px]" />
              <div className="flex flex-col">
                <span className="text-lg sm:text-2xl font-bold font-poppins text-brand-dark">MicroJPEG</span>
                <span className="text-xs font-opensans text-brand-dark/70 tracking-widest">PICTURE PERFECT</span>
              </div>
            </div>
            
            <nav className="hidden lg:flex items-center gap-6 xl:gap-8">
              <a href="/web/overview" className="text-brand-dark/80 hover:text-brand-dark font-opensans font-medium transition-colors">Web</a>
              <a href="/api-docs#overview" className="text-brand-dark/80 hover:text-brand-dark font-opensans font-medium transition-colors">API</a>
              <a href="/wordpress-plugin" className="text-brand-dark/80 hover:text-brand-dark font-opensans font-medium transition-colors flex items-center gap-1">
                <SiWordpress className="w-4 h-4" />
                Plugin
              </a>
              <button onClick={() => window.location.href = "/simple-pricing"} className="text-brand-dark/80 hover:text-brand-dark font-opensans font-medium bg-transparent border-none cursor-pointer transition-colors">
                Pricing
              </button>
            </nav>

            <MonthlyCounter />

            <div className="hidden lg:flex items-center gap-2 lg:gap-4 flex-shrink-0">
              {isAuthenticated ? (
                <div className="flex items-center gap-2 lg:gap-3">
                  <Button variant="outline" size="sm" onClick={() => window.location.href = '/dashboard'}>Dashboard</Button>
                  <Button variant="outline" size="sm" onClick={() => {
                    fetch('/api/logout', { method: 'GET', credentials: 'include' })
                      .finally(() => window.location.href = '/');
                  }}>Sign Out</Button>
                </div>
              ) : (
                <div className="flex items-center gap-2 lg:gap-3">
                  <Button variant="ghost" size="sm" onClick={() => window.location.href = '/login'}>Sign In</Button>
                  <Button variant="ghost" size="sm" onClick={() => window.location.href = '/signup'}>Sign Up</Button>
                  <Button size="sm" className="bg-brand-gold hover:bg-brand-gold-dark text-white" onClick={() => window.location.href = '/'}>Back to App</Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {isMobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-40" onClick={() => setIsMobileMenuOpen(false)} style={{ backgroundColor: 'rgba(0,0,0,0.3)' }}>
          <div className="absolute top-16 right-4 w-60 bg-white rounded-lg shadow-2xl border" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-end p-2">
              <button onClick={() => setIsMobileMenuOpen(false)} className="p-1 rounded-full hover:bg-gray-100">
                <X className="w-4 h-4 text-gray-600" />
              </button>
            </div>

            <div className="px-4 pb-4 space-y-3">
              <div>
                <a href="/web/overview" className="block py-2 text-brand-dark font-medium hover:bg-gray-50 rounded px-2" onClick={() => setIsMobileMenuOpen(false)}>Web</a>
                <a href="/api-docs#overview" className="block py-2 text-brand-dark font-medium hover:bg-gray-50 rounded px-2" onClick={() => setIsMobileMenuOpen(false)}>API</a>
                <a href="/wordpress-plugin" className="block py-2 text-brand-dark font-medium hover:bg-gray-50 rounded px-2" onClick={() => setIsMobileMenuOpen(false)}>
                  <div className="flex items-center gap-2">
                    <SiWordpress className="w-4 h-4" />
                    <span>Plugin</span>
                  </div>
                </a>
                <button onClick={() => { setIsMobileMenuOpen(false); window.location.href = "/simple-pricing"; }} className="block w-full text-left py-2 text-brand-dark font-medium hover:bg-gray-50 rounded px-2 bg-transparent border-none cursor-pointer">Pricing</button>
              </div>

              <hr className="border-gray-200" />

              {isAuthenticated ? (
                <div className="space-y-2">
                  <Button variant="outline" size="sm" className="w-full justify-start" onClick={() => { setIsMobileMenuOpen(false); window.location.href = '/dashboard'; }}>Dashboard</Button>
                  <Button variant="outline" size="sm" className="w-full justify-start" onClick={() => { setIsMobileMenuOpen(false); fetch('/api/logout', { method: 'GET', credentials: 'include' }).finally(() => window.location.href = '/'); }}>Sign Out</Button>
                </div>
              ) : (
                <div className="space-y-2">
                  <Button variant="ghost" size="sm" className="w-full justify-start" onClick={() => { setIsMobileMenuOpen(false); window.location.href = '/login'; }}>Sign In</Button>
                  <Button variant="ghost" size="sm" className="w-full justify-start" onClick={() => { setIsMobileMenuOpen(false); window.location.href = '/signup'; }}>Sign Up</Button>
                  <Button size="sm" className="w-full justify-center bg-brand-gold hover:bg-brand-gold-dark text-white" onClick={() => { setIsMobileMenuOpen(false); window.location.href = '/'; }}>Back to App</Button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}