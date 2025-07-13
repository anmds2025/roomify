import { forwardRef, useEffect, useRef, useState, useCallback } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { KeenIcon } from '@/components';
import { toast } from 'react-toastify';
import { useUser } from '@/hooks/useUser';
import { useAuthContext } from '@/auth';

interface ModalUpdatePasswordProps {
  open: boolean;
  onClose: () => void;
}

interface PasswordData {
  passwordOld: string;
  passwordNew1: string;
  passwordNew2: string;
}

interface PasswordErrors {
  passwordOld: boolean;
  passwordNew1: boolean;
  passwordNew2: boolean;
  passwordMatch: boolean;
}

const ModalUpdatePassword = forwardRef<HTMLDivElement, ModalUpdatePasswordProps>(
  ({ open, onClose }, ref) => {
    const { changePassword } = useUser();
    const { currentUser } = useAuthContext();

    // Password state
    const [passwordData, setPasswordData] = useState<PasswordData>({
      passwordOld: '',
      passwordNew1: '',
      passwordNew2: '',
    });

    // Show/hide password state
    const [showPasswords, setShowPasswords] = useState({
      passwordOld: false,
      passwordNew1: false,
      passwordNew2: false,
    });

    // Error state
    const [errors, setErrors] = useState<PasswordErrors>({
      passwordOld: false,
      passwordNew1: false,
      passwordNew2: false,
      passwordMatch: false,
    });

    // Reset form when modal closes
    const resetForm = useCallback(() => {
      setPasswordData({
        passwordOld: '',
        passwordNew1: '',
        passwordNew2: '',
      });
      setShowPasswords({
        passwordOld: false,
        passwordNew1: false,
        passwordNew2: false,
      });
      setErrors({
        passwordOld: false,
        passwordNew1: false,
        passwordNew2: false,
        passwordMatch: false,
      });
    }, []);

    const handleClose = useCallback(() => {
      resetForm();
      onClose();
    }, [resetForm, onClose]);

    // Toggle password visibility
    const togglePasswordVisibility = useCallback((field: keyof typeof showPasswords) => {
      setShowPasswords(prev => ({ ...prev, [field]: !prev[field] }));
    }, []);

    // Handle input change
    const handleInputChange = useCallback((field: keyof PasswordData, value: string) => {
      setPasswordData(prev => ({ ...prev, [field]: value }));
      setErrors(prev => ({ ...prev, [field]: false, passwordMatch: false }));
    }, []);

    // Validation
    const validateForm = useCallback((): boolean => {
      const newErrors: PasswordErrors = {
        passwordOld: !passwordData.passwordOld.trim(),
        passwordNew1: !passwordData.passwordNew1.trim(),
        passwordNew2: !passwordData.passwordNew2.trim(),
        passwordMatch: passwordData.passwordNew1 !== passwordData.passwordNew2,
      };

      setErrors(newErrors);

      const hasError = Object.values(newErrors).some(error => error);
      
      if (hasError) {
        if (newErrors.passwordOld) toast.error("Mật khẩu cũ là bắt buộc");
        if (newErrors.passwordNew1) toast.error("Mật khẩu mới là bắt buộc");
        if (newErrors.passwordNew2) toast.error("Xác nhận mật khẩu là bắt buộc");
        if (newErrors.passwordMatch) toast.error("Mật khẩu không trùng khớp");
      }

      return !hasError;
    }, [passwordData]);

    // Handle form submission
    const handleUpdate = useCallback(async () => {
      if (!validateForm()) return;

      try {
        const success = await changePassword({
          id: currentUser?._id.$oid || "",
          old_password: passwordData.passwordOld,
          new_password: passwordData.passwordNew1
        });
        
        if (success) {
          toast.success("Đổi mật khẩu thành công");
          handleClose();
        }
      } catch (error) {
        console.error('Failed to update password', error);
        toast.error("Lỗi đổi mật khẩu");
      }
    }, [validateForm, changePassword, currentUser, passwordData, handleClose]);

    // Password fields configuration
    const passwordFields = [
      { 
        key: 'passwordOld' as keyof PasswordData, 
        label: 'Mật khẩu hiện tại', 
        showKey: 'passwordOld' as keyof typeof showPasswords 
      },
      { 
        key: 'passwordNew1' as keyof PasswordData, 
        label: 'Mật khẩu mới', 
        showKey: 'passwordNew1' as keyof typeof showPasswords 
      },
      { 
        key: 'passwordNew2' as keyof PasswordData, 
        label: 'Nhập lại mật khẩu mới', 
        showKey: 'passwordNew2' as keyof typeof showPasswords 
      },
    ];

    return (
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="max-w-md bg-white">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold text-gray-900">
              Thay đổi mật khẩu
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {passwordFields.map(({ key, label, showKey }) => (
              <div key={key} className="space-y-2">
                <Label htmlFor={key} className="text-sm font-medium text-gray-700">
                  {label}
                  <span className="text-red-500 ml-1">*</span>
                </Label>
                <div className="relative">
                  <Input
                    id={key}
                    type={showPasswords[showKey] ? 'text' : 'password'}
                    value={passwordData[key]}
                    onChange={(e) => handleInputChange(key, e.target.value)}
                    placeholder={`Nhập ${label.toLowerCase()}`}
                    className={`pr-10 ${errors[key] || (key === 'passwordNew2' && errors.passwordMatch) ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
                  />
                  <button
                    type="button"
                    onClick={() => togglePasswordVisibility(showKey)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
                  >
                    <KeenIcon
                      icon={showPasswords[showKey] ? "eye-slash" : "eye"}
                      className="w-4 h-4"
                    />
                  </button>
                </div>
                {(errors[key] || (key === 'passwordNew2' && errors.passwordMatch)) && (
                  <p className="text-xs text-red-500 flex items-center gap-1">
                    <KeenIcon icon="warning" className="w-3 h-3" />
                    {key === 'passwordNew2' && errors.passwordMatch 
                      ? 'Mật khẩu không trùng khớp' 
                      : 'Trường này là bắt buộc'
                    }
                  </p>
                )}
              </div>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
            <button
              onClick={handleClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors"
            >
              Hủy bỏ
            </button>
            <button
              onClick={handleUpdate}
              className="px-4 py-2 text-sm font-medium text-white bg-primary border border-transparent rounded-md hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors"
            >
              Cập nhật
            </button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }
);

ModalUpdatePassword.displayName = 'ModalUpdatePassword';

export { ModalUpdatePassword };
