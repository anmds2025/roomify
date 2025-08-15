import React, { useState, useEffect, useCallback } from 'react';
import { Modal, ModalBody, ModalContent, ModalHeader } from '@/components/modal';
import { KeenIcon } from '@/components';
import { IRoomData } from '@/pages/dashboards/light-sidebar/blocks/rooms/RoomsData';
import { IMoneySlipData, IMoneySlipFormData } from '@/types/moneySlip';
import { IOption, useAuthContext } from '@/auth';
import { IHomeData } from '@/pages/dashboards/light-sidebar/blocks/homes';
import { ITenantData } from '@/types/tenant';
import { toast } from 'react-toastify';
import LoadingOverlay from './LoadingOverlay';

interface MoneySlipFormModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: IMoneySlipFormData) => Promise<void>;
  moneySlip?: IMoneySlipData | null;
  room: IRoomData;
  home: IHomeData;
  isLoading?: boolean;
  userData: ITenantData[],
  onCreate: () => void;
}

interface Option {
  value: string;
  label: string;
}

interface SelectFieldProps {
  label: string;
  name: string;
  value: string;
  onChange: (name: string, value: string) => void;
  options: Option[];
  required?: boolean;
  error?: boolean;
  disabled?: boolean;
}

const SelectField: React.FC<SelectFieldProps> = ({
  label,
  name,
  value,
  onChange,
  options,
  required = false,
  error = false,
  disabled = false,
}) => {
  return (
    <div className="mb-4">
      <label className="form-label text-sm font-medium mb-2">
        {label} {required && <span className="text-danger ml-1">*</span>}
      </label>
      <select
        name={name}
        value={value}
        onChange={(e) => onChange(name, e.target.value)}
        disabled={disabled}
        className={`input ${error ? "input-error" : ""}`}
      >
        <option value="">-- Chọn --</option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error && (
        <div className="text-danger text-xs mt-1">
          {`${label} là bắt buộc`}
        </div>
      )}
    </div>
  );
};


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

