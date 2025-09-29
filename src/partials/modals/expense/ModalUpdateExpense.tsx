import React, { forwardRef, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { KeenIcon } from '@/components';
import { toast } from 'react-toastify';
import { ModalUpdateExpenseProps } from '@/api/expense';
import { useExpense } from '@/hooks/useExpense';
import { IOption, useAuthContext } from '@/auth';
import { useCloudinary } from '@/utils';

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

const ModalUpdateExpense = forwardRef<HTMLDivElement, ModalUpdateExpenseProps>(
  ({ open, onClose, expense, fetchExpense, homeData }, ref) => {
    const { createExpense, updateExpense } = useExpense();
    const { currentUser } = useAuthContext();
    const { uploadImage, deleteImage, extractPublicId } = useCloudinary();
    const qrFileInputRef = useRef<HTMLInputElement | null>(null);
    const [homeOptions, setHomeOptions] = useState<IOption[]>([]);
    // Form state
    const [formData, setFormData] = useState({
      title: '',
      total: 0,
      month: '',
      home_pk: '',
      image: ''
    });

    const [qrImageFile, setQrImageFile] = useState<File | null>(null);
    const [qrImageFileStr, setQrImageFileStr] = useState<string | null>(null);

    // Error state
    const [errors, setErrors] = useState({
      title: false,
      total: false,
      month: false,
      home_pk: false,
    });

    // Initialize form data when user changes
    useEffect(() => {
      if (expense) {
        setFormData({
          title: expense?.title || '',
          total: expense?.total || 0,
          month: expense?.month || '',
          home_pk: expense?.home_pk || '',
          image: expense?.image || '',
        });
        if(expense.image)
        {
          setQrImageFileStr(expense?.image);
        }
        else
        {
          setQrImageFileStr("")
        }
      }
    }, [expense]);

    useEffect(() => {
      const options = homeData.map((home) => {
        return {
          label: home.home_name,
          value: home._id?.$oid
        } as IOption
      });
      setHomeOptions(options);
    }, [homeData]);

    // Reset form when modal closes
    const resetForm = useCallback(() => {
      setFormData({
        title: '',
        total: 0,
        month: '',
        home_pk: '',
        image: ''
      });
      setQrImageFile(null);
      setQrImageFileStr(null);
      setErrors({
        title: false,
        total: false,
        month: false,
        home_pk: false,
      });
    }, []);

    
    const isEdit: Boolean = useCallback(() => Boolean(expense._id), [expense])();
    
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
         title: !formData.title.trim(),
         total: formData.total == 0,
         month: !formData.month.trim(),
         home_pk: !formData.home_pk.trim()
       };

      setErrors(newErrors);

      const hasError = Object.values(newErrors).some(error => error);
      
      if (hasError) {
        if (newErrors.title) toast.error("Tiêu đề là bắt buộc");
        if (newErrors.total) toast.error("Số tiền là bắt buộc");
        if (newErrors.month) toast.error("Tháng là bắt buộc");
        if (newErrors.home_pk) toast.error("Tòa nhà là bắt buộc");
      }
      return !hasError;
    }, [formData]);

    // Handle form submission
    const handleUpdate = useCallback(async () => {
      if (!validateForm()) return;
      let qrImageUrl = expense?.image || '';
      let qrPublicId = null;

      try {
        if (qrImageFile) {
          toast.info("Đang upload ảnh...");
          
          try {
            const uploadResult = await uploadImage(
              qrImageFile,
              'expense', // folder trên Cloudinary
              ['expense_image'] // tags
            );
            
            qrImageUrl = uploadResult.secure_url;
            qrPublicId = uploadResult.public_id;

            toast.success("Upload ảnh thành công!");
            
            // Xóa ảnh cũ nếu có
            if (expense?.image) {
              const oldPublicId = extractPublicId(expense.image);
              if (oldPublicId) {
                await deleteImage(oldPublicId);
              }
            }
          } catch (uploadError) {
            console.error('Failed to upload ảnh:', uploadError);
            if (qrPublicId) {
              await deleteImage(qrPublicId);
            }
            toast.error("Lỗi upload ảnh, nhưng thông tin khác đã được cập nhật");
          }
        }
        const payload = {
          pk: expense?._id?.$oid || "",
          user_pk : currentUser?._id.$oid || '',
          title: formData.title,
          total: formData.total,
          month: formData.month,
          home_pk: formData.home_pk,
          image: qrImageUrl
        };

        if(isEdit) {
          await updateExpense(payload);
        } else {
          await createExpense(payload);
        }
        
        handleClose();
        
        if (fetchExpense) {
          fetchExpense();
        }
      } catch (error) {
        console.error('Failed to update expense', error);
        toast.error("Lỗi cập nhật thông tin");
      }
    }, [validateForm, expense, formData, updateExpense, handleClose, fetchExpense, isEdit, createExpense, qrImageFile]);

    const generateMonthOptions = () => {
      const options = [];
      const now = new Date();
      for (let i = 0; i < 12; i++) {
        const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const value = `${date.getMonth() + 1}/${date.getFullYear()}`; // Match API format
        const label = `${date.getMonth() + 1}/${date.getFullYear()}`;
        options.push({ value, label });
      }
      return options;
    };

    const handleQrBoxClick = useCallback(() => {
      qrFileInputRef.current?.click();
    }, []);

    const qrImageUrl = useMemo(() => {
      return qrImageFileStr || expense?.image || '';
    }, [qrImageFileStr, expense?.image]);

    const handleQrFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        setQrImageFileStr(URL.createObjectURL(file));
        setQrImageFile(file);
      }
    }, []);

    return (
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-white dark:bg-gray-900">
          <DialogHeader className="sticky top-0 bg-white dark:bg-gray-900">
            <DialogTitle className="text-lg font-semibold text-gray-900 dark:text-gray-100 p-2">
              {isEdit ? 'Cập nhật thông tin chi phí' : 'Thêm mới chi phí'}
            </DialogTitle>
          </DialogHeader>

          <div className="py-6 px-6">
              <div className="space-y-6">
              {/* Cột trái - Thông tin cơ bản */}
              <div className="space-y-8">
                <div>
                  <div className="flex items-center gap-2 mb-4 font-semibold text-gray-800 text-lg dark:text-black">
                    <KeenIcon icon="user" className="w-4 h-4 text-blue-400 dark:text-black" />
                    Thông tin cơ bản
                  </div>
                  <div className="space-y-5">
                    <FormField
                      label="Tiêu đề"
                      value={formData.title}
                      onChange={(value) => handleFieldChange('title', value)}
                      error={errors.title}
                      required={true}
                    />
                    <FormField
                      label="Tháng"
                      value={formData.month}
                      onChange={(value) => handleFieldChange("month", value)}
                      error={errors.month}
                      required={true}
                      type="select"
                      options={[
                        { label: "Tất cả tháng", value: "All" },
                        ...generateMonthOptions() 
                      ]}
                    />
                    <FormField
                      label="Số tiền"
                      value={formData.total.toString()}
                      onChange={(value) => handleFieldChange('total', value)}
                      type="number"
                      error={errors.total}
                      required={true}
                    />
                    <FormField
                      label="Chọn nhà"
                      value={formData.home_pk}
                      onChange={(value) => handleFieldChange("home_pk", value)}
                      error={errors.home_pk}
                      required={true}
                      type="select"
                      options={homeOptions.map((t) => ({
                        value: t.value.toString(),
                        label: t.label,
                      }))}
                    />
                    <div className="flex items-center gap-4">
                      <div 
                        className="image-input size-48 cursor-pointer" 
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
                          Click để upload ảnh cho chi phí
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

ModalUpdateExpense.displayName = 'ModalUpdateExpense';

export { ModalUpdateExpense };