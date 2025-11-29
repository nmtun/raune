import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useLanguage } from '@/hooks/useLanguage';
import { useUserPreferences } from '@/hooks/useUserPreferences';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import tagsData from '@/data/tags.json';
import { toast } from '@/hooks/use-toast';

const Survey = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { preferences, savePreferences, loading } = useUserPreferences();
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  // Load existing preferences when component mounts
  useEffect(() => {
    if (preferences?.foodPreferences) {
      setSelectedTags(preferences.foodPreferences);
    }
  }, [preferences]);

  // Lọc các tags liên quan đến món ăn (loại bỏ một số tags không phải món ăn)
  const foodTags = tagsData.filter(tag => 
    !['24/7', 'Delivery', 'Fast Food', 'Takeaway', 'Wifi', 'Study Space', 
      'Family', 'Group Dining', 'Romantic', 'Outdoor', 'Lake View', 
      'Premium', 'Quick', 'Famous', 'Authentic', 'Traditional', 'Unique',
      'Healthy', 'Sweet', 'Spicy'].includes(tag)
  );

  const handleTagClick = (tag: string) => {
    setSelectedTags(prev => {
      if (prev.includes(tag)) {
        return prev.filter(t => t !== tag);
      } else {
        // Chỉ cho phép chọn tối đa 5 tags
        if (prev.length >= 5) {
          toast({
            title: t('survey.maxSelectionTitle'),
            description: t('survey.maxSelectionDesc'),
            variant: "destructive",
          });
          return prev;
        }
        return [...prev, tag];
      }
    });
  };

  const handleSubmit = () => {
    if (selectedTags.length === 0) {
      toast({
        title: t('survey.pleaseSelectTags'),
        description: t('survey.selectAtLeastOneTag'),
        variant: "destructive",
      });
      return;
    }

    // Save preferences using the hook
    const success = savePreferences(selectedTags);
    
    if (success) {
      toast({
        title: t('survey.success'),
        description: t('survey.preferencesRegistered'),
      });

      // Chuyển về trang chủ sau khi lưu
      setTimeout(() => {
        navigate('/');
      }, 1500);
    } else {
      toast({
        title: 'Error',
        description: 'Failed to save preferences. Please try again.',
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header đơn giản */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div></div>
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-orange-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">R</span>
              </div>
              <h1 className="text-2xl font-bold text-orange-600">
                Raune Launch
              </h1>
            </div>
            <LanguageSwitcher />
          </div>
        </div>
      </header>

      <div className="flex flex-1 flex-col lg:flex-row">
        {/* Hình ảnh nền bên trái - chiếm toàn bộ nửa màn hình */}
        <div className="w-full lg:w-1/2 order-2 lg:order-1 relative min-h-[400px] lg:min-h-full">
          <img
            src="https://statics.vinpearl.com/mon-ngon-ha-noi-1_1679653765.png"
            alt="Delicious food"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/30"></div>
          <div className="absolute bottom-8 left-8 text-white">
            <h3 className="text-2xl font-semibold mb-2">
              {t('survey.discoverFlavors')}
            </h3>
            <p className="text-base opacity-90">
              {t('survey.personalizeExperience')}
            </p>
          </div>
        </div>

        {/* Nội dung chính bên phải */}
        <div className="w-full lg:w-1/2 order-1 lg:order-2 bg-white flex items-center justify-center p-8">
          <div className="w-full max-w-lg">
            {/* Khu vực tiêu đề */}
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-800 mb-4">
                {t('survey.title')}
              </h2>
              <p className="text-gray-600 mb-6">
                {t('survey.description')}
              </p>
            </div>

            {/* Danh sách tags */}
            <div className="mb-8">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-700">
                  {t('survey.selectFavorites')}
                </h3>
                <p className="text-sm text-gray-500 mt-1 sm:mt-0">
                  {selectedTags.length}/5 {t('survey.selected')}
                  {selectedTags.length < 5 && (
                    <span className="text-orange-600 ml-1">
                      ({t('survey.remaining', { count: 5 - selectedTags.length })})
                    </span>
                  )}
                </p>
              </div>
                <div className="flex flex-wrap gap-2 md:gap-3">
                  {foodTags.map((tag) => {
                    const isSelected = selectedTags.includes(tag);
                    const isDisabled = !isSelected && selectedTags.length >= 5;
                    
                    return (
                      <Badge
                        key={tag}
                        variant={isSelected ? "default" : "outline"}
                        className={`
                          px-3 py-2 text-xs md:text-sm font-medium transition-all duration-200 transform
                          ${isSelected 
                            ? 'bg-orange-500 hover:bg-orange-600 text-white shadow-lg scale-105 border-2 border-orange-600 cursor-pointer' 
                            : isDisabled
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed opacity-60'
                            : 'hover:bg-orange-50 hover:border-orange-300 hover:text-orange-600 hover:scale-105 cursor-pointer'
                          }
                        `}
                        onClick={() => !isDisabled && handleTagClick(tag)}
                      >
                        {isSelected && (
                          <span className="mr-1">✓</span>
                        )}
                        {t(`tags.${tag}`, tag)}
                      </Badge>
                    );
                  })}
              </div>
              
              {selectedTags.length > 0 && (
                <div className="mt-4 p-3 bg-orange-50 rounded-lg border border-orange-200">
                  <p className="text-sm text-orange-700 font-medium mb-2">
                    {t('survey.selectedCount', { count: selectedTags.length })}
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {selectedTags.map((tag) => (
                      <span 
                        key={`selected-${tag}`}
                        className="text-xs bg-orange-200 text-orange-800 px-2 py-1 rounded-full"
                      >
                        {t(`tags.${tag}`, tag)}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Nút đăng ký */}
            <div className="text-center">
              <Button
                onClick={handleSubmit}
                size="lg"
                className={`
                  px-12 py-3 text-lg font-semibold transition-all duration-300 w-full
                  ${selectedTags.length > 0 
                    ? 'bg-orange-500 hover:bg-orange-600 shadow-lg hover:shadow-xl' 
                    : 'bg-gray-300 cursor-not-allowed'
                  }
                `}
                disabled={selectedTags.length === 0}
              >
                {t('survey.register')}
              </Button>
              
              <p className="text-xs text-gray-500 mt-3">
                {t('survey.canChangelater')}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Survey;