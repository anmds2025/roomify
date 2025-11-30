import React, { forwardRef, useCallback, useEffect, useState } from 'react';
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
import { useInteriorManagement } from '@/hooks/useInteriorManagement';
import { InteriorData } from '@/api/interior';
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
  placeholder?: string;
}

function renderField({ type, value, onChange, label, error, disabled, options, inputMode, placeholder }: RenderFieldProps) {
  if (type === 'select') {
    return (
      <Select value={value} onValueChange={onChange} disabled={disabled}>
        <SelectTrigger className={(error ? 'border-red-500 focus-visible:ring-red-500 ' : '') + 'w-full'}>
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
        className={(error ? 'border-red-500 focus-visible:ring-red-500 ' : '') + 'w-full'}
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
      className={(error ? 'border-red-500 focus-visible:ring-red-500 ' : '') + 'w-full' }
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
    
    {renderField({ type, value, onChange, label, error, disabled, options, inputMode, placeholder })}
    {error && (
      <div className="flex items-center gap-1 mt-2 text-sm font-medium text-red-600">
        <KeenIcon icon="warning" className="w-4 h-4" />
        <span>{label} là bắt buộc</span>
      </div>
    )}
  </div>
));
export interface SelectedInterior {
  id: string;
  name: string;
  price: number;
  condition: string;
}

FormField.displayName = 'FormField';

const ModalUpdateRoom = forwardRef<HTMLDivElement, ModalUpdateRoomProps>(
  ({ open, onClose, room, fetchRooms, homeOptions }, ref) => {
    const { updateRoom } = useRoom();
    const {
      data: dataInterior,
      fetchInteriors
    } = useInteriorManagement();
    const [selectedInteriors, setSelectedInteriors] = useState<SelectedInterior[]>([]);
    // Form state
    const [formData, setFormData] = useState({
      room_name: '',
      price: '',
      size: '',
      note: '',
      home_pk: '',
      type_collect_water: '',
      type_collect_electricity: ''
    });

    // Error state
    const [errors, setErrors] = useState({
      room_name: false,
      price: false,
      size: false,
      // address: false,
      home_pk: false,
      type_collect_water: false,
      type_collect_electricity: false
    });

    useEffect(() => {
      fetchInteriors()
    }, []);

    // Initialize form data when room changes
    useEffect(() => {
      if (room) {
        setFormData({
          room_name: room.room_name || '',
          price: room.price?.toString() || '',
          size: room.size?.toString() || '',
          // address: room.address || '',
          note: room.note || '',
          home_pk: room.home_pk || '',
          type_collect_water: room.type_collect_water || '',
          type_collect_electricity: room.type_collect_electricity || ''
        });
        if (
          Array.isArray(room?.interiors) &&
          room.interiors.every(
            (item) =>
              item &&
              typeof item.id === "string" &&
              typeof item.name === "string" &&
              typeof item.price === "number" &&
              typeof item.condition === "string"
          )
        ) {
          setSelectedInteriors(room.interiors as SelectedInterior[]);
        }
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
        home_pk: '',
        type_collect_water: '',
        type_collect_electricity: ''
      });
      setSelectedInteriors([])
      setErrors({
        room_name: false,
        price: false,
        size: false,
        // address: false,
        home_pk: false,
        type_collect_water: false,
        type_collect_electricity: false
      });
    }, []);

    const isEdit: Boolean = useCallback(() => Boolean(room._id?.$oid), [room])();

    const handleCheckboxChange = (item: InteriorData) => {
      const id = item._id.$oid;
      setSelectedInteriors((prev) => {
        const exists = prev.find((i) => i.id === id);
        if (exists) {
          // Nếu đã chọn rồi => bỏ chọn (xóa khỏi mảng)
          return prev.filter((i) => i.id !== id);
        } else {
          // Nếu chưa có => thêm vào mảng
          return [
            ...prev,
            {
              id,
              name: item.name,
              price: item.price,
              condition: "",
            },
          ];
        }
      });
    };

    const handleFieldInteriorChange = (
      id: string,
      field: "price" | "condition",
      value: string | number
    ) => {
      setSelectedInteriors((prev) =>
        prev.map((item) =>
          item.id === id ? { ...item, [field]: value } : item
        )
      );
    };
    
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
        home_pk: !formData.home_pk.trim(),
        type_collect_water: !formData.type_collect_water.trim(),
        type_collect_electricity: !formData.type_collect_electricity.trim()
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
          home_pk: formData.home_pk.trim(),
          type_collect_water: formData.type_collect_water,
          type_collect_electricity: formData.type_collect_electricity,
          interiors: selectedInteriors
        };

        await updateRoom(payload);
        toast.success('Cập nhật phòng thành công');
        handleClose();
        fetchRooms();
      } catch (error) {
        toast.error('Có lỗi khi cập nhật phòng');
      }
    }, [formData, room._id?.$oid, updateRoom, handleClose, fetchRooms, validateForm, selectedInteriors]);

    return (
      <Dialog open={open} onOpenChange={handleClose}>
         <DialogContent ref={ref} className="w-[calc(100vw-2rem)] sm:max-w-3xl lg:max-w-5xl max-h-[90vh] overflow-y-auto bg-white dark:bg-gray-900 p-0 rounded-xl">
            <DialogHeader className="sticky top-0 z-20 bg-white dark:bg-gray-900 border-b border-gray-200 px-4 py-3 sm:px-6">
              <DialogTitle className="text-lg font-semibold text-gray-900 dark:text-gray-100 p-2">
              {isEdit ? 'Cập nhật thông tin phòng' : 'Thêm mới phòng'}
            </DialogTitle>
          </DialogHeader>

          <div className="py-6 px-4 sm:px-6">
            <div className="space-y-6">
              {/* Thông tin cơ bản */}
              <div>
                <div className="flex items-center gap-2 mb-4 font-semibold text-gray-800 text-lg dark:text-black">
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
                  <FormField
                    label="Loại thu tiền nước"
                    value={formData.type_collect_water}
                    onChange={(value) => handleFieldChange('type_collect_water', value)}
                    error={errors.type_collect_water}
                    required={true}
                    type="select"
                    options={[
                      { label: "Đầu tháng", value: "dau_thang" },
                      { label: "Cuối tháng", value: "cuoi_thang" }
                    ]}
                  />
                  <FormField
                    label="Loại thu tiền điện"
                    value={formData.type_collect_electricity}
                    onChange={(value) => handleFieldChange('type_collect_electricity', value)}
                    error={errors.type_collect_electricity}
                    required={true}
                    type="select"
                    options={[
                      { label: "Đầu tháng", value: "dau_thang" },
                      { label: "Cuối tháng", value: "cuoi_thang" }
                    ]}
                  />
                </div>
              </div>
              {dataInterior.length > 0 && (
                <div className="col-span-2">
                  <label className="block font-medium mb-2">Nội thất</label>
                  <div className="grid grid-cols-1 gap-3">
                    {dataInterior.map((item) => {
                      const id = item._id.$oid;
                      const selected = selectedInteriors.find((i) => i.id === id);

                      return (
                        <div key={id} className="flex flex-col gap-1 border p-2 rounded-lg">
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={!!selected}
                              onChange={() => handleCheckboxChange(item)}
                              className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                            />
                            <span className="font-medium">{item.name}</span>
                          </label>

                          {selected && (
                            <div className="ml-6 mt-1 flex flex-col gap-2">
                              <div className="flex items-center gap-2">
                                <label className="w-full text-sm text-gray-600">Giá:</label>
                                <input
                                  type="number"
                                  value={selected.price}
                                  onChange={(e) =>
                                    handleFieldInteriorChange(id, "price", Number(e.target.value))
                                  }
                                  className="border rounded p-1 w-full text-sm"
                                />
                              </div>
                              <div className="flex items-center gap-2">
                                <label className="w-full text-sm text-gray-600">Tình trạng:</label>
                                <input
                                  type="text"
                                  value={selected.condition}
                                  onChange={(e) =>
                                    handleFieldInteriorChange(id, "condition", e.target.value)
                                  }
                                  className="border rounded p-1 w-full text-sm"
                                  placeholder="VD: Mới, Cũ..."
                                />
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
              

              {/* Thông tin bổ sung */}
              <div>
                <div className="flex items-center gap-2 mb-4 font-semibold text-gray-800 text-lg dark:text-black">
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
          <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 p-4 border-t border-gray-200 sticky bottom-0 bg-white">
            <button
              onClick={handleClose}
              className="w-full sm:w-auto px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors"
            >
              Hủy bỏ
            </button>
            <button
              onClick={handleUpdate}
              className="w-full sm:w-auto px-4 py-2 text-sm font-medium text-white bg-primary border border-transparent rounded-md hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors"
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