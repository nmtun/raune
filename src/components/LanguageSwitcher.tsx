import { Languages, ChevronDown, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useLanguage } from '@/hooks/useLanguage';

export function LanguageSwitcher() {
  const { currentLanguage, changeLanguage, t } = useLanguage();

  const languages = [
    { code: 'vi', name: 'Tiếng Việt', shortName: 'VN', flag: '🇻🇳' },
    { code: 'ja', name: '日本語', shortName: 'JP', flag: '🇯🇵' },
  ];

  const currentLang = languages.find(lang => lang.code === currentLanguage) || languages[0];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="outline" 
          size="sm" 
          className="language-switcher-trigger h-9 px-3 bg-background/80 backdrop-blur-sm border border-border/50 hover:border-primary/30 hover:bg-gradient-to-r hover:from-primary/5 hover:to-accent/5 transition-all duration-300 shadow-sm hover:shadow-md group"
        >
          <div className="flex items-center gap-2">
            <span className={`text-base leading-none flag-emoji ${currentLanguage ? 'selected-language' : ''}`}>
              {currentLang.flag}
            </span>
            <span className="text-sm font-medium text-foreground/80 hidden sm:inline group-hover:text-foreground transition-colors duration-200">
              {currentLang.shortName}
            </span>
            <ChevronDown className="w-3 h-3 text-muted-foreground transition-all duration-300 group-hover:text-primary group-data-[state=open]:rotate-180 group-data-[state=open]:text-primary" />
          </div>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        align="end" 
        className="language-dropdown w-48 p-2 bg-background/95 backdrop-blur-md border border-border/50 shadow-xl rounded-xl"
        sideOffset={8}
      >
        <div className="text-xs font-semibold text-muted-foreground px-2 py-1 mb-1">
          {t('languageSwitcher.chooseLanguage')}
        </div>
        {languages.map((language) => {
          const isSelected = currentLanguage === language.code;
          return (
            <DropdownMenuItem
              key={language.code}
              onClick={() => changeLanguage(language.code)}
              className={`
                flex items-center justify-between cursor-pointer rounded-lg px-3 py-3 transition-all duration-200 group
                ${isSelected 
                  ? 'bg-gradient-to-r from-primary/10 to-accent/5 text-primary border-l-3 border-l-primary shadow-sm' 
                  : 'hover:bg-gradient-to-r hover:from-accent/10 hover:to-primary/5 text-foreground hover:shadow-sm'
                }
              `}
            >
              <div className="flex items-center gap-3">
                <span className={`text-lg leading-none flag-emoji transition-transform duration-200 ${isSelected ? 'scale-110' : 'group-hover:scale-105'}`}>
                  {language.flag}
                </span>
                <div className="flex flex-col">
                  <span className={`text-sm font-medium leading-none transition-colors duration-200 ${isSelected ? 'text-primary' : 'group-hover:text-foreground'}`}>
                    {language.name}
                  </span>
                  <span className="text-xs text-muted-foreground mt-0.5 group-hover:text-muted-foreground/80">
                    {language.shortName}
                  </span>
                </div>
              </div>
              {isSelected && (
                <div className="flex items-center gap-1">
                  <Check className="w-4 h-4 text-primary animate-in fade-in-0 zoom-in-95 duration-200" />
                  <div className="w-1 h-1 bg-primary rounded-full animate-pulse"></div>
                </div>
              )}
            </DropdownMenuItem>
          );
        })}
        <div className="h-px bg-border/30 my-2 mx-2"></div>
        <div className="text-xs text-muted-foreground/60 px-2 py-1 text-center">
          {t('languageSwitcher.autoSave')}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}