export const MoneySlipFormModal: React.FC<MoneySlipFormModalProps> = ({
  open,
  onClose,
  onSubmit,
  room,
  home,
  isLoading = false,
  userData,
  onCreate
}) => {
  const { currentUser } = useAuthContext();
  const [formData, setFormData] = useState<IMoneySlipFormData>({
    room_pk: room?._id?.$oid || '',
    user_pkA: '',
    name_a: '',
    user_pkB: '',
    name_b: '',
    numPerson: '',  
    numElectricityOld: '',
    numElectricityNew: '',
    numWaterOld: '',
    numWaterNew: '',
    monthNumber: '',
    priceDebt: '',
    today: '',
    numBank: '',
    nameBank: '',
    addressBank: '',
    imageQR: '',
    deposit: ''
  });

  const [errors, setErrors] = useState<Record<string, boolean>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const today = new Date().toLocaleDateString('vi-VN');
  const [userOptions, setUserOptions] = useState<IOption[]>([]);
  const [loading, setLoading] = useState(false);

  // Initialize form data when tenant changes - prevent infinite loops
  useEffect(() => {
    if (!open) return; // Only update when modal is open
    setFormData({
      room_pk: room?._id?.$oid || '',
      user_pkA: currentUser?._id.$oid || '',
      name_a: currentUser?.fullname || '',
      user_pkB: '',
      name_b: '',
      numPerson: room?.numPeo?.toString() || '',  
      numElectricityOld: room?.numElectricityOld?.toString() || '',
      numElectricityNew: '',
      numWaterOld: room?.numWaterOld?.toString() || '',
      numWaterNew: '',
      monthNumber: '',
      priceDebt: '0',
      today: today,
      numBank: home?.numBank || '',
      nameBank: home?.nameBank || '',
      addressBank: home?.addressBank || '',
      imageQR: home?.imageQR || '',
      deposit: room?.deposit?.toString() || ''
    });
    setErrors({});
  }, [open]); // Only depend on tenant and open state

  const handleTenantChange = (value: string, label?: string) => {
  setFormData((prev) => ({
    ...prev,
    user_pkB: value,       // pk
    name_b: label || "",   // tên
  }));
  };

  useEffect(() => {
    const options = userData.map((user) => {
      return {
        label: user.name,
        value: user._id?.$oid
      } as IOption
    });
    setUserOptions(options);
  }, [userData]);

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
    const phoneRegex = /^(0|\+84)[3-9]\d{8}$/;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    // Required field validation
    if (!formData.name_b.trim()) newErrors.name_b = true;
    if (!formData.numPerson.trim()) newErrors.numPerson = true;
    if (!formData.numElectricityOld.trim()) newErrors.numElectricityOld = true;
    if (!formData.numElectricityNew.trim()) newErrors.numElectricityNew = true;
    if (!formData.monthNumber.trim()) newErrors.monthNumber = true;
    if (!formData.user_pkB.trim()) newErrors.user_pkB = true;
    
    if(room?.typeWater != 'month'){
      if (!formData.numWaterOld.trim()) newErrors.numWaterOld = true;
      if (!formData.numWaterNew.trim()) newErrors.numWaterNew = true;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  // Handle form submission - optimized error handling
  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isSubmitting || !validateForm()) return;

    setIsSubmitting(true);
    try {
      toast.success('Đang tạo hợp đồng, bạn vui lòng chờ');
      setLoading(true);
      onClose();
      onCreate()
      await onSubmit(formData);
    } catch (error) {
      console.error('Error submitting tenant form:', error);
      // Re-enable form on error only
      setIsSubmitting(false);
      setLoading(false)
      return; // Don't close on error
    }
    setLoading(false)
    // Reset and close on success
    setIsSubmitting(false);
    onClose();
  }, [formData, isSubmitting, onSubmit, validateForm, onClose]);

  // Handle modal close - clean reset with factory function
  const createEmptyFormData = useCallback(() => ({
    room_pk: room?._id?.$oid || '',
    user_pkA: '',
    name_a: '',
    user_pkB: '',
    name_b: '',
    numPerson: '',  
    numElectricityOld: '',
    numElectricityNew: '',
    numWaterOld: '',
    numWaterNew: '',
    monthNumber: '',
    priceDebt: '',
    today: '',
    numBank: '',
    nameBank: '',
    addressBank: '',
    imageQR: '',
    deposit: ''
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

  return (
    <>
      <LoadingOverlay
        visible={loading}
        maxSeconds={60}
        onTimeout={() => {
          setLoading(false);
        }}
      />
      <Modal open={open} onClose={handleClose} zIndex={1400}>
        <ModalContent className="max-w-2xl w-full mx-4">
          <ModalHeader>
            <div className="flex items-center gap-3">
              <div className="size-10 bg-primary-light rounded-full flex items-center justify-center">
                <KeenIcon icon="profile-circle" className="text-primary" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">
                  {'Thêm phiếu thu mới'}
                </h3>
                <p className="text-sm text-gray-600">
                  {room?.room_name}
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
                <SelectField
                  label="Người thuê"
                  name="user_pkB"
                  value={formData.user_pkB}
                  onChange={(name, value) => {
                    const selectedTenant = userOptions.find(t => t.value === value);
                    setFormData(prev => ({
                      ...prev,
                      user_pkB: selectedTenant?.value.toString() || '',
                      name_b: selectedTenant?.label || ""
                    }));
                  }}
                  options={userOptions.map((t) => ({
                    value: t.value.toString(),
                    label: t.label,
                  }))}
                  required
                  error={errors.user_pkB}
                  disabled={isSubmitting}
                />

                <InputField
                  label="Số người"
                  name="numPerson"
                  type='number'
                  value={formData.numPerson}
                  onChange={handleInputChange}
                  required
                  error={errors.numPerson}
                  disabled={isSubmitting}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InputField
                  label="Số điện cũ"
                  name="numElectricityOld"
                  type='number'
                  required
                  error={errors.numElectricityOld}
                  value={formData.numElectricityOld}
                  onChange={handleInputChange}  
                  disabled={isSubmitting}
                />
                <InputField
                  label="Số điện mới"
                  name="numElectricityNew"
                  type='number'
                  required
                  error={errors.numElectricityNew}
                  value={formData.numElectricityNew}
                  onChange={handleInputChange}  
                  disabled={isSubmitting}
                />
              </div>

              {room?.typeWater != 'month' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <InputField
                    label="Số nước cũ"
                    name="numWaterOld"
                    type='number'
                    required
                    error={errors.numWaterOld}
                    value={formData.numWaterOld}
                    onChange={handleInputChange}  
                    disabled={isSubmitting}
                  />
                  <InputField
                    label="Số nước mới"
                    name="numWaterNew"
                    type='number'
                    required
                    error={errors.numWaterNew}
                    value={formData.numWaterNew}
                    onChange={handleInputChange}  
                    disabled={isSubmitting}
                  />
                </div>
              )}

              <InputField
                label="Tháng thu"
                name="monthNumber"
                type="number"
                value={formData.monthNumber}
                onChange={handleInputChange}
                error={errors.monthNumber}
                required
                disabled={isSubmitting}
              />

              <InputField
                label="Nợ"
                name="priceDebt"
                type="number"
                value={formData.priceDebt}
                onChange={handleInputChange}
                error={errors.priceDebt}
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
                    {'Đang thêm...'}
                    </>
                  ) : (
                    <>
                      <KeenIcon icon="check" className="mr-2" />
                      {'Thêm'}
                    </>
                  )}
                </button>
              </div>
            </form>
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
};

MoneySlipFormModal.displayName = 'MoneySlipFormModal'; 