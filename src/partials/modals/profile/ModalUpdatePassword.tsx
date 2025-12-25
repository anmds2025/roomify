import { forwardRef, useCallback, useState } from 'react';
import { Modal, ModalBody, ModalContent, ModalHeader } from '@/components/modal';
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
  ({ open, onClose }, _ref) => {
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
    <Modal open={open} onClose={handleClose} zIndex={1500}>
      <ModalContent className="max-w-[520px]">
        <ModalHeader className="py-4 px-5">
          <div className="text-[#1A2B49] text-lg font-semibold flex items-center gap-2">
            <KeenIcon icon="lock" className="text-[#1A2B49]" />
            Thay đổi mật khẩu
          </div>
          <button className="btn btn-sm btn-icon btn-light btn-clear shrink-0" onClick={handleClose}>
            <KeenIcon icon="cross" />
          </button>
        </ModalHeader>

        <ModalBody className="py-4 px-5">
          <div className="flex flex-col gap-4">
            {passwordFields.map(({ key, label, showKey }) => (
              <div key={key} className="w-full">
                <div className="text-sm text-[#404041] mb-2">
                  {label} <span className="text-red-500">*</span>
                </div>

                <div
                  className="input w-full text-base relative"
                  style={{
                    borderColor:
                      errors[key] || (key === 'passwordNew2' && errors.passwordMatch)
                        ? 'red'
                        : '#F4F4F4',
                  }}
                >
                  <input
                    style={{ color: '#1A2B49', padding: '0.5rem 0' }}
                    type={showPasswords[showKey] ? 'text' : 'password'}
                    placeholder={`Nhập ${label.toLowerCase()}`}
                    value={passwordData[key]}
                    onChange={(e) => handleInputChange(key, e.target.value)}
                  />

                  <button
                    type="button"
                    onClick={() => togglePasswordVisibility(showKey)}
                    className="absolute right-3 top-1/2 -translate-y-1/2"
                    aria-label={showPasswords[showKey] ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                  >
                    <KeenIcon
                      icon={showPasswords[showKey] ? 'eye-slash' : 'eye'}
                      className="w-5 h-5 text-[#1A2B49]"
                    />
                  </button>
                </div>

                {(errors[key] || (key === 'passwordNew2' && errors.passwordMatch)) && (
                  <div className="mt-2 text-xs text-red-600 flex items-center gap-1">
                    <KeenIcon icon="warning" className="w-3 h-3" />
                    {key === 'passwordNew2' && errors.passwordMatch
                      ? 'Mật khẩu mới và xác nhận mật khẩu không trùng khớp'
                      : 'Trường này là bắt buộc'}
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="w-full flex flex-col sm:flex-row gap-2 justify-end pt-5">
            <button
              onClick={handleClose}
              className="py-2 px-3 border border-[#F4F4F4] rounded text-base font-bold text-[#1A2B49] w-full sm:w-auto"
            >
              Hủy bỏ
            </button>
            <button
              onClick={handleUpdate}
              className="py-2 px-3 border border-[#F4F4F4] rounded text-base font-bold bg-[#1A2B49] text-white hover:bg-[#16243c] w-full sm:w-auto"
            >
              Cập nhật
            </button>
          </div>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
  }
);

ModalUpdatePassword.displayName = 'ModalUpdatePassword';

export { ModalUpdatePassword };
