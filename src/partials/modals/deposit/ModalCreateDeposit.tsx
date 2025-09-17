import { forwardRef, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Modal, ModalContent, ModalBody, ModalHeader } from '@/components/modal';
import { KeenIcon } from '@/components';
import { toast } from 'react-toastify';
import { useSnackbar } from 'notistack';
import { useDeposit } from '@/hooks/useDeposit';
import { useHomeManagement, useRoomManagement, useTenant } from '@/hooks';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import React from 'react';
import { Label } from '@/components/ui/label';
import { IOption, useAuthContext } from '@/auth';
import { ITenantData } from '@/types';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import LoadingOverlay from '@/components/LoadingOverlay';

interface ModalCreateDepositProps {
  open: boolean;
  onClose: () => void;
  fetchDeposits: () => void; 
}

interface Option {
  value: string;
  label: string;
}


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

FormField.displayName = 'FormField';

const ModalCreateDeposit = forwardRef<HTMLDivElement, ModalCreateDepositProps>(
  ({ open, onClose, fetchDeposits }) => {
  const { createDeposit } = useDeposit();
  const { fetchHomes, data: dataHomes } = useHomeManagement();
  const { fetchRooms, data: dataRoom } = useRoomManagement();
  const { fetchTenants } = useTenant();
  const [loading, setLoading] = useState(false);

  const { currentUser } = useAuthContext();
  const [tenants, setTenants] = useState<ITenantData[]>([]);
  const [homeOptions, setHomeOptions] = useState<IOption[]>([]);
  const [roomOptions, setRoomOptions] = useState<IOption[]>([]);
  const [tenantOptions, setTenantOptions] = useState<IOption[]>([]);
  
  const today = new Date().toLocaleDateString('vi-VN');
  const [selectedHome, setSelectedHome] = useState<string | null>(null);
  const [selectedRoom, setSelectedRoom] = useState<string | null>(null);
  const [selectedTenant, setSelectedTenant] = useState<string | null>(null);
  // Form state
  const [formData, setFormData] = useState({
    addressCreate: '',
    deposit: 0,
    keepRoomDate: '',
    valueDate: '',
  });

  // Error state
  const [errors, setErrors] = useState({
    home_pk : false,
    room_pk: false,
    tenant_pk: false,
    addressCreate: false,
    deposit: false,
    keepRoomDate: false,
    valueDate: false,
  });

  useEffect(() => {
    fetchHomes();
    fetchRooms();
  }, [fetchHomes, fetchRooms]);

  // Map dataHomes thành option
  useEffect(() => {
    if (dataHomes) {
      const options = dataHomes.map((home: any) => ({
        label: home.home_name,
        value: home._id?.$oid,
      })) as IOption[];

      setHomeOptions(options);
    }
  }, [dataHomes]);

  // Khi chọn home → lọc rooms theo homeId
  useEffect(() => {
    if (selectedHome && dataRoom) {
      const options = dataRoom
        .filter((room: any) => room.home_pk === selectedHome)
        .map((room: any) => ({
          label: room.room_name,
          value: room._id?.$oid,
        })) as IOption[];
      setRoomOptions(options);
      setSelectedRoom(null); // reset room khi đổi home
      setTenantOptions([]);  // reset tenants
      setSelectedTenant(null);
    }
  }, [selectedHome, dataRoom]);

  useEffect(() => {
    const loadTenants = async () => {
      if (selectedRoom) {
        try {
          const response = await fetchTenants(selectedRoom); // gọi API tenants
          const options = response.objects.map((tenant: ITenantData) => ({
            label: tenant.name,
            value: tenant._id?.$oid,
          })) as IOption[];

          setTenantOptions(options);
        } catch (error) {
          console.error("Lỗi khi fetch tenants:", error);
          setTenantOptions([]);
        }
      } else {
        setTenantOptions([]);
      }

      // reset tenant khi đổi room
      setSelectedTenant(null);
    };

    loadTenants();
  }, [selectedRoom, fetchTenants]);

  // Reset form when modal closes
  const resetForm = useCallback(() => {
    setFormData({
      addressCreate: '',
      deposit: 0,
      keepRoomDate: '',
      valueDate: '',
    });
    setErrors({
      home_pk : false,
      room_pk: false,
      tenant_pk: false,
      addressCreate: false,
      deposit: false,
      keepRoomDate: false,
      valueDate: false,
    });
  }, []);
  
  const handleClose = useCallback(() => {
    setSelectedHome('')
    setSelectedRoom('')
    setSelectedTenant('')
    resetForm();
    onClose();
  }, [resetForm, onClose]);

  function formatDate(dateString: string) {
    const date = new Date(dateString);

    const day = date.getDate();
    const month = date.getMonth() + 1; 
    const year = date.getFullYear();

    return `${day}/${month}/${year}`;
  }

  // Handle field change
  const handleFieldChange = useCallback((field: keyof typeof formData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setErrors(prev => ({ ...prev, [field]: false, emailInvalid: false }));
  }, []);

  // Validation
  const validateForm = useCallback((): boolean => {
    const newErrors = {
      home_pk : !selectedHome?.trim(),
      room_pk: !selectedRoom?.trim(),
      tenant_pk: !selectedTenant?.trim(),
      addressCreate: !formData.addressCreate.trim(),
      deposit: formData.deposit == 0,
      keepRoomDate: !formData.keepRoomDate.trim(),
      valueDate: !formData.valueDate.trim()
    };

    setErrors(newErrors);

    const hasError = Object.values(newErrors).some(error => error);
    
    if (hasError) {
      if (newErrors.addressCreate) toast.error("Địa chỉ ký cọc là bắt buộc");
      if (newErrors.deposit) toast.error("Số tiền cọc là bắt buộc");
      if (newErrors.keepRoomDate) toast.error("Giữ phòng đến ngày là bắt buộc");
      if (newErrors.valueDate) toast.error("Giá trị đến ngày là bắt buộc");
    }
    return !hasError;
  }, [formData]);

  // Handle form submission
  const handleCreate = useCallback(async () => {
    if (!validateForm()) return;
    try {
      const payload = {
        today: today,
        user_pkA : currentUser?._id.$oid || '',
        user_pkB: selectedTenant || '',
        room_pk: selectedRoom || '',
        addressCreate: formData.addressCreate,
        deposit: formData.deposit.toString(),
        keepRoomDate: formData.keepRoomDate,
        valueDate: formData.valueDate,
        keepRoomDateSave: formatDate(formData.keepRoomDate),
        valueDateSave: formatDate(formData.valueDate),
      };
      setLoading(true);
      handleClose();
      await createDeposit(payload);
      if (fetchDeposits) {
        fetchDeposits();
      }
    } catch (error) {
      console.error('Failed to update expense', error);
      toast.error("Lỗi khi tạo giấy cọc");
    } finally{
      setLoading(false);
    }
  }, [validateForm, formData, createDeposit, handleClose, fetchDeposits]);

  return (
    <>
      <LoadingOverlay
        title='Đang tạo giấy cọc, vui lòng chờ...'
        visible={loading}
        maxSeconds={60}
        onTimeout={() => {
          setLoading(false);
        }}
      />
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-white dark:bg-gray-900">
          <DialogHeader className="sticky top-0 bg-white dark:bg-gray-900">
            <DialogTitle className="text-lg font-semibold text-gray-900 dark:text-gray-100 p-2">
              {'Thêm giấy cọc'}
            </DialogTitle>
          </DialogHeader>

          <div className="py-6 px-6">
              <div className="space-y-6">
              <div className="space-y-8">
                <div>
                  <div className="flex items-center gap-2 mb-4 font-semibold text-gray-800 text-lg dark:text-black">
                    <KeenIcon icon="dollar" className="w-4 h-4 text-blue-400 dark:text-black" />
                    Thông tin cơ bản
                  </div>
                  <div className="space-y-5">
                    <SelectField
                      label="Tòa nhà"
                      name="home_pk"
                      value={selectedHome || ''}
                      onChange={(name, value) => {
                        const selectedHome = homeOptions.find(t => t.value === value);
                        setSelectedHome(selectedHome?.value.toString() || '')
                        setErrors(prev => ({ ...prev, [name]: false }));
                      }}
                      options={homeOptions.map((t) => ({
                        value: t.value.toString(),
                        label: t.label,
                      }))}
                      required
                      error={errors.home_pk}
                      disabled={homeOptions.length === 0}
                    />
                    <SelectField
                      label="Phòng"
                      name="room_pk"
                      value={selectedRoom || ''}
                      onChange={(name, value) => {
                        const selectedRoom = roomOptions.find(t => t.value === value);
                        setSelectedRoom(selectedRoom?.value.toString() || '')
                        setErrors(prev => ({ ...prev, [name]: false }));
                      }}
                      options={roomOptions.map((t) => ({
                        value: t.value.toString(),
                        label: t.label,
                      }))}
                      required
                      error={errors.room_pk}
                      disabled={roomOptions.length === 0}
                    />
                    <SelectField
                      label="Người thuê"
                      name="tenant_pk"
                      value={selectedTenant || ''}
                      onChange={(name, value) => {
                        const selectedTenant = tenantOptions.find(t => t.value === value);
                        setSelectedTenant(selectedTenant?.value.toString() || '')
                        setErrors(prev => ({ ...prev, [name]: false }));  
                      }}
                      options={tenantOptions.map((t) => ({
                        value: t.value.toString(),
                        label: t.label,
                      }))}
                      required
                      error={errors.tenant_pk}
                      disabled={tenantOptions.length === 0}
                    />
                    <FormField
                      label="Nơi tạo phiếu"
                      value={formData.addressCreate}
                      onChange={(value) => handleFieldChange('addressCreate', value)}
                      error={errors.addressCreate}
                      required={true}
                    />
                    <FormField
                      label="Số tiền cọc"
                      value={formData.deposit.toString()}
                      onChange={(value) => handleFieldChange('deposit', value)}
                      type="number"
                      error={errors.deposit}
                      required={true}
                    />
                    <InputField
                      label="Giữ phòng đến ngày"
                      name="keepRoomDate"
                      type="date"
                      value={formData.keepRoomDate}
                      onChange={(name, value) => handleFieldChange(name as keyof typeof formData, value)}
                      error={errors.keepRoomDate}
                      required={true}
                    />
                    <InputField
                      label="Giá trị đến ngày"
                      name="valueDate"
                      type="date"
                      value={formData.valueDate}
                      onChange={(name, value) => handleFieldChange(name as keyof typeof formData, value)}
                      error={errors.valueDate}
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
              onClick={handleCreate}
              className="px-4 py-2 text-sm font-medium text-white bg-primary border border-transparent rounded-md hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors"
            >
              {'Thêm mới'}
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
);

ModalCreateDeposit.displayName = 'ModalCreateDeposit';

export { ModalCreateDeposit };