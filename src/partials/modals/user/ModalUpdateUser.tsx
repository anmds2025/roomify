import React, { forwardRef, useCallback, useEffect, useMemo, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { KeenIcon } from '@/components';
import { toast } from 'react-toastify';
import { ModalUpdateUserProps } from '@/pages/dashboards/light-sidebar/blocks/users/UsersData';
import { useUser } from '@/hooks/useUser';

interface RenderFieldProps {
  type: string;
  value: any;
  onChange: (value: any) => void;
  label: string;
  error?: boolean;
  disabled?: boolean;
  options?: Array<{ value: string; label: string }>;
  inputMode?: "search" | "text" | "email" | "tel" | "url" | "none" | "numeric" | "decimal" | undefined;
}

function renderField({ type, value, onChange, label, error, disabled, options, inputMode }: RenderFieldProps) {
  if (type === 'select') {
    return (
      <Select value={value} onValueChange={onChange} disabled={disabled}>
        <SelectTrigger className={error ? 'border-red-500 focus-visible:ring-red-500' : ''}>
          <SelectValue placeholder={`Chọn ${label.toLowerCase()}`} />
        </SelectTrigger>
        <SelectContent className="bg-white">
          {options?.map((option: { value: string; label: string }) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    );
  }
  if (type === 'textarea') {
    return (
      <Textarea
        value={value}
        placeholder={`Nhập ${label.toLowerCase()}`}
        onChange={e => onChange(e.target.value)}
        disabled={disabled}
        className={error ? 'border-red-500 focus-visible:ring-red-500' : ''}
      />
    );
  }
  // Default: Input
  return (
    <Input
      type={type}
      value={value}
      placeholder={`Nhập ${label.toLowerCase()}`}
      onChange={e => {
        if (type === 'tel') {
          onChange(e.target.value.replace(/[^0-9]/g, ''));
        } else {
          onChange(e.target.value);
        }
      }}
      disabled={disabled}
      className={error ? 'border-red-500 focus-visible:ring-red-500' : ''}
      inputMode={inputMode}
    />
  );
}

// Component cho form field với shadcn UI
const FormField = React.memo(({ 
  label, 
  value, 
  onChange, 
  type = "text", 
  error = false, 
  options,
  disabled = false,
  required = false,
  inputMode
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  error?: boolean;
  options?: { value: string; label: string }[];
  disabled?: boolean;
  required?: boolean;
  inputMode?: "search" | "text" | "email" | "tel" | "url" | "none" | "numeric" | "decimal" | undefined;
}) => (
  <div className="space-y-2">
    <Label className="text-sm font-medium text-gray-700 flex items-center gap-1">
      {label}
      {required && <span className="text-red-500">*</span>}
    </Label>
    
    {renderField({ type, value, onChange, label, error, disabled, options, inputMode })}
    {error && (
      <div className="flex items-center gap-1 mt-2 text-sm font-medium text-red-600">
        <KeenIcon icon="warning" className="w-4 h-4" />
        <span>{label} là bắt buộc</span>
      </div>
    )}
  </div>
));

FormField.displayName = 'FormField';

const ModalUpdateUser = forwardRef<HTMLDivElement, ModalUpdateUserProps>(
  ({ open, onClose, user, fetchUsers }, ref) => {
    const { createUser, updateUser } = useUser();

    // Form state
    const [formData, setFormData] = useState({
      fullname: '',
      email: '',
      phone: '',
      level: '',
      address: '',
    });

    // Error state
    const [errors, setErrors] = useState({
      fullname: false,
      email: false,
      phone: false,
      level: false,
      emailInvalid: false,
    });

    // Initialize form data when user changes
    useEffect(() => {
      if (user) {
        setFormData({
          fullname: user?.fullname || '',
          email: user?.email || '',
          phone: user?.phone || '',
          level: user?.level || '',
          address: user?.address || '',
        });
      }
    }, [user]);

    // Reset form when modal closes
    const resetForm = useCallback(() => {
      setFormData({
        fullname: '',
        email: '',
        phone: '',
        level: '',
        address: '',
      });
      setErrors({
        fullname: false,
        email: false,
        phone: false,
        level: false,
        emailInvalid: false,
      });
    }, []);

    
    const isEdit: Boolean = useCallback(() => Boolean(user._id), [user])();
    
    const handleClose = useCallback(() => {
      resetForm();
      onClose();
    }, [resetForm, onClose]);

    // Handle field change
    const handleFieldChange = useCallback((field: keyof typeof formData, value: string) => {
      setFormData(prev => ({ ...prev, [field]: value }));
      setErrors(prev => ({ ...prev, [field]: false, emailInvalid: false }));
    }, []);

    // Validation
    const validateForm = useCallback((): boolean => {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      
             const newErrors = {
         fullname: !formData.fullname.trim(),
         email: !formData.email.trim(),
         phone: !formData.phone.trim(),
         level: !formData.level.trim(),
         emailInvalid: Boolean(formData.email.trim() && !emailRegex.test(formData.email)),
       };

      setErrors(newErrors);

      const hasError = Object.values(newErrors).some(error => error);
      
      if (hasError) {
        if (newErrors.fullname) toast.error("Họ tên là bắt buộc");
        if (newErrors.email) toast.error("Email là bắt buộc");
        if (newErrors.emailInvalid) toast.error("Email không hợp lệ");
        if (newErrors.phone) toast.error("Số điện thoại là bắt buộc");
        if (newErrors.level) toast.error("Cấp độ tài khoản là bắt buộc");
      }

      return !hasError;
    }, [formData]);

    // Handle form submission
    const handleUpdate = useCallback(async () => {
      if (!validateForm()) return;

      try {
        const payload = {
          pk: user?._id?.$oid || "",
          fullname: formData.fullname,
          email: formData.email,
          phone: formData.phone,
          level: formData.level,
          address: formData.address,
          typeLogin: 'admin_add',
        };

        if(isEdit) {
          await updateUser(payload);
        } else {
          await createUser(payload);
        }
        
        handleClose();
        
        // Refresh user list
        if (fetchUsers) {
          console.log('??');
          fetchUsers();
        }
      } catch (error) {
        console.error('Failed to update user', error);
        toast.error("Lỗi cập nhật thông tin");
      }
    }, [validateForm, user, formData, updateUser, handleClose, fetchUsers, isEdit, createUser]);

    // Level options
    const levelOptions = useMemo(() => [
      { value: 'Basic', label: 'Basic' },
      { value: 'Pro', label: 'Pro' },
      { value: 'Premium', label: 'Premium' },
      { value: 'Enterprise', label: 'Enterprise' }
    ], []);

    return (
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-white">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold text-gray-900 p-2">
              {isEdit ? 'Cập nhật thông tin người dùng' : 'Thêm mới người dùng'}
            </DialogTitle>
          </DialogHeader>

          <div className="py-6 px-6">
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
                      required={true}
                    />
                    <FormField
                      label="Email"
                      value={formData.email}
                      onChange={(value) => handleFieldChange('email', value)}
                      error={errors.email || errors.emailInvalid}
                      required={true}
                      inputMode="email"
                      type="email"
                    />
                    <FormField
                      label="Số điện thoại"
                      value={formData.phone}
                      onChange={(value) => handleFieldChange('phone', value)}
                      type="tel"
                      error={errors.phone}
                      required={true}
                      inputMode="numeric"
                    />
                    <FormField
                      label="Địa chỉ"
                      value={formData.address}
                      onChange={(value) => handleFieldChange('address', value)}
                      type="textarea"
                    />
                  </div>
                </div>
              </div>

              {/* Cột phải - Thông tin bổ sung */}
              <div className="space-y-8">
                <div>
                  <div className="flex items-center gap-2 mb-4 font-semibold text-gray-800 text-lg">
                    <KeenIcon icon="setting-2" className="w-4 h-4 text-green-400" />
                    Cài đặt tài khoản
                  </div>
                  <div className="space-y-5">
                    <FormField
                      label="Cấp độ tài khoản"
                      value={formData.level}
                      onChange={(value) => handleFieldChange('level', value)}
                      type="select"
                      options={levelOptions}
                      error={errors.level}
                      required={true}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 p-4 border-t border-gray-200">
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
              {isEdit ? 'Cập nhật' : 'Thêm mới'}
            </button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }
);

ModalUpdateUser.displayName = 'ModalUpdateUser';

export { ModalUpdateUser };
