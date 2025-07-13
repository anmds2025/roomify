import { forwardRef, useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { KeenIcon } from '@/components';
import { toast } from 'react-toastify';
import useS3Uploader from '@/hooks/useS3Uploader';
import { useAuthContext, UserModel } from '@/auth';
import { toAbsoluteUrl } from '@/utils/Assets';
import { useUser } from '@/hooks/useUser';
import { CrudForm } from '@/components/common/CrudForm';
import { userFields } from '@/config/userFields';

interface ModalUpdateProfileProps {
  open: boolean;
  onClose: () => void;
  user: UserModel;
}

interface FormData {
  fullname: string;
  phone: string;
  email: string;
  address: string;
  cccd_code: string;
  cccd_address: string;
  cccd_day: string;
}

interface FormErrors {
  fullname: boolean;
  phone: boolean;
  email: boolean;
  address: boolean;
  cccd_code: boolean;
  cccd_address: boolean;
  cccd_day: boolean;
}

const ModalUpdateProfile = forwardRef<HTMLDivElement, ModalUpdateProfileProps>(
  ({ open, onClose, user }, ref) => {
    const { updateUser } = useUser();
    const { setCurrentUser } = useAuthContext();
    const { uploadFileToS3 } = useS3Uploader();
    
    const fileInputRef = useRef<HTMLInputElement | null>(null);

    // Form state
    const [formData, setFormData] = useState<FormData>({
      fullname: '',
      phone: '',
      email: '',
      address: '',
      cccd_code: '',
      cccd_address: '',
      cccd_day: '',
    });

    // Image state
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imageFileStr, setImageFileStr] = useState<string | null>(null);

    // Error state
    const [errors, setErrors] = useState<FormErrors>({
      fullname: false,
      phone: false,
      email: false,
      address: false,
      cccd_code: false,
      cccd_address: false,
      cccd_day: false,
    });

    // Initialize form data when user changes
    useEffect(() => {
      if (user) {
        setFormData({
          fullname: user?.fullname || '',
          phone: user?.phone || '',
          email: user?.email || '',
          address: user?.address || '',
          cccd_code: user?.cccd_code || '',
          cccd_address: user?.cccd_address || '',
          cccd_day: user?.cccd_day || '',
        });
        setImageFileStr('');
      }
    }, [user]);

    // Reset form when modal closes
    const resetForm = useCallback(() => {
      setFormData({
        fullname: user?.fullname || '',
        phone: user?.phone || '',
        email: user?.email || '',
        address: user?.address || '',
        cccd_code: user?.cccd_code || '',
        cccd_address: user?.cccd_address || '',
        cccd_day: user?.cccd_day || '',
      });
      setImageFile(null);
      setImageFileStr(null);
      setErrors({
        fullname: false,
        phone: false,
        email: false,
        address: false,
        cccd_code: false,
        cccd_address: false,
        cccd_day: false,
      });
    }, []);

    const handleClose = useCallback(() => {
      resetForm();
      onClose();
    }, [resetForm, onClose]);

    // Validation
    const validateForm = useCallback((): boolean => {
      const newErrors: FormErrors = {
        fullname: !formData.fullname.trim(),
        phone: !formData.phone.trim(),
        email: !formData.email.trim(),
        address: !formData.address.trim(),
        cccd_code: !formData.cccd_code.trim(),
        cccd_address: !formData.cccd_address.trim(),
        cccd_day: !formData.cccd_day.trim(),
      };

      setErrors(newErrors);

      const hasError = Object.values(newErrors).some(error => error);
      
      if (hasError) {
        if (newErrors.fullname) toast.error("Họ tên là bắt buộc");
        if (newErrors.phone) toast.error("Số điện thoại là bắt buộc");
        if (newErrors.email) toast.error("Email là bắt buộc");
        if (newErrors.address) toast.error("Địa chỉ là bắt buộc");
        if (newErrors.cccd_code) toast.error("Số CCCD là bắt buộc");
        if (newErrors.cccd_address) toast.error("Địa chỉ CCCD là bắt buộc");
        if (newErrors.cccd_day) toast.error("Ngày cấp CCCD là bắt buộc");
      }

      return !hasError;
    }, [formData]);

    // Handle input change
    const handleInputChange = useCallback((field: keyof FormData, value: string) => {
      setFormData(prev => ({ ...prev, [field]: value }));
      setErrors(prev => ({ ...prev, [field]: false }));
    }, []);

    // Handle file upload
    const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        setImageFileStr(URL.createObjectURL(file));
        setImageFile(file);
      }
    }, []);

    const handleBoxClick = useCallback(() => {
      fileInputRef.current?.click();
    }, []);

    // Handle form submission
    const handleUpdate = useCallback(async () => {
      if (!validateForm()) return;

      try {
        const payload = {
          pk: user._id.$oid,
          phone: formData.phone,
          email: formData.email,
          fullname: formData.fullname,
          address: formData.address,
          level: user.level,
          typeLogin: 'profile_update',
        };

        await updateUser(payload);

        // Update current user in context
        if (setCurrentUser) {
          const updatedUser = {
            ...user,
            ...formData,
          };
          setCurrentUser(updatedUser);
        }

        // toast.success("Cập nhật thông tin thành công");
        handleClose();
      } catch (error) {
        console.error('Failed to update Profile', error);
        toast.error("Lỗi cập nhật thông tin");
      }
    }, [validateForm, user, formData, updateUser, setCurrentUser, handleClose]);

    // Format date for input
    const formatDateForInput = useCallback((isoString: string) => {
      if (!isoString) return '';
      return isoString.split('T')[0];
    }, []);

    // Memoized avatar URL
    const avatarUrl = useMemo(() => {
      return imageFileStr || toAbsoluteUrl('media/avatars/blank.png');
    }, [imageFileStr]);

    return (
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-white">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold text-gray-900">
              Cập nhật thông tin
            </DialogTitle>
          </DialogHeader>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Avatar Upload */}
            <div className="flex justify-center">
              <div className="image-input size-20 cursor-pointer" onClick={handleBoxClick}>
                <div className="image-input-placeholder rounded-full border-2 border-gray-300 hover:border-primary transition-colors">
                  <img
                    src={avatarUrl}
                    alt="avatar"
                    className="h-full w-full object-cover rounded-full"
                  />
                  <input
                    type="file"
                    accept="image/*"
                    ref={fileInputRef}
                    className="hidden"
                    onChange={handleFileChange}
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-full opacity-0 hover:opacity-100 transition-opacity">
                    <KeenIcon icon="camera" className="w-6 h-6 text-white" />
                  </div>
                </div>
              </div>
            </div>

            {/* Form Fields - refactor dùng CrudForm */}
            <CrudForm
              fields={userFields}
              values={formData}
              errors={errors}
              onChange={(key, value) => handleInputChange(key as keyof FormData, value)}
            />
          </div>

          {/* Action Buttons giữ nguyên */}
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

ModalUpdateProfile.displayName = 'ModalUpdateProfile';

export { ModalUpdateProfile };
