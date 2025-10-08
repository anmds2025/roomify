import { forwardRef, useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { KeenIcon } from '@/components';
import { toast } from 'react-toastify';
import { useCloudinary } from '@/utils/Cloudinary';
import { useAuthContext, UserModel } from '@/auth';
import { toAbsoluteUrl } from '@/utils/Assets';
import { useUser } from '@/hooks/useUser';
import { CrudForm } from '@/components/common/CrudForm';
import { userFields } from '@/config/userFields';
import SignatureCanvas from 'react-signature-canvas';

interface ModalUpdateProfileProps {
  open: boolean;
  onClose: () => void;
  onDone: () => void;
  user: UserModel;
}

interface FormData {
  fullname: string;
  phone: string;
  email: string;
  address: string;
  cccd_code: string;
  cccd_address: string;
  cccd_day: string;
  signature: string;
}

interface FormErrors {
  fullname: boolean;
  phone: boolean;
  email: boolean;
  address: boolean;
  cccd_code: boolean;
  cccd_address: boolean;
  cccd_day: boolean;
}

const ModalUpdateProfile = forwardRef<HTMLDivElement, ModalUpdateProfileProps>(
  ({ open, onClose, user, onDone }, ref) => {
    const { updateProfileUser } = useUser();
    const { setCurrentUser } = useAuthContext();
    const { uploadImage, deleteImage, getAvatarUrl, extractPublicId } = useCloudinary();
    
    const fileInputRef = useRef<HTMLInputElement | null>(null);
    const fileQrInputRef = useRef<HTMLInputElement | null>(null);
    const signatureRef = useRef<SignatureCanvas>(null);

    // Form state
    const [formData, setFormData] = useState<FormData>({
      fullname: '',
      phone: '',
      email: '',
      address: '',
      cccd_code: '',
      cccd_address: '',
      cccd_day: '',
      signature: '',
    })

    // Avatar state
    const [avatarFile, setAvatarFile] = useState<File | null>(null);
    const [avatarFileStr, setAvatarFileStr] = useState<string | null>(user?.avatar || "");

    const [imageQRFile, setImageQRFile] = useState<File | null>(null);
    const [imageQRFileStr, setImageQRFileStr] = useState<string | null>(user?.image_QR || "");

    // Signature state
    const [showSignatureEditor, setShowSignatureEditor] = useState(false);

    // Error state
    const [errors, setErrors] = useState<FormErrors>({
      fullname: false,
      phone: false,
      email: false,
      address: false,
      cccd_code: false,
      cccd_address: false,
      cccd_day: false,
    });

    // Initialize form data when user changes
    useEffect(() => {
      if (user) {
        setFormData({
          fullname: user?.fullname || '',
          phone: user?.phone || '',
          email: user?.email || '',
          address: user?.address || '',
          cccd_code: user?.cccd_code || '',
          cccd_address: user?.cccd_address || '',
          cccd_day: user?.cccd_day || '',
          signature: (user as any)?.image_signature || '',
        });
        setAvatarFileStr(user?.avatar || "");
        setImageQRFileStr(user?.image_QR || "");
      }
    }, [user]);

    // Resize signature canvas when modal opens or signature editor is shown
    useEffect(() => {
      if (open && showSignatureEditor && signatureRef.current) {
        const resizeCanvas = () => {
          const canvas = signatureRef.current?.getCanvas();
          if (canvas) {
            const container = canvas.parentElement;
            if (container) {
              const containerWidth = container.clientWidth;
              const containerHeight = 180;
              
              // Set canvas size to match container
              canvas.width = containerWidth;
              canvas.height = containerHeight;
              
              // Update canvas style
              canvas.style.width = '100%';
              canvas.style.height = `${containerHeight}px`;
            }
          }
        };

        // Delay to ensure DOM is ready
        setTimeout(resizeCanvas, 100);
      }
    }, [open, showSignatureEditor]);

    // Reset form when modal closes
    const resetForm = useCallback(() => {
      setFormData({
        fullname: user?.fullname || '',
        phone: user?.phone || '',
        email: user?.email || '',
        address: user?.address || '',
        cccd_code: user?.cccd_code || '',
        cccd_address: user?.cccd_address || '',
        cccd_day: user?.cccd_day || '',
                  signature: (user as any)?.image_signature || '',
      });
      setAvatarFile(null);
      setImageQRFile(null);
      setErrors({
        fullname: false,
        phone: false,
        email: false,
        address: false,
        cccd_code: false,
        cccd_address: false,
        cccd_day: false,
      });
    }, []);

    const handleClose = useCallback(() => {
      resetForm();
      onClose();
    }, [resetForm, onClose]);

    const handleDone = useCallback(() => {
      resetForm();
      onDone();
    }, [resetForm, onDone]);

    // Validation
    const validateForm = useCallback((): boolean => {
      const newErrors: FormErrors = {
        fullname: !formData.fullname.trim(),
        phone: !formData.phone.trim(),
        email: !formData.email.trim(),
        address: !formData.address.trim(),
        cccd_code: !formData.cccd_code.trim(),
        cccd_address: !formData.cccd_address.trim(),
        cccd_day: !formData.cccd_day.trim(),
      };

      setErrors(newErrors);

      const hasError = Object.values(newErrors).some(error => error);
      
      if (hasError) {
        if (newErrors.fullname) toast.error("Họ tên là bắt buộc");
        if (newErrors.phone) toast.error("Số điện thoại là bắt buộc");
        if (newErrors.email) toast.error("Email là bắt buộc");
        if (newErrors.address) toast.error("Địa chỉ là bắt buộc");
        if (newErrors.cccd_code) toast.error("Số CCCD là bắt buộc");
        if (newErrors.cccd_address) toast.error("Địa chỉ CCCD là bắt buộc");
        if (newErrors.cccd_day) toast.error("Ngày cấp CCCD là bắt buộc");
      }

      return !hasError;
    }, [formData]);

    // Handle input change
    const handleInputChange = useCallback((field: keyof FormData, value: string) => {
      setFormData(prev => ({ ...prev, [field]: value }));
      setErrors(prev => ({ ...prev, [field]: false }));
    }, []);

    // Handle file upload
    const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        setAvatarFileStr(URL.createObjectURL(file));
        setAvatarFile(file);
      }
    }, []);

    const handleFileQRChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        setImageQRFileStr(URL.createObjectURL(file));
        setImageQRFile(file);
      }
    }, []);

    const handleBoxClick = useCallback(() => {
      fileInputRef.current?.click();
    }, []);

    const handleBoxClickQR = useCallback(() => {
      fileQrInputRef.current?.click();
    }, []);

    // Signature handling
    const handleSaveSignature = useCallback(() => {
      if (signatureRef.current) {
        const signatureData = signatureRef.current.toDataURL();
        setFormData(prev => ({ ...prev, signature: signatureData }));
        setShowSignatureEditor(false);
        toast.success("Chữ ký đã được lưu!");
      }
    }, []);

    const handleClearSignature = useCallback(() => {
      if (signatureRef.current) {
        signatureRef.current.clear();
      }
    }, []);



    // Convert base64 to blob
    const base64ToBlob = useCallback((base64: string, mimeType: string = 'image/png'): Blob => {
      const byteCharacters = atob(base64.split(',')[1]);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      return new Blob([byteArray], { type: mimeType });
    }, []);

    // Convert blob to file
    const blobToFile = useCallback((blob: Blob, fileName: string): File => {
      return new File([blob], fileName, { type: blob.type });
    }, []);

    // Handle form submission
    const handleUpdate = useCallback(async () => {
      if (!validateForm()) return;
      let avatarUrl = user.avatar || '';
      let avatarPublicId = null;
      let imageQRUrl = user.image_QR || '';
      let imageQRPublicId = null;
      let signatureUrl = (user as any)?.image_signature || '';
      let signaturePublicId = null;

      try {

        // Upload ảnh lên Cloudinary nếu có file được chọn
        if (avatarFile) {
          toast.info("Đang upload avatar...");
          try {
            const uploadResult = await uploadImage(
              avatarFile,
              'avatars', // folder trên Cloudinary
              ['user_avatar'] // tags
            );
            
            avatarUrl = uploadResult.secure_url;
            avatarPublicId = uploadResult.public_id;

            toast.success("Upload ảnh thành công!");
            
            // Xóa ảnh cũ nếu có (không phải ảnh mặc định)
            if (user.avatar && !user.avatar.includes('blank.png') && !user.avatar.includes('user-default.png')) {
              const oldPublicId = extractPublicId(user.avatar);
              if (oldPublicId) {
                await deleteImage(oldPublicId);
              }
            }
          } catch (uploadError) {
            console.error('Failed to upload avatar:', uploadError);
            if (avatarPublicId) {
              await deleteImage(avatarPublicId);
            }
            toast.error("Lỗi upload avatar, nhưng thông tin khác đã được cập nhật");
          }
        }

        if (imageQRFile) {
          toast.info("Đang upload image QR...");
          try {
            const uploadResult = await uploadImage(
              imageQRFile,
              'image_qr', // folder trên Cloudinary
              ['user_image_qr'] // tags
            );
            
            imageQRUrl = uploadResult.secure_url;
            imageQRPublicId = uploadResult.public_id;

            toast.success("Upload ảnh thành công!");
            
            // Xóa ảnh cũ nếu có (không phải ảnh mặc định)
            if (user.image_QR && !user.image_QR.includes('blank.png') && !user.image_QR.includes('user-default.png')) {
              const oldPublicId = extractPublicId(user.image_QR);
              if (oldPublicId) {
                await deleteImage(oldPublicId);
              }
            }
          } catch (uploadError) {
            console.error('Failed to upload image qr:', uploadError);
            if (imageQRPublicId) {
              await deleteImage(imageQRPublicId);
            }
            toast.error("Lỗi upload image qr, nhưng thông tin khác đã được cập nhật");
          }
        }

        // Handle signature changes
        if (formData.signature && formData.signature !== (user as any)?.image_signature) {
          // User has a new signature to upload
          toast.info("Đang upload chữ ký...");
          try {
            // Convert base64 signature to file
            const signatureBlob = base64ToBlob(formData.signature);
            const signatureFile = blobToFile(signatureBlob, `signature_${user._id.$oid}_${Date.now()}.png`);
            
            const uploadResult = await uploadImage(
              signatureFile,
              'signatures', // folder trên Cloudinary
              ['user_signature'] // tags
            );
            
            signatureUrl = uploadResult.secure_url;
            signaturePublicId = uploadResult.public_id;

            toast.success("Upload chữ ký thành công!");
            
            // Xóa chữ ký cũ nếu có
            if ((user as any)?.image_signature && (user as any).image_signature.includes('cloudinary')) {
              const oldPublicId = extractPublicId((user as any).image_signature);
              if (oldPublicId) {
                await deleteImage(oldPublicId);
              }
            }
          } catch (uploadError) {
            console.error('Failed to upload signature:', uploadError);
            if (signaturePublicId) {
              await deleteImage(signaturePublicId);
            }
            toast.error("Lỗi upload chữ ký, nhưng thông tin khác đã được cập nhật");
            // Keep the base64 signature as fallback
            signatureUrl = formData.signature;
          }
        } else {
          // Keep existing signature unchanged
          signatureUrl = (user as any)?.image_signature || '';
        }

        const payload = {
          pk: user._id.$oid,
          phone: formData.phone,
          fullname: formData.fullname,
          address: formData.address,
          cccd_code: formData.cccd_code,
          cccd_address: formData.cccd_address,
          cccd_day: formData.cccd_day,
          avatar: avatarUrl,
          image_QR: imageQRUrl,
          image_signature: signatureUrl
        };

        // Update profile through API
        const success = await updateProfileUser(payload);
        if (success) {
          // Update current user in AuthContext
          const updatedUser = {
            ...user,
            phone: formData.phone,
            fullname: formData.fullname,
            address: formData.address,
            cccd_code: formData.cccd_code,
            cccd_address: formData.cccd_address,
            cccd_day: formData.cccd_day,
            avatar: avatarUrl,
            image_QR: imageQRUrl,
            image_signature: signatureUrl
          };
          setCurrentUser(updatedUser);
          handleDone();
          setShowSignatureEditor(false)
        }
      } catch (error) {
        console.error('Failed to update Profile', error);
        toast.error('Có lỗi xảy ra khi cập nhật thông tin');
      }
    }, [validateForm, user, formData, imageQRFile, avatarFile, updateProfileUser, setCurrentUser, handleClose, uploadImage, deleteImage, extractPublicId]);

    // Format date for input
    const formatDateForInput = useCallback((isoString: string) => {
      if (!isoString) return '';
      return isoString.split('T')[0];
    }, []);

    // Memoized avatar URL
    const avatarUrl = useMemo(() => {
      return avatarFileStr || toAbsoluteUrl('media/avatars/blank.png');
    }, [avatarFileStr]);

    return (
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="max-w-5xl max-h-[95vh] overflow-y-auto bg-gradient-to-br from-white to-gray-50 border-0 shadow-2xl">
          <DialogHeader className="border-b border-gray-100">
            <DialogTitle className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent p-2">
              Cập nhật thông tin cá nhân
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-8">
            {/* Profile Images Section */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 bg-gradient-to-r from-green-100 to-emerald-100 rounded-lg flex items-center justify-center">
                  <KeenIcon icon="picture" className="text-green-600 text-lg" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Ảnh đại diện & QR Code</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Avatar Upload */}
                <div className="text-center space-y-4">
                  <label className="block text-sm font-medium text-gray-700 mb-3">Ảnh đại diện</label>
                  <div className="flex justify-center">
                    <div className="image-input size-24 cursor-pointer group" onClick={handleBoxClick}>
                      <div className="image-input-placeholder rounded-full border-3 border-dashed border-gray-300 hover:border-blue-500 transition-all duration-200 group-hover:scale-105">
                        <img
                          src={avatarUrl}
                          alt="avatar"
                          className="h-full w-full object-cover rounded-full"
                        />
                        <input
                          type="file"
                          accept="image/*"
                          ref={fileInputRef}
                          className="hidden"
                          onChange={handleFileChange}
                        />
                        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-200">
                          <KeenIcon icon="camera" className="w-7 h-7 text-white" />
                        </div>
                      </div>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500">Click để thay đổi ảnh đại diện</p>
                </div>

                {/* QR Code Upload */}
                <div className="text-center space-y-4">
                  <label className="block text-sm font-medium text-gray-700 mb-3">Mã QR</label>
                  <div className="flex justify-center">
                    <div className="image-input size-24 cursor-pointer group" onClick={handleBoxClickQR}>
                      <div className="image-input-placeholder rounded-lg border-3 border-dashed border-gray-300 hover:border-blue-500 transition-all duration-200 group-hover:scale-105 relative overflow-hidden">
                        {imageQRFileStr ? (
                          <img
                            src={imageQRFileStr}
                            alt="QR code"
                            className="h-full w-full object-cover rounded-lg"
                          />
                        ) : (
                          <div className="flex flex-col items-center justify-center h-full w-full text-gray-400">
                            <KeenIcon icon="qr-code" className="w-8 h-8 mb-2" />
                            <span className="text-xs">Tải QR</span>
                          </div>
                        )}
                        <input
                          type="file"
                          accept="image/*"
                          ref={fileQrInputRef}
                          className="hidden"
                          onChange={handleFileQRChange}
                        />
                        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-all duration-200 rounded-lg">
                          <KeenIcon icon="upload" className="w-7 h-7 text-white" />
                        </div>
                      </div>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500">Click để thay đổi mã QR</p>
                </div>
              </div>
            </div>

            {/* Signature Section */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 bg-gradient-to-r from-orange-100 to-yellow-100 rounded-lg flex items-center justify-center">
                  <KeenIcon icon="pencil" className="text-orange-600 text-lg" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900">Chữ ký điện tử</h3>
                  <p className="text-sm text-gray-500">Tùy chọn - Thêm chữ ký cá nhân của bạn</p>
                </div>
                                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setShowSignatureEditor(!showSignatureEditor)}
                      className="px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-all duration-200"
                    >
                      <KeenIcon icon={(formData.signature || (user as any)?.image_signature) ? "edit" : "plus"} className="w-4 h-4 mr-2" />
                      {(formData.signature || (user as any)?.image_signature) ? 'Chỉnh sửa' : 'Thêm chữ ký'}
                    </button>
                  </div>
              </div>

              {/* Current Signature Display */}
              {(formData.signature || (user as any)?.image_signature) && !showSignatureEditor && (
                <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-6 border border-gray-200">
                  <div className="text-center">
                    <p className="text-sm font-medium text-gray-700 mb-4">Chữ ký hiện tại</p>
                    <div className="bg-white rounded-lg p-4 border-2 border-dashed border-gray-300 inline-block">
                      <img 
                        src={formData.signature || (user as any)?.image_signature} 
                        alt="Chữ ký hiện tại" 
                        className="max-w-full h-20 object-contain"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* No Signature Message */}
              {!formData.signature && !(user as any)?.image_signature && !showSignatureEditor && (
                <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-6 border border-gray-200">
                  <div className="text-center">
                    <KeenIcon icon="pencil" className="text-gray-400 text-3xl mb-2" />
                    <p className="text-sm text-gray-500">Chưa có chữ ký</p>
                    <p className="text-xs text-gray-400 mt-1">Click "Thêm chữ ký" để tạo chữ ký mới</p>
                  </div>
                </div>
              )}

              {/* Signature Editor */}
              {showSignatureEditor && (
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200 space-y-4">
                  <div className="flex items-center gap-3 mb-4">
                    <KeenIcon icon="information-2" className="text-blue-600 text-lg" />
                    <div>
                      <p className="text-sm font-medium text-blue-900">Hướng dẫn ký tên</p>
                      <p className="text-xs text-blue-700">Sử dụng chuột hoặc ngón tay để vẽ chữ ký trong khung bên dưới</p>
                    </div>
                  </div>
                  
                  <div className="bg-white rounded-lg p-4 border-2 border-dashed border-blue-300">
                    <div className="signature-canvas-container" style={{ height: '180px' }}>
                      <SignatureCanvas
                        ref={signatureRef}
                        canvasProps={{
                          className: 'signature-canvas rounded-lg',
                          style: { width: '100%', height: '180px' }
                        }}
                        backgroundColor="white"
                        penColor="#1f2937"
                      />
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center pt-4">
                    <button
                      type="button"
                      onClick={handleClearSignature}
                      className="px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-all duration-200"
                    >
                      <KeenIcon icon="eraser" className="w-4 h-4 mr-2" />
                      Xóa và vẽ lại
                    </button>
                    <div className="flex gap-3">
                      <button
                        type="button"
                        onClick={() => setShowSignatureEditor(false)}
                        className="px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-all duration-200"
                      >
                        Hủy bỏ
                      </button>
                      <button
                        type="button"
                        onClick={handleSaveSignature}
                        className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg hover:from-blue-600 hover:to-indigo-700 transition-all duration-200 shadow-lg"
                      >
                        <KeenIcon icon="check" className="w-4 h-4 mr-2" />
                        Lưu chữ ký
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Personal Information Form */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 bg-gradient-to-r from-purple-100 to-pink-100 rounded-lg flex items-center justify-center">
                  <KeenIcon icon="user" className="text-purple-600 text-lg" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Thông tin cá nhân</h3>
                  <p className="text-sm text-gray-500">Cập nhật thông tin chi tiết của bạn</p>
                </div>
              </div>
              
              <div className='grid grid-cols-1 md:grid-cols-2 gap-3'>
                <CrudForm
                  fields={userFields}
                  values={formData}
                  errors={errors}
                  onChange={(key, value) => handleInputChange(key as keyof FormData, value)}
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-4 pt-8 border-t border-gray-200 bg-gray-50 py-6 rounded-b-xl">
            <button
              onClick={handleClose}
              className="px-6 py-3 text-sm font-medium text-gray-700 bg-white border-2 border-gray-300 rounded-lg hover:bg-gray-50 hover:border-gray-400 focus:outline-none focus:ring-4 focus:ring-gray-200 transition-all duration-200"
            >
              <KeenIcon icon="cross" className="w-4 h-4 mr-2" />
              Hủy bỏ
            </button>
            <button
              onClick={handleUpdate}
              className="px-6 py-3 text-sm font-medium text-white bg-gradient-to-r from-blue-500 to-indigo-600 border-2 border-transparent rounded-lg hover:from-blue-600 hover:to-indigo-700 focus:outline-none focus:ring-4 focus:ring-blue-200 transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              <KeenIcon icon="check" className="w-4 h-4 mr-2" />
              Cập nhật thông tin
            </button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }
);

ModalUpdateProfile.displayName = 'ModalUpdateProfile';

export { ModalUpdateProfile };
