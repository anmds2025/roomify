import React, { useState, useEffect, useCallback } from 'react';
import { Modal, ModalBody, ModalContent, ModalHeader } from '@/components/modal';
import { KeenIcon } from '@/components';
import { ITenantData, ITenantFormData } from '@/types/tenant';
import { IRoomData } from '@/pages/dashboards/light-sidebar/blocks/rooms/RoomsData';

interface TenantFormModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: ITenantFormData) => Promise<void>;
  tenant?: ITenantData | null;
  room: IRoomData | null;
  isLoading?: boolean;
}

const InputField = React.memo(({
  label,
  name,
  value,
  onChange,
  placeholder,
  type = "text",
  required = false,
  error = false,
  disabled = false,
}: {
  label: string;
  name: string;
  value: string;
  onChange: (name: string, value: string) => void;
  placeholder?: string;
  type?: string;
  required?: boolean;
  error?: boolean;
  disabled?: boolean;
}) => (
  <div className="mb-4">
    <label className="form-label text-sm font-medium mb-2">
      {label}
      {required && <span className="text-danger ml-1">*</span>}
    </label>
    <input
      type={type}
      name={name}
      value={value}
      onChange={(e) => onChange(name, e.target.value)}
      placeholder={placeholder}
      disabled={disabled}
      className={`input ${error ? 'input-error' : ''}`}
    />
    {error && (
      <div className="text-danger text-xs mt-1">
        {`${label} là bắt buộc`}
      </div>
    )}
  </div>
));

InputField.displayName = 'InputField';

