import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/hooks/useLanguage';
import { UserPlus, Mail, Lock, User, ArrowLeft, Eye, EyeOff } from 'lucide-react';
import accountsData from '@/data/accounts.json';

interface FormData {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
}

interface FormErrors {
  username?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
}

const Register = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t } = useLanguage();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Email validation regex - stricter
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  
  // Password regex - must contain letter, number, and special char (except " and ')
  const passwordRegex = /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};:,.<>?/\\|`~])[^"']*$/;

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Username validation
    if (!formData.username.trim()) {
      newErrors.username = t('register.usernameRequired');
    }

    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = t('register.emailRequired');
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = t('register.emailInvalid');
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = t('register.passwordRequired');
    } else if (formData.password.length < 6) {
      newErrors.password = t('register.passwordTooShort');
    } else if (!passwordRegex.test(formData.password)) {
      newErrors.password = t('register.passwordInvalid');
    }

    // Confirm password validation
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = t('register.confirmPasswordRequired');
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = t('register.passwordMismatch');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error when user starts typing
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({
        ...prev,
        [name]: undefined,
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast({
        variant: 'destructive',
        title: t('register.validationError'),
        description: Object.values(errors)[0],
      });
      return;
    }

    setIsLoading(true);

    // Simulate API call delay
    setTimeout(() => {
      // Get existing accounts from localStorage
      const localAccounts = JSON.parse(localStorage.getItem('accounts') || '[]');
      const allAccounts = [...accountsData, ...localAccounts];

      // Check if email already exists
      const emailExists = allAccounts.some(
        (account) => account.email.toLowerCase() === formData.email.toLowerCase()
      );

      if (emailExists) {
        toast({
          variant: 'destructive',
          title: t('register.validationError'),
          description: t('register.emailExists'),
        });
        setIsLoading(false);
        return;
      }

      // Calculate next ID based on all accounts (file + localStorage)
      const maxId = allAccounts.length > 0 
        ? Math.max(...allAccounts.map(acc => acc.id))
        : 0;

      // In a real app, you would save to backend here
      // For now, we'll just show success and redirect
      const newAccount = {
        id: maxId + 1,
        username: formData.username,
        email: formData.email,
        password: formData.password,
        createdAt: new Date().toISOString(),
      };

      // In production, this would be sent to backend
      console.log('New account created:', newAccount);

      // Store in localStorage for demo purposes
      localAccounts.push(newAccount);
      localStorage.setItem('accounts', JSON.stringify(localAccounts));

      toast({
        title: t('register.registerSuccess'),
        description: t('register.registerSuccessDesc'),
        duration: 5000,
      });

      // Redirect to login after 5 seconds
      setTimeout(() => {
        navigate('/login');
      }, 5000);

      setIsLoading(false);
    }, 1000);
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
            {t('auth.welcomeTitle')}<br />{t('auth.brandName')}
          </h1>
          <p className="text-lg text-primary-foreground/80 max-w-md">
            {t('auth.welcomeDesc')}
          </p>
          <div className="flex items-center space-x-8 pt-8">
            <div className="space-y-1">
              <div className="text-3xl font-bold">500+</div>
              <div className="text-sm text-primary-foreground/70">{t('auth.stats.restaurants')}</div>
            </div>
            <div className="space-y-1">
              <div className="text-3xl font-bold">10K+</div>
              <div className="text-sm text-primary-foreground/70">{t('auth.stats.customers')}</div>
            </div>
            <div className="space-y-1">
              <div className="text-3xl font-bold">4.8★</div>
              <div className="text-sm text-primary-foreground/70">{t('auth.stats.rating')}</div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="relative z-10">
          <p className="text-sm text-primary-foreground/60">
            {t('auth.copyright')}
          </p>
        </div>
      </div>

      {/* Right Side - Form */}
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
            <CardHeader className="space-y-1 text-center pb-4">
              <div className="flex items-center justify-center mb-2">
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                  <UserPlus className="w-6 h-6 text-primary" />
                </div>
              </div>
              <CardTitle className="text-2xl font-bold">{t('register.title')}</CardTitle>
              <CardDescription className="text-sm">
                {t('register.subtitle')}
              </CardDescription>
            </CardHeader>
            <CardContent className="pb-6">
            <form onSubmit={handleSubmit} className="space-y-3">
              {/* Username Field */}
              <div className="space-y-2">
                <Label htmlFor="username">{t('register.username')}</Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="username"
                    name="username"
                    type="text"
                    placeholder={t('register.usernamePlaceholder')}
                    value={formData.username}
                    onChange={handleChange}
                    className={`pl-10 ${errors.username ? 'border-destructive' : ''}`}
                    disabled={isLoading}
                  />
                </div>
                {errors.username && (
                  <p className="text-sm text-destructive">{errors.username}</p>
                )}
              </div>

              {/* Email Field */}
              <div className="space-y-2">
                <Label htmlFor="email">{t('register.email')}</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder={t('register.emailPlaceholder')}
                    value={formData.email}
                    onChange={handleChange}
                    className={`pl-10 ${errors.email ? 'border-destructive' : ''}`}
                    disabled={isLoading}
                  />
                </div>
                {errors.email && (
                  <p className="text-sm text-destructive">{errors.email}</p>
                )}
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <Label htmlFor="password">{t('register.password')}</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder={t('register.passwordPlaceholder')}
                    value={formData.password}
                    onChange={handleChange}
                    className={`pl-10 pr-10 ${errors.password ? 'border-destructive' : ''}`}
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-sm text-destructive">{errors.password}</p>
                )}
              </div>

              {/* Confirm Password Field */}
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">{t('register.confirmPassword')}</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder={t('register.confirmPasswordPlaceholder')}
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className={`pl-10 pr-10 ${errors.confirmPassword ? 'border-destructive' : ''}`}
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
                    tabIndex={-1}
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="text-sm text-destructive">{errors.confirmPassword}</p>
                )}
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full"
                disabled={isLoading}
              >
                {isLoading ? t('register.registering') : t('register.registerButton')}
              </Button>

              {/* Login Link */}
              <div className="text-center text-sm pt-4 border-t">
                <span className="text-muted-foreground">{t('register.haveAccount')} </span>
                <Link to="/login" className="text-primary hover:underline font-semibold">
                  {t('register.loginLink')}
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
        </div>
      </div>
    </div>
  );
};

export default Register;
