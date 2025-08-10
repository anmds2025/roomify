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
import { IOption } from '@/auth';

interface ModalUpdateRoomProps {
  open: boolean;
  onClose: () => void;
  room: IRoomData;
  fetchRooms: () => void;
  homeOptions: IOption[];
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

const ModalUpdateRoom = forwardRef<HTMLDivElement, ModalUpdateRoomProps>(
  ({ open, onClose, room, fetchRooms, homeOptions }, ref) => {
    const { updateRoom } = useRoom();

    // Form state
    const [formData, setFormData] = useState({
      room_name: '',
      price: '',
      size: '',
      // address: '',
      note: '',
      home_pk: ''
    });

    // Error state
    const [errors, setErrors] = useState({
      room_name: false,
      price: false,
      size: false,
      // address: false,
      home_pk: false
    });

    // Initialize form data when room changes
    useEffect(() => {
      if (room) {
        setFormData({
          room_name: room.room_name || '',
          price: room.price?.toString() || '',
          size: room.size?.toString() || '',
          // address: room.address || '',
          note: room.note || '',
          home_pk: room.home_pk || ''
        });
      }
    }, [room]);

    // Reset form when modal closes
    const resetForm = useCallback(() => {
      setFormData({
        room_name: '',
        price: '',
        size: '',
        // address: '',
        note: '',
        home_pk: ''
      });
      setErrors({
        room_name: false,
        price: false,
        size: false,
        // address: false,
        home_pk: false
      });
    }, []);

    const isEdit: Boolean = useCallback(() => Boolean(room._id?.$oid), [room])();
    
    const handleClose = useCallback(() => {
      resetForm();
      onClose();
    }, [resetForm, onClose]);

    // Handle field change
    const handleFieldChange = useCallback((field: keyof typeof formData, value: string) => {
      setFormData(prev => ({ ...prev, [field]: value }));
      setErrors(prev => ({ ...prev, [field]: false }));
    }, []);

    // Validate form
    const validateForm = useCallback(() => {
      const newErrors = {
        room_name: !formData.room_name.trim(),
        price: !formData.price.trim() || parseInt(formData.price) <= 0,
        size: !formData.size.trim() || parseInt(formData.size) <= 0,
        // address: !formData.address.trim(),
        home_pk: !formData.home_pk.trim()
      };

      setErrors(newErrors);
      return !Object.values(newErrors).some(error => error);
    }, [formData]);

    // Handle update
    const handleUpdate = useCallback(async () => {
      if (!validateForm()) {
        toast.error('Vui lòng điền đầy đủ thông tin bắt buộc');
        return;
      }

      try {
        const payload = {
          pk: room._id?.$oid,
          room_name: formData.room_name.trim(),
          price: parseInt(formData.price),
          size: parseInt(formData.size),
          // address: formData.address.trim(),
          note: formData.note.trim(),
          token: '',
          home_pk: formData.home_pk.trim()
        };

        await updateRoom(payload);
        toast.success('Cập nhật phòng thành công');
        handleClose();
        fetchRooms();
      } catch (error) {
        toast.error('Có lỗi khi cập nhật phòng');
      }
    }, [formData, room._id?.$oid, updateRoom, handleClose, fetchRooms, validateForm]);

    return (
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-white">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold text-gray-900 p-2">
              {isEdit ? 'Cập nhật thông tin phòng' : 'Thêm mới phòng'}
            </DialogTitle>
          </DialogHeader>

          <div className="py-6 px-6">
            <div className="space-y-6">
              {/* Thông tin cơ bản */}
              <div>
                <div className="flex items-center gap-2 mb-4 font-semibold text-gray-800 text-lg">
                  <KeenIcon icon="home" className="w-4 h-4 text-blue-400" />
                  Thông tin cơ bản
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    label="Tòa nhà"
                    value={formData.home_pk}
                    onChange={(value) => handleFieldChange('home_pk', value)}
                    error={errors.home_pk}
                    required={true}
                    placeholder="VD: 123 Đường ABC, Quận 1, TP.HCM"
                    type="select"
                    options={homeOptions as []}
                  />
                  <FormField
                    label="Tên phòng"
                    value={formData.room_name}
                    onChange={(value) => handleFieldChange('room_name', value)}
                    error={errors.room_name}
                    required={true}
                    placeholder="VD: Phòng 101, Phòng A1..."
                  />
                  <FormField
                    label="Giá thuê (VNĐ)"
                    value={formData.price}
                    onChange={(value) => handleFieldChange('price', value)}
                    type="number"
                    error={errors.price}
                    required={true}
                    inputMode="numeric"
                    placeholder="VD: 5000000"
                  />
                  <FormField
                    label="Diện tích (m²)"
                    value={formData.size}
                    onChange={(value) => handleFieldChange('size', value)}
                    type="number"
                    error={errors.size}
                    required={true}
                    inputMode="numeric"
                    placeholder="VD: 25"
                  />
                </div>
              </div>

              {/* Thông tin bổ sung */}
              <div>
                <div className="flex items-center gap-2 mb-4 font-semibold text-gray-800 text-lg">
                  <KeenIcon icon="notepad" className="w-4 h-4 text-green-400" />
                  Thông tin bổ sung
                </div>
                <div className="space-y-4">
                  <FormField
                    label="Ghi chú"
                    value={formData.note}
                    onChange={(value) => handleFieldChange('note', value)}
                    type="textarea"
                    placeholder="Mô tả thêm về phòng, tiện ích, quy định..."
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
              {isEdit ? 'Cập nhật' : 'Thêm mới'}
            </button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }
);

ModalUpdateRoom.displayName = 'ModalUpdateRoom';

export { ModalUpdateRoom }; 