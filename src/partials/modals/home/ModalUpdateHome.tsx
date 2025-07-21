import React, { forwardRef, useCallback, useEffect, useMemo, useState, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { KeenIcon } from '@/components';
import { toast } from 'react-toastify';
import { IHomeData } from '@/pages/dashboards/light-sidebar/blocks/homes/HomesData';
import { useHome } from '@/hooks/useHome';
import { useCloudinary } from '@/utils/Cloudinary';
import { useAuthContext } from '@/auth';

interface ModalUpdateHomeProps {
  open: boolean;
  onClose: () => void;
  home: IHomeData;
  fetchHomes: () => void;
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

const ModalUpdateHome = forwardRef<HTMLDivElement, ModalUpdateHomeProps>(
  ({ open, onClose, home, fetchHomes }, ref) => {
    const { updateHome } = useHome();
    const { uploadImage, deleteImage, extractPublicId } = useCloudinary();
    const qrFileInputRef = useRef<HTMLInputElement | null>(null);
    const { currentUser } = useAuthContext();
    // Form state
    const [formData, setFormData] = useState({
      home_name: '',
      phone: '',
      address: '',
      electricity_price: '',
      water_price: '',
      service_price: '',
      junk_price: '',
      car_price: '',
      typeWater: '',
      numBank: '',
      nameBank: '',
      addressBank: '',
      imageQR: '',
    });

    // QR Image state
    const [qrImageFile, setQrImageFile] = useState<File | null>(null);
    const [qrImageFileStr, setQrImageFileStr] = useState<string | null>(null);

    // Error state
    const [errors, setErrors] = useState({
      home_name: false,
      phone: false,
    });

    // Initialize form data when home changes
    useEffect(() => {
      if (home) {
        setFormData({
          home_name: home?.home_name || '',
          phone: home?.user_phone || '',
          address: home?.address || '',
          electricity_price: home?.electricity_price || '',
          water_price: home?.water_price || '',
          service_price: home?.service_price || '',
          junk_price: home?.junk_price || '',
          car_price: home?.car_price || '',
          typeWater: home?.typeWater || '',
          numBank: home?.numBank || '',
          nameBank: home?.nameBank || '',
          addressBank: home?.addressBank || '',
          imageQR: home?.imageQR || '',
        });
        if(home.imageQR)
        {
          setQrImageFileStr(home?.imageQR);
        }
        else
        {
          setQrImageFileStr(currentUser?.image_QR || "")
        }
        
      }
    }, [home]);

    // Reset form when modal closes
    const resetForm = useCallback(() => {
      setFormData({
        home_name: '',
        phone: '',
        address: '',
        electricity_price: '',
        water_price: '',
        service_price: '',
        junk_price: '',
        car_price: '',
        typeWater: '',
        numBank: '',
        nameBank: '',
        addressBank: '',
        imageQR: '',
      });
      setQrImageFile(null);
      setQrImageFileStr(null);
      setErrors({
        home_name: false,
        phone: false,
      });
    }, []);

    const isEdit: Boolean = useCallback(() => Boolean(home._id?.$oid), [home])();
    
    const handleClose = useCallback(() => {
      resetForm();
      onClose();
    }, [resetForm, onClose]);

    // Handle field change
    const handleFieldChange = useCallback((field: keyof typeof formData, value: string) => {
      setFormData(prev => ({ ...prev, [field]: value }));
      setErrors(prev => ({ ...prev, [field]: false }));
    }, []);

    // Handle QR file upload
    const handleQrFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        setQrImageFileStr(URL.createObjectURL(file));
        setQrImageFile(file);
      }
    }, []);

    const handleQrBoxClick = useCallback(() => {
      qrFileInputRef.current?.click();
    }, []);

    // Validation
    const validateForm = useCallback((): boolean => {
      const newErrors = {
        home_name: !formData.home_name.trim(),
        phone: !formData.phone.trim(),
      };

      setErrors(newErrors);

      const hasError = Object.values(newErrors).some(error => error);
      
      if (hasError) {
        if (newErrors.home_name) toast.error("Tên tòa nhà là bắt buộc");
        if (newErrors.phone) toast.error("Số điện thoại là bắt buộc");
      }

      return !hasError;
    }, [formData]);

    // Handle form submission
    const handleUpdate = useCallback(async () => {
      if (!validateForm()) return;
      let qrImageUrl = home?.imageQR || '';
      let qrPublicId = null;

      try {
        // Upload QR code lên Cloudinary nếu có file được chọn
        if (qrImageFile) {
          toast.info("Đang upload QR code...");
          
          try {
            const uploadResult = await uploadImage(
              qrImageFile,
              'qr_codes', // folder trên Cloudinary
              ['home_qr'] // tags
            );
            
            qrImageUrl = uploadResult.secure_url;
            qrPublicId = uploadResult.public_id;

            toast.success("Upload QR code thành công!");
            
            // Xóa QR code cũ nếu có
            if (home?.imageQR) {
              const oldPublicId = extractPublicId(home.imageQR);
              if (oldPublicId) {
                await deleteImage(oldPublicId);
              }
            }
          } catch (uploadError) {
            console.error('Failed to upload QR code:', uploadError);
            if (qrPublicId) {
              await deleteImage(qrPublicId);
            }
            toast.error("Lỗi upload QR code, nhưng thông tin khác đã được cập nhật");
          }
        }

        const payload = {
          pk: home?._id?.$oid || "",
          home_name: formData.home_name,
          phone: formData.phone,
          address: formData.address,
          electricity_price: formData.electricity_price,
          water_price: formData.water_price,
          service_price: formData.service_price,
          junk_price: formData.junk_price,
          car_price: formData.car_price,
          typeWater: formData.typeWater,
          numBank: formData.numBank,
          nameBank: formData.nameBank,
          addressBank: formData.addressBank,
          imageQR: qrImageUrl,
        };

        await updateHome(payload);
        
        toast.success(isEdit ? 'Cập nhật tòa nhà thành công' : 'Thêm tòa nhà thành công');
        
        // Refresh home list
        if (fetchHomes) {
          fetchHomes();
        }
        
        handleClose();
      } catch (error) {
        console.error('Failed to update home', error);
        toast.error("Lỗi cập nhật thông tin");
      }
    }, [validateForm, home, formData, qrImageFile, updateHome, handleClose, fetchHomes, isEdit, uploadImage, deleteImage, extractPublicId]);

    // Type water options
    const typeWaterOptions = useMemo(() => [
      { value: 'theo đồng hồ', label: 'Theo đồng hồ' },
      { value: 'theo đầu người', label: 'Theo đầu người' },
      { value: 'cố định', label: 'Cố định' }
    ], []);

    // Memoized QR URL
    const qrImageUrl = useMemo(() => {
      return qrImageFileStr || home?.imageQR || '';
    }, [qrImageFileStr, home?.imageQR]);

    return (
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto bg-white">
          <DialogHeader className='sticky top-0 bg-white'>
            <DialogTitle className="text-lg font-semibold text-gray-900">
              {isEdit ? 'Cập nhật thông tin tòa nhà' : 'Thêm mới tòa nhà'}
            </DialogTitle>
          </DialogHeader>

          <div className="py-6 px-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Cột 1 - Thông tin cơ bản */}
              <div className="space-y-6">
                <div>
                  <div className="flex items-center gap-2 mb-4 font-semibold text-gray-800 text-lg">
                    <KeenIcon icon="home" className="w-4 h-4 text-blue-400" />
                    Thông tin cơ bản
                  </div>
                  <div className="space-y-4">
                    <FormField
                      label="Tên tòa nhà"
                      value={formData.home_name}
                      onChange={(value) => handleFieldChange('home_name', value)}
                      error={errors.home_name}
                      required={true}
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

              {/* Cột 2 - Thông tin giá */}
              <div className="space-y-6">
                <div>
                  <div className="flex items-center gap-2 mb-4 font-semibold text-gray-800 text-lg">
                    <KeenIcon icon="dollar" className="w-4 h-4 text-green-400" />
                    Thông tin giá
                  </div>
                  <div className="space-y-4">
                    <FormField
                      label="Giá điện (VNĐ/kWh)"
                      value={formData.electricity_price}
                      onChange={(value) => handleFieldChange('electricity_price', value)}
                      type="number"
                      inputMode="numeric"
                    />
                    <FormField
                      label="Giá nước (VNĐ/m³)"
                      value={formData.water_price}
                      onChange={(value) => handleFieldChange('water_price', value)}
                      type="number"
                      inputMode="numeric"
                    />
                    <FormField
                      label="Phí dịch vụ (VNĐ)"
                      value={formData.service_price}
                      onChange={(value) => handleFieldChange('service_price', value)}
                      type="number"
                      inputMode="numeric"
                    />
                    <FormField
                      label="Phí rác (VNĐ)"
                      value={formData.junk_price}
                      onChange={(value) => handleFieldChange('junk_price', value)}
                      type="number"
                      inputMode="numeric"
                    />
                    <FormField
                      label="Phí xe (VNĐ)"
                      value={formData.car_price}
                      onChange={(value) => handleFieldChange('car_price', value)}
                      type="number"
                      inputMode="numeric"
                    />
                    <FormField
                      label="Loại tính nước"
                      value={formData.typeWater}
                      onChange={(value) => handleFieldChange('typeWater', value)}
                      type="select"
                      options={typeWaterOptions}
                    />
                  </div>
                </div>
              </div>

              {/* Cột 3 - Thông tin ngân hàng */}
              <div className="space-y-6">
                <div>
                  <div className="flex items-center gap-2 mb-4 font-semibold text-gray-800 text-lg">
                    <KeenIcon icon="bank" className="w-4 h-4 text-purple-400" />
                    Thông tin ngân hàng
                  </div>
                  <div className="space-y-4">
                    <FormField
                      label="Số tài khoản"
                      value={formData.numBank}
                      onChange={(value) => handleFieldChange('numBank', value)}
                    />
                    <FormField
                      label="Tên ngân hàng"
                      value={formData.nameBank}
                      onChange={(value) => handleFieldChange('nameBank', value)}
                    />
                    <FormField
                      label="Chi nhánh ngân hàng"
                      value={formData.addressBank}
                      onChange={(value) => handleFieldChange('addressBank', value)}
                    />
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-gray-700">
                        QR Code
                      </Label>
                      
                      {/* QR Code Upload */}
                      <div className="flex items-center gap-4">
                        <div 
                          className="image-input size-20 cursor-pointer" 
                          onClick={handleQrBoxClick}
                        >
                          <div className="image-input-placeholder rounded-lg border-2 border-gray-300 hover:border-primary transition-colors">
                            {qrImageUrl ? (
                              <img
                                src={qrImageUrl}
                                alt="QR Code"
                                className="h-full w-full object-cover rounded-lg"
                              />
                            ) : (
                              <div className="h-full w-full flex items-center justify-center bg-gray-100 rounded-lg">
                                <KeenIcon icon="qr-code" className="w-8 h-8 text-gray-400" />
                              </div>
                            )}
                            <input
                              type="file"
                              accept="image/*"
                              ref={qrFileInputRef}
                              className="hidden"
                              onChange={handleQrFileChange}
                            />
                            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-lg opacity-0 hover:opacity-100 transition-opacity">
                              <KeenIcon icon="camera" className="w-6 h-6 text-white" />
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex-1">
                          <p className="text-xs text-gray-500">
                            Click để upload QR code cho thanh toán
                          </p>
                          {qrImageFile && (
                            <p className="text-xs text-green-600 mt-1">
                              ✓ Đã chọn file: {qrImageFile.name}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-6 border-t border-gray-200 sticky bottom-0 bg-white">
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

ModalUpdateHome.displayName = 'ModalUpdateHome';

export { ModalUpdateHome }; 