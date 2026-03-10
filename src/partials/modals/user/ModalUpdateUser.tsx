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
    const { createUser, updateUser, getRechargePackages, createRecharge, getRechargeTransactions } = useUser();

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

    const [rechargePackages, setRechargePackages] = useState<Array<{ code: string; name: string; amount_vnd: number; point_value: number; bonus?: string }>>([]);
    const [rechargeHistory, setRechargeHistory] = useState<Array<{ _id: { $oid: string }; package_name: string; amount_vnd: number; point_value: number; status: string; checkout_url?: string }>>([]);
    const [isLoadingRecharge, setIsLoadingRecharge] = useState(false);

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

    const loadRechargeData = useCallback(async () => {
      if (!isEdit) return;
      setIsLoadingRecharge(true);
      try {
        const [packages, transactions] = await Promise.all([
          getRechargePackages(),
          getRechargeTransactions(),
        ]);
        setRechargePackages(packages || []);
        setRechargeHistory((transactions || []).slice(0, 5));
      } finally {
        setIsLoadingRecharge(false);
      }
    }, [isEdit, getRechargePackages, getRechargeTransactions]);

    useEffect(() => {
      if (open) {
        loadRechargeData();
      }
    }, [open, loadRechargeData]);

    const handleRecharge = useCallback(async (packageCode: string) => {
      const response = await createRecharge(packageCode);
      if (response?.checkout_url) {
        window.open(response.checkout_url, '_blank', 'noopener,noreferrer');
      }
      loadRechargeData();
      if (fetchUsers) fetchUsers();
    }, [createRecharge, loadRechargeData, fetchUsers]);

    return (
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="w-[calc(100vw-2rem)] sm:max-w-3xl lg:max-w-4xl max-h-[90vh] overflow-y-auto bg-white dark:bg-gray-900 p-0 rounded-xl">
          
          {/* Header */}
          <DialogHeader className="sticky top-0 z-20 bg-white dark:bg-gray-900 border-b border-gray-200 px-4 py-3 sm:px-6">
            <DialogTitle className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              {isEdit ? "Cập nhật thông tin người dùng" : "Thêm mới người dùng"}
            </DialogTitle>
          </DialogHeader>

          {/* Body */}
          <div className="py-6 px-4 sm:px-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">

              {/* LEFT: Thông tin cơ bản */}
              <div className="space-y-6">
                <div className="flex items-center gap-2 mb-2 font-semibold text-gray-800 text-lg dark:text-white">
                  <KeenIcon icon="user" className="w-4 h-4 text-blue-500" />
                  Thông tin cơ bản
                </div>

                <div className="space-y-4">
                  <FormField
                    label="Họ tên"
                    value={formData.fullname}
                    onChange={(value) => handleFieldChange("fullname", value)}
                    error={errors.fullname}
                    required
                  />

                  <FormField
                    label="Email"
                    value={formData.email}
                    onChange={(value) => handleFieldChange("email", value)}
                    error={errors.email || errors.emailInvalid}
                    required
                    inputMode="email"
                    type="email"
                  />

                  <FormField
                    label="Số điện thoại"
                    value={formData.phone}
                    onChange={(value) => handleFieldChange("phone", value)}
                    type="tel"
                    inputMode="numeric"
                    error={errors.phone}
                    required
                  />

                  <FormField
                    label="Địa chỉ"
                    value={formData.address}
                    onChange={(value) => handleFieldChange("address", value)}
                    type="textarea"
                  />
                </div>
              </div>

              {/* RIGHT: Cài đặt tài khoản */}
              <div className="space-y-6">
                <div className="flex items-center gap-2 mb-2 font-semibold text-gray-800 text-lg dark:text-white">
                  <KeenIcon icon="setting-2" className="w-4 h-4 text-green-500" />
                  Cài đặt tài khoản
                </div>

                <div className="space-y-4">
                  <FormField
                    label="Cấp độ tài khoản"
                    value={formData.level}
                    onChange={(value) => handleFieldChange("level", value)}
                    type="select"
                    options={levelOptions}
                    error={errors.level}
                    required
                  />

                  {isEdit && (
                    <div className="rounded-xl border border-dashed border-blue-200 bg-blue-50/60 p-4 space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-sm text-gray-600">Số điểm hiện tại</div>
                          <div className="text-2xl font-bold text-blue-700">{user?.point_balance || 0} điểm</div>
                        </div>
                        <div className="text-right text-xs text-gray-500">
                          <div>Tổng đã nạp</div>
                          <div>{(user?.total_recharged_vnd || 0).toLocaleString('vi-VN')} đ</div>
                        </div>
                      </div>

                      <div className="text-sm font-semibold text-gray-700">Chọn gói nạp điểm</div>
                      <div className="grid grid-cols-1 gap-2">
                        {(rechargePackages || []).map((pkg) => (
                          <button
                            key={pkg.code}
                            type="button"
                            disabled={isLoadingRecharge}
                            onClick={() => handleRecharge(pkg.code)}
                            className="w-full rounded-lg border border-blue-200 bg-white px-3 py-2 text-left hover:bg-blue-50 disabled:opacity-60"
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-medium text-gray-800">{pkg.name}</span>
                              <span className="text-blue-700 font-semibold">{pkg.point_value} điểm</span>
                            </div>
                            <div className="text-xs text-gray-500 mt-1">
                              {pkg.amount_vnd.toLocaleString('vi-VN')} đ {pkg.bonus ? `• ${pkg.bonus}` : ''}
                            </div>
                          </button>
                        ))}
                      </div>

                      <div>
                        <div className="text-sm font-semibold text-gray-700 mb-2">Lịch sử nạp gần đây</div>
                        <div className="space-y-2 max-h-40 overflow-y-auto">
                          {(rechargeHistory || []).length === 0 ? (
                            <div className="text-xs text-gray-500">Chưa có giao dịch nạp.</div>
                          ) : (
                            rechargeHistory.map((item) => (
                              <div key={item._id.$oid} className="rounded-md border border-gray-200 bg-white p-2 text-xs">
                                <div className="flex justify-between">
                                  <span>{item.package_name}</span>
                                  <span className={item.status === 'paid' ? 'text-green-600' : item.status === 'failed' ? 'text-red-600' : 'text-amber-600'}>
                                    {item.status}
                                  </span>
                                </div>
                                <div className="text-gray-500">{item.amount_vnd.toLocaleString('vi-VN')} đ • {item.point_value} điểm</div>
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

            </div>
          </div>

          {/* Footer Buttons */}
          <div className="flex justify-end gap-3 p-4 border-t border-gray-200 bg-white dark:bg-gray-900 rounded-b-xl">
            <button
              onClick={handleClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
            >
              Hủy bỏ
            </button>

            <button
              onClick={handleUpdate}
              className="px-4 py-2 text-sm font-medium text-white bg-primary rounded-md hover:bg-primary-dark transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
            >
              {isEdit ? "Cập nhật" : "Thêm mới"}
            </button>
          </div>

        </DialogContent>
      </Dialog>

    );
  }
);

ModalUpdateUser.displayName = 'ModalUpdateUser';

export { ModalUpdateUser };
