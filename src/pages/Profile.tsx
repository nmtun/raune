import React, { useState, useMemo } from 'react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Check, Lock } from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';
import { useGeolocation } from '@/hooks/useGeolocation';
import { useToast } from '@/hooks/use-toast';
import ProfileAvatarSection from '@/components/ProfileAvatarSection';
import ChangePasswordDialog from '@/components/ChangePasswordDialog';
import {
  getCurrentProfile,
  saveProfileToStorage,
  validateProfile,
  availableImages,
} from '@/utils/profileUtils';

interface UserProfile {
  id: number;
  username: string;
  name: string;
  email: string;
  password: string;
  profileImage: string;
}

const Profile: React.FC = () => {
  const { t } = useLanguage();
  const location = useGeolocation();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Lấy profile hiện tại từ localStorage hoặc dùng profile đầu tiên
  const [currentProfile, setCurrentProfile] = useState<UserProfile>(() => {
    return getCurrentProfile();
  });

  const [username, setUsername] = useState<string>(currentProfile.username || '');
  const [name, setName] = useState<string>(currentProfile.name || '');
  const [email, setEmail] = useState<string>(currentProfile.email || '');
  const [profileImage, setProfileImage] = useState<string>(
    currentProfile.profileImage || '/profile-image/avt1.jpg'
  );

  // State cho dialog đổi mật khẩu
  const [isChangePasswordDialogOpen, setIsChangePasswordDialogOpen] = useState<boolean>(false);

  // Kiểm tra xem có thay đổi nào trong form không
  const hasChanges = useMemo(() => {
    return (
      username.trim() !== (currentProfile.username || '').trim() ||
      name.trim() !== (currentProfile.name || '').trim() ||
      email.trim() !== (currentProfile.email || '').trim() ||
      profileImage !== currentProfile.profileImage
    );
  }, [username, name, email, profileImage, currentProfile]);

  const handleRefreshLocation = (): void => {
    location.refreshLocation();
  };

  const handleImageChange = (imagePath: string): void => {
    setProfileImage(imagePath);
  };

  const handleUpdate = (): void => {
    // Validation
    const validation = validateProfile(username, name, email);
    if (!validation.isValid) {
      toast({
        title: t('profile.validationError') || 'Lỗi',
        description: t(`profile.${validation.error}`) || 'Vui lòng kiểm tra lại thông tin',
      });
      return;
    }

    // Cập nhật profile hiện tại
    const updatedProfile: UserProfile = {
      ...currentProfile,
      username: username.trim(),
      name: name.trim(),
      email: email.trim(),
      profileImage,
    };

    setCurrentProfile(updatedProfile);

    // Lưu vào storage
    saveProfileToStorage(updatedProfile);

    toast({
      title: t('profile.updateSuccess'),
      description: t('profile.updateSuccessDesc') || 'Thông tin đã được lưu thành công',
    });
  };

  const handlePasswordChanged = (updatedProfile: UserProfile): void => {
    setCurrentProfile(updatedProfile);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-orange-50 via-white to-orange-50">
      <Header
        location={location.isFallback ? t('location.defaultLocation') : t('location.yourLocation')}
        onRefreshLocation={handleRefreshLocation}
        isLoadingLocation={location.loading}
        isFallbackLocation={location.isFallback}
      />

      <div className="flex-1 container mx-auto px-4 py-7 max-w-3xl">
        {/* Khối nội dung chính - màu cam với gradient đẹp hơn */}
        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-3xl p-7 md:p-11 shadow-2xl transform transition-all duration-300 hover:shadow-3xl relative">
          {/* Nút back ở góc trên bên trái */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
            className="absolute top-3.5 left-3.5 text-white hover:bg-white/20 rounded-full transition-all duration-200"
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>

          {/* Tiêu đề trong khối */}
          <h2 className="text-3xl font-bold text-white text-center mb-9 tracking-tight">
            {t('profile.title')}
          </h2>

          {/* Component Avatar */}
          <ProfileAvatarSection
            profileImage={profileImage}
            name={name}
            onImageChange={handleImageChange}
            availableImages={availableImages}
            t={t}
          />

          {/* Form nhập liệu */}
          <div className="space-y-5 mb-9">
            {/* Trường Username */}
            <div className="space-y-2.5">
              <Label htmlFor="username" className="text-white text-base font-semibold">
                {t('profile.username')}
              </Label>
              <Input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="bg-white text-gray-900 rounded-xl h-12 text-sm border-0 shadow-md focus:shadow-lg transition-all duration-200 px-4"
                placeholder={t('profile.username')}
              />
            </div>

            {/* Trường Tên */}
            <div className="space-y-2.5">
              <Label htmlFor="name" className="text-white text-base font-semibold">
                {t('profile.name')}
              </Label>
              <Input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="bg-white text-gray-900 rounded-xl h-12 text-sm border-0 shadow-md focus:shadow-lg transition-all duration-200 px-4"
                placeholder={t('profile.name')}
              />
            </div>

            {/* Trường Email */}
            <div className="space-y-2.5">
              <Label htmlFor="email" className="text-white text-base font-semibold">
                {t('profile.email')}
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-white text-gray-900 rounded-xl h-12 text-sm border-0 shadow-md focus:shadow-lg transition-all duration-200 px-4"
                placeholder={t('profile.email')}
              />
            </div>
          </div>

          {/* Nút Cập nhật */}
          <div className="flex flex-col items-center gap-4 mb-4">
            <Button
              onClick={handleUpdate}
              disabled={!hasChanges}
              className={`rounded-xl px-9 py-6 text-base font-bold w-full max-w-md shadow-lg transition-all duration-200 border-2 border-white/20 ${
                hasChanges
                  ? 'bg-white text-orange-500 hover:bg-orange-50 hover:scale-105 cursor-pointer'
                  : 'bg-white/50 text-white cursor-not-allowed opacity-100'
              }`}
            >
              <Check className="h-4 w-4 mr-2" />
              {t('profile.update')}
            </Button>

            {/* Nút Thay đổi mật khẩu */}
            <Button
              onClick={() => setIsChangePasswordDialogOpen(true)}
              variant="outline"
              className="bg-white/10 text-white border-white/30 hover:bg-white/20 rounded-xl px-9 py-6 text-base font-bold w-full max-w-md shadow-lg transition-all duration-200"
            >
              <Lock className="h-4 w-4 mr-2" />
              {t('profile.changePassword')}
            </Button>
          </div>
        </div>
      </div>

      {/* Component đổi mật khẩu */}
      <ChangePasswordDialog
        isOpen={isChangePasswordDialogOpen}
        onOpenChange={setIsChangePasswordDialogOpen}
        currentProfile={currentProfile}
        onPasswordChanged={handlePasswordChanged}
        t={t}
      />

      <Footer />
    </div>
  );
};

export default Profile;
