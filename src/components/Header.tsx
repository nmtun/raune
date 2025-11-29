import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Search, MapPin, User, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { useLanguage } from '@/hooks/useLanguage';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';

interface HeaderProps {
  location?: string;
  userName?: string;
  onRefreshLocation?: () => void;
  isLoadingLocation?: boolean;
  isFallbackLocation?: boolean;
}

export function Header({ 
  location = "Hai Bà Trưng, Hanoi", 
  userName = "Customer",
  onRefreshLocation,
  isLoadingLocation = false,
  isFallbackLocation = false,
}: HeaderProps) {
  const navigate = useNavigate();
  const currentLocation = useLocation();
  const [searchQuery, setSearchQuery] = useState('');
  const { t } = useLanguage();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleRecommendationsClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (currentLocation.pathname === '/search') {
      // Nếu đang ở trang search, chuyển về home rồi scroll
      navigate('/');
      // Đợi một chút để trang home render xong rồi mới scroll
      setTimeout(() => {
        document.getElementById('recommendations-dishes')?.scrollIntoView({
          behavior: 'smooth',
        });
      }, 100);
    } else {
      // Nếu đang ở trang home, chỉ cần scroll
      document.getElementById('recommendations-dishes')?.scrollIntoView({
        behavior: 'smooth',
      });
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-secondary border-b border-border shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-lg">R</span>
            </div>
            <span className="font-bold text-xl text-foreground hidden sm:inline">
              Raune Launch
            </span>
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <Link to="/" className="text-foreground hover:text-primary transition-colors">
              {t('header.home')}
            </Link>
            <Link to="/search" className="text-foreground hover:text-primary transition-colors">
              {t('header.search')}
            </Link>
            <Link to="/survey" className="text-foreground hover:text-primary transition-colors">
              {t('header.survey')}
            </Link>
            <button
              onClick={handleRecommendationsClick}
              className="text-foreground hover:text-primary transition-colors cursor-pointer"
            >
              {t('header.recommendations')}
            </button>
          </nav>

          {/* Right section */}
          <div className="flex items-center gap-3">
            {/* Location */}
            <div className="hidden lg:flex items-center space-x-2 text-sm">
              <MapPin className={`w-4 h-4 ${isFallbackLocation ? 'text-yellow-500' : 'text-accent'}`} />
              <span className="text-muted-foreground">{location}</span>
              {onRefreshLocation && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={onRefreshLocation}
                  disabled={isLoadingLocation}
                  title={t('header.refreshLocation')}
                >
                  <RefreshCw className={`w-3 h-3 ${isLoadingLocation ? 'animate-spin' : ''}`} />
                </Button>
              )}
            </div>

            {/* Search button */}
            <form onSubmit={handleSearch} className="hidden sm:flex items-center">
              <input
                type="text"
                placeholder={t('header.searchPlaceholder')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="px-3 py-1.5 text-sm border border-border rounded-l-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background transition-all duration-200"
              />
              <Button
                type="submit"
                size="sm"
                className="rounded-l-none"
              >
                <Search className="w-4 h-4" />
              </Button>
            </form>

            {/* Mobile search icon */}
            <Button
              variant="ghost"
              size="icon"
              className="sm:hidden"
              onClick={() => navigate('/search')}
            >
              <Search className="w-5 h-5" />
            </Button>

            {/* Language Switcher */}
            <div className="flex items-center">
              <LanguageSwitcher />
            </div>

            {/* User profile */}
            <div className="flex items-center space-x-2 px-3 py-1.5 bg-muted/60 rounded-lg border border-border/30 hover:bg-muted transition-colors duration-200">
              <User className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium hidden sm:inline">{userName}</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
