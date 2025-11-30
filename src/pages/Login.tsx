import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useLanguage } from '@/hooks/useLanguage';
import { Construction, ArrowLeft } from 'lucide-react';

const Login = () => {
  const { t } = useLanguage();

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

      {/* Right Side - Under Construction */}
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
                <div className="w-12 h-12 bg-yellow-500/10 rounded-xl flex items-center justify-center">
                  <Construction className="w-6 h-6 text-yellow-500" />
                </div>
              </div>
              <CardTitle className="text-2xl font-bold">{t('login.title')}</CardTitle>
              <CardDescription className="text-sm">
                {t('login.underDevelopment')}
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center space-y-4 pb-6">
              <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                <p className="text-sm text-muted-foreground">
                  {t('login.developmentMessage')}
                </p>
                <div className="inline-flex items-center space-x-2 text-xs text-muted-foreground">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
                  <span>{t('login.comingSoon')}</span>
                </div>
              </div>
              
              <div className="pt-3 border-t">
                <p className="text-xs text-muted-foreground mb-3">
                  {t('login.noAccountYet')}
                </p>
                <Link 
                  to="/register" 
                  className="inline-block w-full px-6 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-semibold hover:bg-primary/90 transition-colors"
                >
                  {t('login.registerNow')}
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Login;
