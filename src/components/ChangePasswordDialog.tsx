import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Check, Eye, EyeOff } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { verifyOldPassword, changePassword } from '@/utils/profileUtils';

interface UserProfile {
  id: number;
  username: string;
  email: string;
  password: string;
  profileImage: string;
}

interface ChangePasswordDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  currentProfile: UserProfile;
  onPasswordChanged: (updatedProfile: UserProfile) => void;
  t: (key: string) => string;
}

const ChangePasswordDialog: React.FC<ChangePasswordDialogProps> = ({
  isOpen,
  onOpenChange,
  currentProfile,
  onPasswordChanged,
  t,
}) => {
  const [oldPassword, setOldPassword] = useState<string>('');
  const [newPassword, setNewPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [showOldPassword, setShowOldPassword] = useState<boolean>(false);
  const [showNewPassword, setShowNewPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false);
  const [errors, setErrors] = useState<{
    oldPassword?: string;
    newPassword?: string;
    confirmPassword?: string;
  }>({});
  const { toast } = useToast();

  // Password regex - must contain letter, number, and special char (except " and ')
  const passwordRegex = /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};:,.<>?/\\|`~])[^"']*$/;

  const handleChangePassword = (): void => {
    const newErrors: {
      oldPassword?: string;
      newPassword?: string;
      confirmPassword?: string;
    } = {};

    // Validation mật khẩu cũ
    if (!oldPassword.trim()) {
      newErrors.oldPassword = t('profile.oldPasswordRequired') || 'Vui lòng nhập mật khẩu cũ';
    }

    // Validation mật khẩu mới
    if (!newPassword.trim()) {
      newErrors.newPassword = t('profile.newPasswordRequired') || 'Vui lòng nhập mật khẩu mới';
    } else if (newPassword.trim().length < 6) {
      newErrors.newPassword = t('profile.passwordTooShort') || 'Mật khẩu phải có ít nhất 6 ký tự';
    } else if (!passwordRegex.test(newPassword.trim())) {
      newErrors.newPassword = t('register.passwordInvalid') || t('profile.passwordInvalid') || 'Mật khẩu phải chứa chữ, số và ký tự đặc biệt (trừ " và \')';
    }

    // Validation xác nhận mật khẩu
    if (!confirmPassword.trim()) {
      newErrors.confirmPassword = t('profile.confirmPasswordRequired') || 'Vui lòng xác nhận mật khẩu';
    } else if (newPassword.trim() !== confirmPassword.trim()) {
      newErrors.confirmPassword = t('profile.passwordMismatch') || 'Mật khẩu mới và xác nhận không khớp';
    }

    // Nếu có lỗi, hiển thị và dừng lại
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      const firstError = Object.values(newErrors)[0];
      toast({
        title: t('profile.validationError') || 'Lỗi',
        description: firstError,
        variant: 'destructive',
      });
      return;
    }

    // Clear errors nếu validation thành công
    setErrors({});

    // Kiểm tra mật khẩu cũ
    if (!verifyOldPassword(oldPassword.trim(), currentProfile)) {
      toast({
        title: t('profile.validationError') || 'Lỗi',
        description: t('profile.oldPasswordIncorrect') || 'Mật khẩu cũ không chính xác',
        variant: 'destructive',
      });
      return;
    }

    // Thay đổi mật khẩu
    const updatedProfile = changePassword(currentProfile, newPassword.trim());
    onPasswordChanged(updatedProfile);

    // Reset form
    setOldPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setShowOldPassword(false);
    setShowNewPassword(false);
    setShowConfirmPassword(false);
    setErrors({});
    onOpenChange(false);

    toast({
      title: t('profile.passwordChangeSuccess') || 'Thành công',
      description: t('profile.passwordChangeSuccessDesc') || 'Mật khẩu đã được thay đổi thành công',
    });
  };

  const handleCancel = (): void => {
    setOldPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setShowOldPassword(false);
    setShowNewPassword(false);
    setShowConfirmPassword(false);
    setErrors({});
    onOpenChange(false);
  };

  // Clear error when user starts typing
  const handlePasswordChange = (field: 'oldPassword' | 'newPassword' | 'confirmPassword', value: string) => {
    if (field === 'oldPassword') {
      setOldPassword(value);
      if (errors.oldPassword) {
        setErrors(prev => ({ ...prev, oldPassword: undefined }));
      }
    } else if (field === 'newPassword') {
      setNewPassword(value);
      if (errors.newPassword) {
        setErrors(prev => ({ ...prev, newPassword: undefined }));
      }
    } else if (field === 'confirmPassword') {
      setConfirmPassword(value);
      if (errors.confirmPassword) {
        setErrors(prev => ({ ...prev, confirmPassword: undefined }));
      }
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-center">
            {t('profile.changePassword')}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          {/* Mật khẩu cũ */}
          <div className="space-y-2">
            <Label htmlFor="oldPassword" className="text-base font-semibold">
              {t('profile.oldPassword')}
            </Label>
            <div className="relative">
              <Input
                id="oldPassword"
                type={showOldPassword ? 'text' : 'password'}
                value={oldPassword}
                onChange={(e) => handlePasswordChange('oldPassword', e.target.value)}
                className={`rounded-xl h-12 text-sm pr-10 ${errors.oldPassword ? 'border-destructive' : ''}`}
                placeholder={t('profile.oldPassword')}
              />
              <button
                type="button"
                onClick={() => setShowOldPassword(!showOldPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                {showOldPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
            {errors.oldPassword && (
              <p className="text-sm text-destructive">{errors.oldPassword}</p>
            )}
          </div>

          {/* Mật khẩu mới */}
          <div className="space-y-2">
            <Label htmlFor="newPassword" className="text-base font-semibold">
              {t('profile.newPassword')}
            </Label>
            <div className="relative">
              <Input
                id="newPassword"
                type={showNewPassword ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => handlePasswordChange('newPassword', e.target.value)}
                className={`rounded-xl h-12 text-sm pr-10 ${errors.newPassword ? 'border-destructive' : ''}`}
                placeholder={t('profile.newPassword')}
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                {showNewPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
            {errors.newPassword && (
              <p className="text-sm text-destructive">{errors.newPassword}</p>
            )}
          </div>

          {/* Xác nhận mật khẩu mới */}
          <div className="space-y-2">
            <Label htmlFor="confirmPassword" className="text-base font-semibold">
              {t('profile.confirmPassword')}
            </Label>
            <div className="relative">
              <Input
                id="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => handlePasswordChange('confirmPassword', e.target.value)}
                className={`rounded-xl h-12 text-sm pr-10 ${errors.confirmPassword ? 'border-destructive' : ''}`}
                placeholder={t('profile.confirmPassword')}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                {showConfirmPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="text-sm text-destructive">{errors.confirmPassword}</p>
            )}
          </div>
        </div>
        <DialogFooter className="flex gap-2 sm:gap-0">
          <Button
            variant="outline"
            onClick={handleCancel}
            className="flex-1"
          >
            {t('profile.cancel')}
          </Button>
          <Button
            onClick={handleChangePassword}
            className="flex-1 bg-orange-500 text-white hover:bg-orange-600"
          >
            <Check className="h-4 w-4 mr-2" />
            {t('profile.confirm')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ChangePasswordDialog;

