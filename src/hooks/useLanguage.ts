import { useTranslation } from 'react-i18next';

export type LocalizedContent = string | { vi: string; ja: string } | null | undefined;

export const useLanguage = () => {
  const { i18n, t } = useTranslation();

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
  };

  // Chuẩn hóa ngôn ngữ (đề phòng trường hợp 'vi-VN', 'ja-JP')
  const currentLanguage = i18n.language || 'vi';
  const isJapanese = currentLanguage.startsWith('ja');
  const isVietnamese = !isJapanese; // Mặc định còn lại là Việt

  const getLocalizedContent = (content: LocalizedContent): string => {
    // Nếu dữ liệu rỗng
    if (!content) return '';

    // Nếu dữ liệu là chuỗi bình thường (không phải object) -> trả về luôn
    if (typeof content === 'string') {
      return content;
    }

    // Nếu là object {vi, ja}, trả về ngôn ngữ tương ứng
    if (isJapanese) {
      return content.ja || content.vi || ''; // Ưu tiên Nhật, fallback về Việt
    }
    
    return content.vi || ''; // Mặc định là Việt
  };


  return {
    t,
    language: currentLanguage,
    currentLanguage,
    changeLanguage,
    isVietnamese: currentLanguage === 'vi',
    isJapanese: currentLanguage === 'ja',
    getLocalizedContent
  };
};