export const TenantFormModal: React.FC<TenantFormModalProps> = ({
  open,
  onClose,
  onSubmit,
  tenant,
  room,
  isLoading = false,
}) => {
  const [formData, setFormData] = useState<ITenantFormData>({
    room_pk: room?._id?.$oid || '',
    name: '',
    phone: '',
    email: '',
    cccd_code: '',
    cccd_day: '',
    cccd_address: '',
    birthday: '',
    num_car: ''
  });

  const [errors, setErrors] = useState<Record<string, boolean>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize form data when tenant changes - prevent infinite loops
  useEffect(() => {
    if (!open) return; // Only update when modal is open
    
    if (tenant) {
      setFormData({
        room_pk: room?._id?.$oid || '',
        name: tenant.name || '',
        phone: tenant.phone || '',
        email: tenant.email || '',
        cccd_code: tenant.cccd_code || '',
        cccd_day: tenant.cccd_day || '',
        cccd_address: tenant.cccd_address || '',
        birthday: tenant.birthday || '',
        num_car: tenant.num_car || ''
      });
    } else {
      setFormData({
        room_pk: room?._id?.$oid || '',
        name: '',
        phone: '',
        email: '',
        cccd_code: '',
        cccd_day: '',
        cccd_address: '',
        birthday: '',
        num_car: ''
      });
    }
    setErrors({});
  }, [tenant, open]); // Only depend on tenant and open state

  // Handle input change - no circular dependencies
  const handleInputChange = useCallback((name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error when user starts typing - use functional update to avoid dependency
    setErrors(prev => {
      if (prev[name]) {
        return { ...prev, [name]: false };
      }
      return prev;
    });
  }, []); // No dependencies to prevent infinite loops

  // Validate form - optimized with constants
  const validateForm = useCallback((): boolean => {
    const newErrors: Record<string, boolean> = {};
    
    // Required field validation
    if (!formData.name.trim()) newErrors.name = true;
    if (!formData.phone.trim()) newErrors.phone = true;
    if (!formData.cccd_code.trim()) newErrors.cccd_code = true;
    if (!formData.cccd_address.trim()) newErrors.cccd_address = true;
    if (!formData.cccd_day.trim()) newErrors.cccd_day = true; 
    if (!formData.birthday.trim()) newErrors.birthday = true
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  // Handle form submission - optimized error handling
  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting || !validateForm()) return;
    setIsSubmitting(true);
    try {
      await onSubmit(formData);
      // Success - let parent handle closing
    } catch (error) {
      console.error('Error submitting tenant form:', error);
      // Re-enable form on error only
      setIsSubmitting(false);
      return; // Don't close on error
    }
    
    // Reset and close on success
    setIsSubmitting(false);
    onClose();
  }, [formData, isSubmitting, onSubmit, validateForm, onClose]);

  // Handle modal close - clean reset with factory function
  const createEmptyFormData = useCallback(() => ({
    room_pk: room?._id?.$oid || '',
    name: '',
    phone: '',
    email: '',
    cccd_code: '',
    cccd_day: '',
    cccd_address: '',
    birthday: '',
    num_car: ''
  }), [room?._id?.$oid]);

  const handleClose = useCallback(() => {
    if (isSubmitting) return; // Prevent closing during submission
    
    // Reset form state
    setFormData(createEmptyFormData());
    setErrors({});
    setIsSubmitting(false);
    onClose();
  }, [isSubmitting, onClose, createEmptyFormData]);

  // Reset isSubmitting when modal closes successfully
  useEffect(() => {
    if (!open && isSubmitting) {
      setIsSubmitting(false);
    }
  }, [open, isSubmitting]);

  const isEditMode = !!tenant;

  return (
    <Modal open={open} onClose={handleClose} zIndex={1400}>
      <ModalContent className="max-w-2xl w-full mx-4">
        <ModalHeader>
          <div className="flex items-center gap-3">
            <div className="size-10 bg-primary-light rounded-full flex items-center justify-center">
              <KeenIcon icon="profile-circle" className="text-primary" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">
                {isEditMode ? 'Chỉnh sửa thông tin người thuê' : 'Thêm người thuê mới'}
              </h3>
              <p className="text-sm text-gray-600">
                {room?.room_name} - {room?.home_name}
              </p>
            </div>
          </div>
          <button 
            onClick={handleClose} 
            disabled={isSubmitting}
            className="btn btn-sm btn-icon btn-light"
          >
            <KeenIcon icon="cross" />
          </button>
        </ModalHeader>

        <ModalBody>
          <form onSubmit={handleSubmit} className="space-y-0">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InputField
                label="Họ và tên"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Nhập họ và tên"
                required
                error={errors.name}
                disabled={isSubmitting}
              />

              <InputField
                label="Số điện thoại"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                placeholder="Nhập số điện thoại"
                required
                error={errors.phone}
                disabled={isSubmitting}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InputField
                label="Ngày sinh"
                name="birthday"
                type="date"
                required
                value={formData.birthday}
                onChange={handleInputChange}
                error={errors.birthday}
                disabled={isSubmitting}
              />

              <InputField
                label="Biển số xe"
                name="num_car"
                value={formData.num_car}
                onChange={handleInputChange}
                placeholder="Nhập biển số xe"
                disabled={isSubmitting}
              />
            </div>

            <InputField
              label="Email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="Nhập địa chỉ email (không bắt buộc)"
              error={errors.email}
              disabled={isSubmitting}
            />

            <div style={{marginTop: '8px'}} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InputField
                label="Số CCCD"
                name="cccd_code"
                value={formData.cccd_code}
                onChange={handleInputChange}
                placeholder="Nhập số CCCD"
                required
                error={errors.cccd_code}
                disabled={isSubmitting}
              />

              <InputField
                label="Ngày cấp CCCD"
                name="cccd_day"
                type="date"
                required
                value={formData.cccd_day}
                onChange={handleInputChange}
                error={errors.cccd_day}
                disabled={isSubmitting}
              />
            </div>

            <InputField
              label="Nơi cấp CCCD"
              name="cccd_address"
              required
              value={formData.cccd_address}
              onChange={handleInputChange}
              placeholder="Nhập nơi cấp CCCD"
              error={errors.cccd_address}
              disabled={isSubmitting}
            />

            <div className="flex justify-end gap-3 pt-6 border-t">
              <button
                type="button"
                onClick={handleClose}
                disabled={isSubmitting}
                className="btn btn-light hover:bg-gray-200 transition-colors disabled:opacity-50"
              >
                Hủy
              </button>
              <button
                type="submit"
                disabled={isSubmitting || isLoading}
                className="btn btn-primary hover:bg-primary-dark transition-colors disabled:opacity-50"
              >
                {isSubmitting || isLoading ? (
                  <>
                    <div className="animate-spin size-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                    {isEditMode ? 'Đang cập nhật...' : 'Đang thêm...'}
                  </>
                ) : (
                  <>
                    <KeenIcon icon="check" className="mr-2" />
                    {isEditMode ? 'Cập nhật' : 'Thêm mới'}
                  </>
                )}
              </button>
            </div>
          </form>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

TenantFormModal.displayName = 'TenantFormModal'; 