import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/hooks/useLanguage';
import { ArrowLeft, Eye, EyeOff, Loader2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { getAllAccounts, initializeAccounts } from '@/utils/profileUtils';

interface Account {
  id: number;
  username: string;
  email: string;
  password: string;
  profileImage?: string;
  lat?: number;
  lng?: number;
  prefs?: string[];
  history?: number[];
  createdAt: string;
  role?: string
}

const Login = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  // Email validation
  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Clear previous errors
    setErrors({});
    
    // Validate email
    if (!email.trim()) {
      setErrors(prev => ({ ...prev, email: t('login.emailRequired') }));
      return;
    }
    
    if (!validateEmail(email)) {
      setErrors(prev => ({ ...prev, email: t('login.emailInvalid') }));
      return;
    }
    
    // Validate password - chỉ kiểm tra không rỗng, không validate format
    if (!password) {
      setErrors(prev => ({ ...prev, password: t('login.passwordRequired') }));
      return;
    }
    
    // Attempt login
    setLoading(true);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Đảm bảo đã khởi tạo accounts
    initializeAccounts();
    
    // Check credentials từ localStorage - chỉ tìm theo email
    const allAccounts = getAllAccounts();
    const account: Account | undefined = allAccounts.find(
      acc => acc.email === email.trim() && acc.password === password
    ) as Account | undefined;
    
    if (!account) {
      setLoading(false);
      toast({
        title: t('login.validationError'),
        description: t('login.loginFailed'),
        variant: 'destructive',
      });
      return;
    }
    
    // Store session data
    const loginTime = new Date().getTime();
    const sessionData = {
      userId: account.id,
      email: account.email,
      username: account.username,
      profileImage: account.profileImage,
      role: account.role, // Lưu role vào session
      loginTime,
      expiresAt: loginTime + (30 * 24 * 60 * 60 * 1000), // 30 days
    };

    localStorage.setItem('userSession', JSON.stringify(sessionData));

    // KIỂM TRA ROLE ADMIN VÀ CHUYỂN HƯỚNG
    // ---------------------------------------------------------
    if (account.role === 'admin') {
      setLoading(false);
      toast({
        title: t('login.loginSuccess'),
        description: "Welcome Administrator", 
      });
      
      // Chuyển hướng sang trang Admin
      setTimeout(() => {
        navigate('/admin'); 
      }, 1500);
      
      // Dừng hàm tại đây, KHÔNG chạy xuống phần kiểm tra survey bên dưới
      return;
    }
    
    // Check if user has completed survey (check localStorage for userFoodPreferences with userId)
    const storageKey = `userFoodPreferences_${account.id}`;
    const userFoodPreferences = localStorage.getItem(storageKey);
    let hasCompletedSurvey = false;
    
    if (userFoodPreferences) {
      try {
        const prefs = JSON.parse(userFoodPreferences);
        // Verify this belongs to current user
        hasCompletedSurvey = prefs.userId === account.id && 
                            prefs.foodPreferences && 
                            prefs.foodPreferences.length > 0;
      } catch (error) {
        hasCompletedSurvey = false;
      }
    }
    
    // Migration: Nếu không tìm thấy với key mới, thử key cũ và migrate
    if (!hasCompletedSurvey) {
      const oldKey = 'userFoodPreferences';
      const oldStored = localStorage.getItem(oldKey);
      if (oldStored) {
        try {
          const oldPrefs = JSON.parse(oldStored);
          // Nếu dữ liệu cũ không có userId hoặc thuộc về user hiện tại, migrate
          if (!oldPrefs.userId || oldPrefs.userId === account.id) {
            const migratedPrefs = {
              ...oldPrefs,
              userId: account.id
            };
            localStorage.setItem(storageKey, JSON.stringify(migratedPrefs));
            // Xóa key cũ sau khi migrate
            localStorage.removeItem(oldKey);
            hasCompletedSurvey = migratedPrefs.foodPreferences && migratedPrefs.foodPreferences.length > 0;
          }
        } catch (error) {
          // Ignore migration errors
        }
      }
    }
    
    setLoading(false);
    
    // If no survey results -> go to survey
    if (!hasCompletedSurvey) {
      // First time login - redirect to survey
      toast({
        title: t('login.loginSuccessFirstTime'),
        description: t('login.loginSuccessFirstTimeDesc'),
      });
      setTimeout(() => {
        navigate('/survey');
      }, 1500);
    } else {
      // Regular login with survey completed - redirect to home
      toast({
        title: t('login.loginSuccess'),
        description: t('login.loginSuccessDesc'),
      });
      setTimeout(() => {
        navigate('/');
      }, 1500);
    }
  };

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-primary/5 via-background to-accent/5">
      {/* Left Side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary to-primary/80 p-12 flex-col justify-between text-primary-foreground relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl"></div>
        </div>

        {/* Logo & Back Button */}
        <div className="relative z-10">
          <Link to="/" className="inline-flex items-center space-x-2 mb-8 hover:opacity-80 transition-opacity">
            <ArrowLeft className="w-5 h-5" />
            <span className="text-sm font-medium">{t('login.backToHome')}</span>
          </Link>
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
              <span className="text-2xl font-bold">R</span>
            </div>
            <span className="text-2xl font-bold">{t('auth.brandName')}</span>
          </div>
        </div>

        {/* Main Content */}
        <div className="relative z-10 space-y-6">
          <h1 className="text-4xl md:text-5xl font-bold leading-tight">
            {t('login.welcomeBack')}
          </h1>
          <p className="text-lg text-primary-foreground/80 max-w-md">
            {t('login.welcomeBackDesc')}
          </p>
        </div>

        {/* Footer */}
        <div className="relative z-10">
          <p className="text-sm text-primary-foreground/60">
            {t('auth.copyright')}
          </p>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="flex-1 flex items-center justify-center p-4 md:p-8">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden text-center mb-4">
            <Link to="/" className="inline-flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-primary-foreground font-bold">R</span>
              </div>
              <span className="font-bold text-lg text-foreground">{t('auth.brandName')}</span>
            </Link>
          </div>

          <Card className="border-2 shadow-xl">
            <CardHeader className="space-y-1">
              <CardTitle className="text-2xl font-bold text-center">{t('login.title')}</CardTitle>
              <CardDescription className="text-center">
                {t('login.subtitle')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Email Field */}
                <div className="space-y-2">
                  <Label htmlFor="email">{t('login.email')}</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder={t('login.emailPlaceholder')}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={errors.email ? 'border-destructive' : ''}
                    disabled={loading}
                  />
                  {errors.email && (
                    <p className="text-sm text-destructive">{errors.email}</p>
                  )}
                </div>

                {/* Password Field */}
                <div className="space-y-2">
                  <Label htmlFor="password">{t('login.password')}</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder={t('login.passwordPlaceholder')}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className={errors.password ? 'border-destructive pr-10' : 'pr-10'}
                      disabled={loading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      disabled={loading}
                    >
                      {showPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="text-sm text-destructive">{errors.password}</p>
                  )}
                </div>

                {/* Login Button */}
                <Button
                  type="submit"
                  className="w-full"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      {t('login.loggingIn')}
                    </>
                  ) : (
                    t('login.loginButton')
                  )}
                </Button>

                {/* Register Link */}
                <div className="text-center pt-2">
                  <p className="text-sm text-muted-foreground">
                    {t('login.noAccount')}{' '}
                    <Link
                      to="/register"
                      className="text-primary font-semibold hover:underline"
                    >
                      {t('login.registerLink')}
                    </Link>
                  </p>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Login;
