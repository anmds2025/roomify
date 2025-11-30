import React, { forwardRef, useCallback, useEffect, useMemo, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { KeenIcon } from '@/components';
import { toast } from 'react-toastify';
import { IOption, useAuthContext } from '@/auth';
import { ModalUpdateInteriorProps } from '@/api/interior';
import { useInterior } from '@/hooks/useInterior';

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

const ModalUpdateInterior = forwardRef<HTMLDivElement, ModalUpdateInteriorProps>(
  ({ open, onClose, interior, fetchInterior }, ref) => {
    const { createInterior, updateInterior } = useInterior();
    const { currentUser } = useAuthContext();
    const [homeOptions, setHomeOptions] = useState<IOption[]>([]);
    // Form state
    const [formData, setFormData] = useState({
      name: '',
      price: 0,
    });

    // Error state
    const [errors, setErrors] = useState({
      name: false,
      price: false,
    });

    // Initialize form data when user changes
    useEffect(() => {
      if (interior) {
        setFormData({
          name: interior?.name || '',
          price: interior?.price || 0,
        });
      }
    }, [interior]);

    // Reset form when modal closes
    const resetForm = useCallback(() => {
      setFormData({
        name: '',
        price: 0,
      });
      setErrors({
        name: false,
        price: false,
      });
    }, []);

    
    const isEdit: Boolean = useCallback(() => Boolean(interior._id), [interior])();
    
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
      const newErrors = {
        name: !formData.name.trim(),
        price: formData.price == 0,
      };

      setErrors(newErrors);

      const hasError = Object.values(newErrors).some(error => error);
      
      if (hasError) {
        if (newErrors.name) toast.error("Tên là bắt buộc");
        if (newErrors.price) toast.error("Số tiền là bắt buộc");
      }
      return !hasError;
    }, [formData]);

    // Handle form submission
    const handleUpdate = useCallback(async () => {
      if (!validateForm()) return;

      try {
        const payload = {
          pk: interior?._id?.$oid || "",
          user_pk : currentUser?._id.$oid || '',
          name: formData.name,
          price: formData.price
        };

        if(isEdit) {
          await updateInterior(payload);
        } else {
          await createInterior(payload);
        }
        
        handleClose();
        
        if (fetchInterior) {
          fetchInterior();
        }
      } catch (error) {
        console.error('Failed to update interior', error);
        toast.error("Lỗi cập nhật thông tin");
      }
    }, [validateForm, interior, formData, updateInterior, handleClose, fetchInterior, isEdit, createInterior]);

    return (
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="w-[calc(100vw-2rem)] sm:max-w-3xl lg:max-w-4xl max-h-[90vh] overflow-y-auto bg-white dark:bg-gray-900 p-0 rounded-xl">

          {/* Header */}
          <DialogHeader className="sticky top-0 z-20 bg-white dark:bg-gray-900 border-b border-gray-200 px-4 py-3 sm:px-6">
            <DialogTitle className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              {isEdit ? "Cập nhật thông tin nội thất" : "Thêm mới nội thất"}
            </DialogTitle>
          </DialogHeader>

          {/* Body */}
          <div className="py-6 px-4 sm:px-6">
            <div className="space-y-8">

              {/* Thông tin cơ bản */}
              <div>
                <div className="flex items-center gap-2 mb-3 font-semibold text-gray-800 text-lg dark:text-white">
                  <KeenIcon icon="user" className="w-4 h-4 text-blue-500" />
                  Thông tin cơ bản
                </div>

                <div className="space-y-4">

                  {/* Tên nội thất */}
                  <FormField
                    label="Tên nội thất"
                    value={formData.name}
                    onChange={(value) => handleFieldChange("name", value)}
                    error={errors.name}
                    required
                  />

                  {/* Số tiền */}
                  <FormField
                    label="Số tiền"
                    value={formData.price.toString()}
                    onChange={(value) => handleFieldChange("price", value)}
                    type="number"
                    error={errors.price}
                    required
                  />

                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-3 p-4 border-t border-gray-200 bg-white dark:bg-gray-900 rounded-b-xl">

            <button
              onClick={handleClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 
                border border-gray-300 dark:border-gray-700 rounded-md 
                hover:bg-gray-50 dark:hover:bg-gray-700 
                focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
            >
              Hủy bỏ
            </button>

            <button
              onClick={handleUpdate}
              className="px-4 py-2 text-sm font-medium text-white bg-primary rounded-md 
                hover:bg-primary-dark transition-colors 
                focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
            >
              {isEdit ? "Cập nhật" : "Thêm mới"}
            </button>

          </div>

        </DialogContent>
      </Dialog>

    );
  }
);

ModalUpdateInterior.displayName = 'ModalUpdateInterior';

export { ModalUpdateInterior };