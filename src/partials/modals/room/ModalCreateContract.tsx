import React, { forwardRef, useCallback, useEffect, useMemo, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { KeenIcon } from '@/components';
import { toast } from 'react-toastify';
import { IRoomData } from '@/pages/dashboards/light-sidebar/blocks/rooms/RoomsData';
import { useRoom } from '@/hooks/useRoom';
import { Select, SelectItem, SelectContent, SelectTrigger, SelectValue } from '@/components/ui/select';
import { IOption, useAuthContext } from '@/auth';
import { IHomeData } from '@/pages/dashboards/light-sidebar/blocks/homes';
import { IUserData } from '@/pages/dashboards/light-sidebar';
import { ITenantData } from '@/types/tenant';
import LoadingOverlay from '@/components/LoadingOverlay';

interface ModalCreateContractProps {
  open: boolean;
  onClose: () => void;
  room: IRoomData;
  home: IHomeData;
  userData: ITenantData[],
  fetchRooms: () => void;
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
  inputMode,
  placeholder
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
  placeholder?: string;
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

const ModalCreateContract = forwardRef<HTMLDivElement, ModalCreateContractProps>(
  ({ open, onClose, room, home, fetchRooms, userData }, ref) => {
    const { createContract } = useRoom();
    const [loading, setLoading] = useState(false);
    const { currentUser } = useAuthContext();
    if (!currentUser) {
      throw new Error('User not authenticated');
    }
    const [userOptions, setUserOptions] = useState<IOption[]>([]);

    // Form state
    const [formData, setFormData] = useState({
      user_pkB: '',
      address_b: '',
      num_month: 0,
      formDate: '',
      toDate: '',
      deposit: 0,
      note: ''
    });

    // Error state
    const [errors, setErrors] = useState({
      user_pkB: false,
      address_b: false,
      num_month: false,
      formDate: false,
      toDate: false,
      deposit: false,
    });

    // Initialize form data when room changes
    useEffect(() => {
      setFormData({
          user_pkB: '',
          address_b: '',
          num_month: 0,
          formDate: '',
          toDate: '',
          deposit: 0,
          note: ''
        });
    }, []);

    useEffect(() => {
        const options = userData.map((user) => {
          return {
            label: user.name,
            value: user._id?.$oid
          } as IOption
        });
        setUserOptions(options);
      }, [userData]);

    // Reset form when modal closes
    const resetForm = useCallback(() => {
      setFormData({
        user_pkB: '',
        address_b: '',
        num_month: 0,
        formDate: '',
        toDate: '',
        deposit: 0,
        note: ''
      });
      setErrors({
        user_pkB: false,
        address_b: false,
        num_month: false,
        formDate: false,
        toDate: false,
        deposit: false,
      });
    }, []);

    const isEdit: Boolean = useCallback(() => Boolean(room._id?.$oid), [room])();

    function convertNumberToVietnameseText(number: number): string {
      const numberWords = ['không', 'một', 'hai', 'ba', 'bốn', 'năm', 'sáu', 'bảy', 'tám', 'chín'];

      const getWord = (num: number) => numberWords[num];

      const millions = Math.floor(number / 1_000_000);
      const thousands = Math.floor((number % 1_000_000) / 1_000);

      let result = '';

      if (millions) {
        result += `${getWord(millions)} triệu`;
      }

      if (thousands) {
        result += `${result ? ' ' : ''}${getWord(Math.floor(thousands / 100))} trăm`;

        const tens = Math.floor((thousands % 100) / 10);
        const units = thousands % 10;

        if (tens > 1) {
          result += ` ${getWord(tens)} mươi`;
          if (units === 1) result += ' mốt';
          else if (units === 5) result += ' lăm';
          else if (units > 0) result += ` ${getWord(units)}`;
        } else if (tens === 1) {
          result += ' mười';
          if (units === 5) result += ' lăm';
          else if (units > 0) result += ` ${getWord(units)}`;
        } else if (units > 0) {
          result += ` linh ${getWord(units)}`;
        }

        result += ' ngàn';
      }

      if (!result) result = 'không đồng';
      else result += ' đồng';

      return result.charAt(0).toUpperCase() + result.slice(1);
    }
    
    const handleClose = useCallback(() => {
      resetForm();
      onClose();
    }, [resetForm, onClose]);

    function calculateToDate(formDate: string, numMonths: number): string {
      const [year, month, day] = formDate.split('-').map(Number); // yyyy-mm-dd
      const startDate = new Date(year, month - 1, day);
      const endDate = new Date(startDate);
      endDate.setMonth(endDate.getMonth() + Number(numMonths));
      endDate.setDate(endDate.getDate() - 1); // Trừ 1 ngày

      const yyyy = endDate.getFullYear();
      const mm = String(endDate.getMonth() + 1).padStart(2, '0');
      const dd = String(endDate.getDate()).padStart(2, '0');
      return `${yyyy}-${mm}-${dd}`; // dạng yyyy-mm-dd phù hợp với input[type="date"]
    }

    // Handle field change
    const handleFieldChange = useCallback((field: keyof typeof formData, value: string) => {
      setFormData(prev => {
        const newFormData = { ...prev, [field]: value };

        if (
          (field === 'formDate' || field === 'num_month') &&
          newFormData.formDate &&
          newFormData.num_month
        ) {
          const toDate = calculateToDate(newFormData.formDate, newFormData.num_month);
          newFormData.toDate = toDate;
        }

        return newFormData;
      });

      setErrors(prev => ({ ...prev, [field]: false, toDate: field === 'toDate' ? false : prev.toDate }));
    }, []);
    // Validate form
    const validateForm = useCallback(() => {
      const newErrors = {
        user_pkB:  !formData.user_pkB.trim(),
        address_b: !formData.address_b.trim(),
        num_month: formData.num_month <= 0,
        formDate: !formData.formDate.trim(),
        toDate: !formData.toDate.trim(),
        deposit: formData.deposit <= 0,
      };
      console.log(newErrors)
      setErrors(newErrors);
      return !Object.values(newErrors).some(error => error);
    }, [formData]);

    // Handle update
    const handleUpdate = useCallback(async () => {
      
      if (!validateForm()) {
        toast.error('Vui lòng điền đầy đủ thông tin bắt buộc');
        return;
      }

      const userB = userData.find(u => u._id?.$oid === formData.user_pkB);

      if (!userB) {
        toast.error('Vui lòng chọn người thuê để kí hợp đồng');
        return;
      }
      const today = new Date().toLocaleDateString('vi-VN');
      try {
        const payload = {
          user_pkA: currentUser?._id.$oid,
          user_pkB: userB._id?.$oid,
          room_name: room.room_name,
          room_pk: room._id?.$oid,
          home_pk: home._id?.$oid,
          address: home?.address || "",
          today: today,

          name_a: currentUser?.fullname,
          phone_a: currentUser?.phone,
          cccd_a: currentUser.cccd_code,
          cccdDay_a: currentUser.cccd_day,
          cccdAddress_a: currentUser.cccd_address,

          name_b: userB.name,
          phone_b: userB.phone,
          cccd_b: userB.cccd_code,
          cccdDay_b: userB.cccd_day,
          cccdAddress_b: userB.cccd_address,
          address_b: formData.address_b,

          numMonth: formData.num_month.toString(),
          formDate: formData.formDate.split('-').reverse().map(s => String(Number(s))).join('/'),
          toDate: formData.toDate.split('-').reverse().map(s => String(Number(s))).join('/'),
          priceRoom: room.price.toString(),
          priceRoomText: convertNumberToVietnameseText(room.price),
          deposit: formData.deposit.toString(),
          depositText: convertNumberToVietnameseText(formData.deposit),
          priceElectricity: home?.electricity_price || '',
          priceWater: home?.water_price || '',
          electricityStart: room?.numElectricityOld?.toString() || '',
          priceWaterStart: room?.numWaterOld?.toString() || '',
          priceGarbage: home?.junk_price?.toString() || '',
          priceCar: home?.car_price?.toString() || '',
          otherServices: home?.service_price?.toString() || '',
          note: formData.note,
          typeWater: home?.typeWater || '',
        };
        toast.success('Đang tạo hợp đồng, bạn vui lòng chờ');
        setLoading(true);
        try {
          await createContract(payload, userData); 
          toast.success('Tạo hợp đồng thành công!');
          handleClose();
          fetchRooms();
        } catch (error) {
          toast.error('Có lỗi khi tạo hợp đồng');
        } finally {
          setLoading(false);
        }
      } catch (error) {
        toast.error('Có lỗi khi tạo hợp đồng');
      }
    }, [formData, room._id?.$oid, createContract, handleClose, fetchRooms, validateForm]);

    return (
      <>
        <Dialog open={open} onOpenChange={handleClose}>
          <LoadingOverlay
            title='Đang tạo hợp đồng, vui lòng chờ...'
            visible={loading}
            maxSeconds={60}
            onTimeout={() => {
              setLoading(false);
            }}
          />
          <DialogContent className={`${loading && 'z-10'} max-w-2xl max-h-[90vh] overflow-y-auto bg-white`}>
            <DialogHeader>
              <DialogTitle className="text-lg font-semibold text-gray-900">
                Tạo hợp đồng phòng {room.room_name}
              </DialogTitle>
            </DialogHeader>
            <div className="py-6 px-6">
              <div className="space-y-6">
                {/* Thông tin cơ bản */}
                <div>
                  <div className="flex items-center gap-2 mb-4 font-semibold text-gray-800 text-lg">
                    <KeenIcon icon="home" className="w-4 h-4 text-blue-400" />
                    Thông tin bên thuê
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      label="Người thuê"
                      value={formData.user_pkB}
                      onChange={(value) => handleFieldChange('user_pkB', value)}
                      type="select"
                      options={userOptions as []}
                      required={true}
                      error={errors.user_pkB}
                    />
                    <FormField
                      label="Địa chỉ người thuê"
                      value={formData.address_b}
                      onChange={(value) => handleFieldChange('address_b', value)}
                      error={errors.address_b}
                      required={true}
                      placeholder="VD: 123 Đường ABC, Quận 1, TP.HCM"
                      type="string"
                    />
                  </div>
                </div>

                {/* Thông tin bổ sung */}
                <div>
                  <div className="flex items-center gap-2 mb-4 font-semibold text-gray-800 text-lg">
                    <KeenIcon icon="notepad" className="w-4 h-4 text-green-400" />
                    Thông tin hợp đồng
                  </div>
                  <div className="space-y-4">
                    <FormField
                      label="Thời hạn(tháng)"
                      value={String(formData.num_month)}
                      onChange={(value) => handleFieldChange('num_month', value)}
                      error={errors.num_month}
                      required={true}
                      type="number"
                    />
                    <FormField
                      label="Từ ngày"
                      value={formData.formDate}
                      onChange={(value) => handleFieldChange('formDate', value)}
                      error={errors.formDate}
                      required={true}
                      type="date"
                    />
                    <FormField
                      label="Đến ngày"
                      value={formData.toDate}
                      onChange={(value) => handleFieldChange('toDate', value)}
                      error={errors.toDate}
                      required={true}
                      type="date"
                    />
                    <FormField
                      label="Tiền cọc"
                      value={String(formData.deposit)}
                      onChange={(value) => handleFieldChange('deposit', value)}
                      error={errors.deposit}
                      required={true}
                      type="number"
                    />
                    <FormField
                      label="Ghi chú"
                      value={formData.note}
                      onChange={(value) => handleFieldChange('note', value)}
                      type="textarea"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
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
                Tạo hợp đồng
              </button>
            </div>
          </DialogContent>
        </Dialog>
      </>
    );
  }
);

ModalCreateContract.displayName = 'ModalCreateContract';

export { ModalCreateContract }; 