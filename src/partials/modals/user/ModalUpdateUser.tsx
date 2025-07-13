import React, { forwardRef, useCallback, useEffect, useMemo, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { KeenIcon } from '@/components';
import { toast } from 'react-toastify';
import { ModalUpdateUserProps } from '@/pages/dashboards/light-sidebar/blocks/users/UsersData';
import { useUser } from '@/hooks/useUser';

// Component cho form field với style hiện đại
const FormField = React.memo(({ 
  label, 
  value, 
  onChange, 
  type = "text", 
  error = false, 
  options = null,
  disabled = false 
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  error?: boolean;
  options?: { value: string; label: string }[] | null;
  disabled?: boolean;
}) => (
  <div className="space-y-2">
    <label className="text-base font-semibold text-gray-700 flex items-center gap-1">
      {label}
      <span className="text-red-500">*</span>
    </label>
    <div className="relative">
      {type === "select" ? (
        <select
          className={`
            w-full px-4 py-3 border rounded-xl transition-all duration-200
            font-medium text-base text-gray-900
            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
            disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed
            placeholder-gray-500
            ${error 
              ? 'border-red-500 bg-red-50 focus:ring-red-500 shadow-sm' 
              : 'border-gray-300 bg-white hover:border-gray-400 focus:shadow-md'
            }
          `}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
        >
          <option value="">Chọn cấp độ tài khoản</option>
          {options?.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      ) : (
        <input
          className={`
            w-full px-4 py-3 border rounded-xl transition-all duration-200
            font-medium text-base text-gray-900
            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
            disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed
            placeholder-gray-500
            ${error 
              ? 'border-red-500 bg-red-50 focus:ring-red-500 shadow-sm' 
              : 'border-gray-300 bg-white hover:border-gray-400 focus:shadow-md'
            }
          `}
          type={type}
          value={value}
          placeholder={`Nhập ${label.toLowerCase()}`}
          onChange={(e) => {
            if (type === "tel") {
              const value = e.target.value.replace(/[^0-9]/g, '');
              onChange(value);
            } else {
              onChange(e.target.value);
            }
          }}
          disabled={disabled}
        />
      )}
      {error && (
        <div className="flex items-center gap-1 mt-2 text-sm font-medium text-red-600">
          <KeenIcon icon="warning" className="w-4 h-4" />
          <span>{label} là bắt buộc</span>
        </div>
      )}
    </div>
  </div>
));

// Component cho action buttons với style hiện đại
const ActionButtons = React.memo(({ 
  onCancel, 
  onSubmit, 
  isEdit, 
  isLoading = false 
}: {
  onCancel: () => void;
  onSubmit: () => void;
  isEdit: boolean;
  isLoading?: boolean;
}) => (
  <div className="flex gap-3 justify-end">
    <button 
      onClick={onCancel} 
      className="px-4 py-2 min-w-[100px] h-10 text-base font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
      disabled={isLoading}
    >
      Hủy bỏ
    </button>
    <button 
      onClick={onSubmit} 
      className="px-4 py-2 min-w-[100px] h-10 text-base font-semibold text-white bg-gradient-to-r from-blue-600 to-blue-700 border border-transparent rounded-lg hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg flex items-center gap-2"
      disabled={isLoading}
    >
      {isLoading ? (
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          Đang xử lý...
        </div>
      ) : (
        <>
          <KeenIcon icon={isEdit ? "pencil" : "add-notepad"} className="w-4 h-4" />
          {isEdit ? "Cập nhật" : "Tạo mới"}
        </>
      )}
    </button>
  </div>
));

const ModalUpdateUser = forwardRef<HTMLDivElement, ModalUpdateUserProps>(
  ({ open, onClose, user, fetchUsers }, ref) => {
  const { createUser, updateUser } = useUser();
  const [isLoading, setIsLoading] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    fullname: '',
    email: '',
    phone: '',
    address: '',
    level: ''
  });
  
  // Error state
  const [errors, setErrors] = useState({
    fullname: false,
    email: false,
    address: false,
    phone: false,
    level: false,
    emailInvalid: false
  });

  // Level options
  const levelOptions = useMemo(() => [
    { value: 'Basic', label: 'Basic' },
    { value: 'Pro', label: 'Pro' },
    { value: 'Premium', label: 'Premium' },
    { value: 'Enterprise', label: 'Enterprise' }
  ], []);

  // Validation functions
  const validateEmail = useCallback((email: string) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  }, []);

  const validateFields = useCallback(() => {
    const isEmailInvalid = !validateEmail(formData.email.trim());
    const newErrors = {
      fullname: !formData.fullname.trim(),
      email: !formData.email.trim(),
      phone: !formData.phone.trim(),
      level: !formData.level.trim(),
      address: !formData.address.trim(),
      emailInvalid: isEmailInvalid
    };

    setErrors(newErrors);

    const hasError = Object.values(newErrors).some((error) => error);
    if (hasError) {
      if (newErrors.fullname) toast.error("Họ tên là bắt buộc");
      if (newErrors.email) toast.error("Email là bắt buộc");
      if (newErrors.phone) toast.error("Số điện thoại là bắt buộc");
      if (newErrors.level) toast.error("Cấp độ là bắt buộc");
      if (newErrors.address) toast.error("Địa chỉ là bắt buộc");
      if (newErrors.emailInvalid) toast.error("Email không đúng định dạng");
    }
    return !hasError;
  }, [formData, validateEmail]);

  // Initialize form data when user changes
  useEffect(() => {
    setFormData({
      fullname: user?.fullname || "",
      email: user?.email || "",
      phone: user?.phone || "",
      level: user?.level || "",
      address: user?.address || ""
    });
  }, [user]);

  // Reset form and errors
  const resetForm = useCallback(() => {
    setFormData({
      fullname: '',
      email: '',
      phone: '',
      address: '',
      level: ''
    });
    setErrors({
      fullname: false,
      email: false,
      address: false,
      phone: false,
      level: false,
      emailInvalid: false
    });
  }, []);

  const handleClose = useCallback(() => {
    resetForm();
    onClose();
  }, [resetForm, onClose]);

  // Handle form field changes
  const handleFieldChange = useCallback((field: keyof typeof formData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setErrors(prev => ({ ...prev, [field]: false }));
  }, []);

  // Submit handler - gộp create và update
  const handleSubmit = useCallback(async () => {
    if (validateFields()) {
      setIsLoading(true);
      try {
        const payload = { 
          pk: user?._id?.$oid || '',
          email: formData.email, 
          fullname: formData.fullname, 
          phone: formData.phone,
          level: formData.level,
          address: formData.address,
          typeLogin: 'admin_add',
        };

        if (isEditMode) {
          await updateUser(payload);
          toast.success('Cập nhật tài khoản thành công');
        } else {
          await createUser(payload);
          toast.success('Tạo tài khoản thành công');
        }
        
        fetchUsers();
        handleClose();
      } catch (error) {
        console.error('Failed to save user', error);
      } finally {
        setIsLoading(false);
      }
    }
  }, [validateFields, formData, user?._id?.$oid, updateUser, createUser, fetchUsers, handleClose]);

  // Check if this is edit mode
  const isEditMode = useMemo(() => Boolean(user?._id?.$oid), [user?._id?.$oid]);

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[800px] lg:max-w-[900px] max-h-[85vh] overflow-y-auto rounded-2xl shadow-2xl border-0 px-0 py-0">
        {/* Header */}
        <div className="bg-gray-50 px-6 py-3 rounded-t-2xl border-b border-gray-200 flex items-center gap-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <KeenIcon icon={isEditMode ? "notepad-edit" : "add-notepad"} className="w-5 h-5 text-blue-500" />
          </div>
          <div className="flex-1">
            <DialogTitle className="font-bold text-2xl text-gray-900 leading-tight">
              {isEditMode ? "Cập nhật tài khoản" : "Thêm tài khoản mới"}
            </DialogTitle>
            <p className="text-sm text-gray-600 mt-1 font-normal">
              {isEditMode ? "Cập nhật thông tin tài khoản người dùng" : "Tạo tài khoản mới cho người dùng"}
            </p>
          </div>
        </div>

        {/* Body */}
        <div className="py-6 px-6 pb-24">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Cột trái - Thông tin cơ bản */}
            <div className="space-y-8">
              <div>
                <div className="flex items-center gap-2 mb-4 font-semibold text-gray-800 text-lg">
                  <KeenIcon icon="user" className="w-4 h-4 text-blue-400" />
                  Thông tin cơ bản
                </div>
                <div className="space-y-5">
                  <FormField
                    label="Họ tên"
                    value={formData.fullname}
                    onChange={(value) => handleFieldChange('fullname', value)}
                    error={errors.fullname}
                  />
                  <FormField
                    label="Email"
                    value={formData.email}
                    onChange={(value) => handleFieldChange('email', value)}
                    error={errors.email || errors.emailInvalid}
                  />
                  <FormField
                    label="Số điện thoại"
                    value={formData.phone}
                    onChange={(value) => handleFieldChange('phone', value)}
                    type="tel"
                    error={errors.phone}
                  />
                </div>
              </div>
            </div>

            {/* Cột phải - Thông tin bổ sung */}
            <div className="space-y-8">
              <div>
                <div className="flex items-center gap-2 mb-4 font-semibold text-gray-800 text-lg">
                  <KeenIcon icon="information-2" className="w-4 h-4 text-blue-400" />
                  Thông tin bổ sung
                </div>
                <div className="space-y-5">
                  <FormField
                    label="Cấp độ tài khoản"
                    value={formData.level}
                    onChange={(value) => handleFieldChange('level', value)}
                    type="select"
                    options={levelOptions}
                    error={errors.level}
                  />
                  <FormField
                    label="Địa chỉ"
                    value={formData.address}
                    onChange={(value) => handleFieldChange('address', value)}
                    error={errors.address}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer cố định bottom */}
        <DialogFooter className="sticky bottom-0 left-0 w-full bg-white border-t border-gray-200 px-6 py-4 z-10 shadow-sm flex justify-end">
          <ActionButtons
            onCancel={handleClose}
            onSubmit={handleSubmit}
            isEdit={isEditMode}
            isLoading={isLoading}
          />
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
});

export { ModalUpdateUser };
