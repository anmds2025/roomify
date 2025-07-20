import { forwardRef, useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { KeenIcon } from '@/components';
import { toast } from 'react-toastify';
import { useCloudinary } from '@/utils/Cloudinary';
import { useAuthContext, UserModel } from '@/auth';
import { toAbsoluteUrl } from '@/utils/Assets';
import { useUser } from '@/hooks/useUser';
import { CrudForm } from '@/components/common/CrudForm';
import { userFields } from '@/config/userFields';

interface ModalUpdateProfileProps {
  open: boolean;
  onClose: () => void;
  onDone: () => void;
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
  ({ open, onClose, user, onDone }, ref) => {
    const { updateProfileUser } = useUser();
    const { setCurrentUser } = useAuthContext();
    const { uploadImage, deleteImage, getAvatarUrl, extractPublicId } = useCloudinary();
    
    const fileInputRef = useRef<HTMLInputElement | null>(null);
    const fileQrInputRef = useRef<HTMLInputElement | null>(null);

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

    // Avatar state
    const [avatarFile, setAvatarFile] = useState<File | null>(null);
    const [avatarFileStr, setAvatarFileStr] = useState<string | null>(user?.avatar || "");

    const [imageQRFile, setImageQRFile] = useState<File | null>(null);
    const [imageQRFileStr, setImageQRFileStr] = useState<string | null>(user?.image_QR || "");

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
        setAvatarFileStr(user?.avatar || "");
        setImageQRFileStr(user?.image_QR || "");
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
      setAvatarFile(null);
      setImageQRFile(null);
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

    const handleDone = useCallback(() => {
      resetForm();
      onDone();
    }, [resetForm, onDone]);

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
        setAvatarFileStr(URL.createObjectURL(file));
        setAvatarFile(file);
      }
    }, []);

    const handleFileQRChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        setImageQRFileStr(URL.createObjectURL(file));
        setImageQRFile(file);
      }
    }, []);

    const handleBoxClick = useCallback(() => {
      fileInputRef.current?.click();
    }, []);

    const handleBoxClickQR = useCallback(() => {
      fileQrInputRef.current?.click();
    }, []);

    // Handle form submission
    const handleUpdate = useCallback(async () => {
      if (!validateForm()) return;
      let avatarUrl = user.avatar || '';
      let avatarPublicId = null;
      let imageQRUrl = user.image_QR || '';
      let imageQRPublicId = null;


      try {

        // Upload ảnh lên Cloudinary nếu có file được chọn
        if (avatarFile) {
          toast.info("Đang upload avatar...");
          try {
            const uploadResult = await uploadImage(
              avatarFile,
              'avatars', // folder trên Cloudinary
              ['user_avatar'] // tags
            );
            
            avatarUrl = uploadResult.secure_url;
            avatarPublicId = uploadResult.public_id;

            toast.success("Upload ảnh thành công!");
            
            // Xóa ảnh cũ nếu có (không phải ảnh mặc định)
            if (user.avatar && !user.avatar.includes('blank.png') && !user.avatar.includes('user-default.png')) {
              const oldPublicId = extractPublicId(user.avatar);
              if (oldPublicId) {
                await deleteImage(oldPublicId);
              }
            }
          } catch (uploadError) {
            console.error('Failed to upload avatar:', uploadError);
            if (avatarPublicId) {
              await deleteImage(avatarPublicId);
            }
            toast.error("Lỗi upload avatar, nhưng thông tin khác đã được cập nhật");
          }
        }

        if (imageQRFile) {
          toast.info("Đang upload image QR...");
          try {
            const uploadResult = await uploadImage(
              imageQRFile,
              'image_qr', // folder trên Cloudinary
              ['user_image_qr'] // tags
            );
            
            imageQRUrl = uploadResult.secure_url;
            imageQRPublicId = uploadResult.public_id;

            toast.success("Upload ảnh thành công!");
            
            // Xóa ảnh cũ nếu có (không phải ảnh mặc định)
            if (user.image_QR && !user.image_QR.includes('blank.png') && !user.image_QR.includes('user-default.png')) {
              const oldPublicId = extractPublicId(user.image_QR);
              if (oldPublicId) {
                await deleteImage(oldPublicId);
              }
            }
          } catch (uploadError) {
            console.error('Failed to upload image qr:', uploadError);
            if (imageQRPublicId) {
              await deleteImage(imageQRPublicId);
            }
            toast.error("Lỗi upload image qr, nhưng thông tin khác đã được cập nhật");
          }
        }

        const payload = {
          pk: user._id.$oid,
          phone: formData.phone,
          fullname: formData.fullname,
          address: formData.address,
          cccd_code: formData.cccd_code,
          cccd_address: formData.cccd_address,
          cccd_day: formData.cccd_day,
          avatar: avatarUrl,
          image_QR: imageQRUrl
        };

        await updateProfileUser(payload);
        handleDone();
      } catch (error) {
        console.error('Failed to update Profile', error);
      }
    }, [validateForm, user, formData, imageQRFile, avatarFile, updateProfileUser, setCurrentUser, handleClose, uploadImage, deleteImage, extractPublicId]);

    // Format date for input
    const formatDateForInput = useCallback((isoString: string) => {
      if (!isoString) return '';
      return isoString.split('T')[0];
    }, []);

    // Memoized avatar URL
    const avatarUrl = useMemo(() => {
      return avatarFileStr || toAbsoluteUrl('media/avatars/blank.png');
    }, [avatarFileStr]);

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

            <div className="flex justify-center">
              <div className="image-input size-20 cursor-pointer" onClick={handleBoxClickQR}>
                <div className="image-input-placeholder rounded-lg border-2 border-dashed border-gray-300 hover:border-primary transition-colors relative overflow-hidden">
                  {imageQRFileStr ? (
                    <img
                      src={imageQRFileStr}
                      alt="QR code"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full w-full text-gray-400">
                      Tải mã QR
                    </div>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    ref={fileQrInputRef}
                    className="hidden"
                    onChange={handleFileQRChange}
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 opacity-0 hover:opacity-100 transition-opacity">
                    <KeenIcon icon="upload" className="w-6 h-6 text-white" />
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
