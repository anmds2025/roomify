import React, { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSnackbar } from 'notistack';
import SignatureCanvas from 'react-signature-canvas';
import { KeenIcon } from '@/components';
import { IRoomData } from '@/pages/dashboards/light-sidebar/blocks/rooms/RoomsData';
import { signContract } from '@/api/contract';
import { useCloudinary } from '@/utils/Cloudinary';
import axios from 'axios';
import { createFormData, getStoredUser } from '@/api';



export const ContractSigningPage: React.FC = () => {
  const { contractId, roomId } = useParams<{ contractId: string; roomId: string }>();
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const { uploadImage, deleteImage, extractPublicId } = useCloudinary();
  
  const [room, setRoom] = useState<IRoomData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSigning, setIsSigning] = useState(false);
  const [showSuccessScreen, setShowSuccessScreen] = useState(false);
  
  const signatureRef = useRef<SignatureCanvas>(null);
  const [signatureError, setSignatureError] = useState<string>('');
  const APP_NAME = import.meta.env.VITE_APP_NAME ?? 'Roomify';
  const currentUser = getStoredUser();
  
  // Fetch room data when component mounts using roomId
  useEffect(() => {
    if (roomId) {
      const fetchRoomData = async () => {
        try {
          setIsLoading(true);
          const formData = createFormData({
            room_pk: roomId,
            token: currentUser?.token
          });
          
          const response = await axios.post(`${import.meta.env.VITE_APP_API_URL}/room/get`, formData);
          const data = response.data;

          if (data) {
            setRoom(data);
          } else {
            enqueueSnackbar('Không tìm thấy thông tin phòng', { variant: 'error' });
            setTimeout(() => window.close(), 2000);
          }
        } catch (error) {
          console.error('Failed to fetch room data:', error);
          enqueueSnackbar('Lỗi khi tải thông tin phòng', { variant: 'error' });
          setTimeout(() => window.close(), 2000);
        } finally {
          setIsLoading(false);
        }
      };

      fetchRoomData();
    }
  }, [roomId, enqueueSnackbar, currentUser?.token]);

  // Resize signature canvas when component mounts
  useEffect(() => {
    if (signatureRef.current) {
      const resizeCanvas = () => {
        const canvas = signatureRef.current?.getCanvas();
        if (canvas) {
          const container = canvas.parentElement;
          if (container) {
            const containerWidth = container.clientWidth;
            const containerHeight = 200;
            
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
      
      // Add resize listener
      window.addEventListener('resize', resizeCanvas);
      return () => window.removeEventListener('resize', resizeCanvas);
    }
  }, [room]);



  const clearSignature = () => {
    if (signatureRef.current) {
      signatureRef.current.clear();
      setSignatureError('');
    }
  };

  // Convert base64 to blob
  const base64ToBlob = (base64: string, mimeType: string = 'image/png'): Blob => {
    const byteCharacters = atob(base64.split(',')[1]);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    return new Blob([byteArray], { type: mimeType });
  };

  // Convert blob to file
  const blobToFile = (blob: Blob, fileName: string): File => {
    return new File([blob], fileName, { type: blob.type });
  };

  const handleSave = async () => {
    if (!signatureRef.current || !contractId) return;

    // Chỉ kiểm tra chữ ký
    if (signatureRef.current.isEmpty()) {
      setSignatureError('Vui lòng ký tên để xác nhận thuê phòng');
      return;
    }

    setIsSigning(true);
    let signatureUrl = '';

    try {
      const signatureData = signatureRef.current.toDataURL();
      
      // Upload signature to Cloudinary
      enqueueSnackbar('Đang upload chữ ký...', { variant: 'info' });
      
      try {
        // Convert base64 signature to file
        const signatureBlob = base64ToBlob(signatureData);
        const signatureFile = blobToFile(signatureBlob, `contract_signature_${contractId}_${Date.now()}.png`);
        
        const uploadResult = await uploadImage(
          signatureFile,
          'contract_signatures', // folder trên Cloudinary
          ['contract_signature'] // tags
        );
        
        signatureUrl = uploadResult.secure_url;
        enqueueSnackbar('Upload chữ ký thành công!', { variant: 'success' });
      } catch (uploadError) {
        console.error('Failed to upload signature:', uploadError);
        enqueueSnackbar('Lỗi upload chữ ký, sử dụng chữ ký base64', { variant: 'warning' });
        // Fallback to base64 if upload fails
        signatureUrl = signatureData;
      }

      // Sign contract using API - contractId is the actual contract ID
      enqueueSnackbar('Đang ký hợp đồng...', { variant: 'info' });
      try {
        await signContract(contractId, signatureUrl); // contractId = contract.pk, not room.pk
        enqueueSnackbar('Cảm ơn bạn đã ký hợp đồng thành công!', { variant: 'success' });
      } catch (error: any) {
        if (error.message.includes('chưa có chữ ký')) {
          enqueueSnackbar(error.message, { 
            variant: 'error',
            autoHideDuration: 5000 // Show longer for this important message
          });
          return; // Don't proceed with cleanup or page close
        }
        throw error; // Re-throw other errors to be handled by outer catch
      }
      // Show success screen instead of closing window
      setShowSuccessScreen(true);
    } catch (error : any) {
      console.error('Failed to sign contract:', error);
      enqueueSnackbar(error.response.data.Error || 'Có lỗi xảy ra khi ký hợp đồng. Vui lòng thử lại.', { variant: 'error' });
      
      // Clean up uploaded signature if contract signing failed
      if (signatureUrl && signatureUrl.includes('cloudinary')) {
        try {
          const publicId = extractPublicId(signatureUrl);
          if (publicId) {
            await deleteImage(publicId);
          }
        } catch (cleanupError) {
          console.error('Failed to cleanup signature:', cleanupError);
        }
      }
    } finally {
      setIsSigning(false);
    }
  };

  const handleCancel = () => {
    navigate(-1); // Go back to previous page
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Đang tải thông tin phòng...</p>
        </div>
      </div>
    );
  }

  if (!room) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <KeenIcon icon="information-2" className="text-6xl text-gray-400 mb-4" />
          <h2 className="text-xl font-semibold text-gray-600 mb-2">Không tìm thấy phòng</h2>
          <button
            onClick={() => window.close()}
            className="btn btn-primary"
          >
            Đóng trang
          </button>
        </div>
      </div>
    );
  }

  if (showSuccessScreen) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 flex items-center justify-center mx-auto">
        <div className="bg-white rounded-3xl shadow-2xl p-12 max-w-2xl mx-4 text-center">
          {/* Success Icon */}
          <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full mb-8 shadow-lg">
            <KeenIcon icon="check-circle" className="text-white text-4xl" />
          </div>
          
          {/* Success Message */}
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Ký hợp đồng thành công!
          </h1>
          <p className="text-xl text-gray-600 mb-8 leading-relaxed">
            Cảm ơn bạn đã hoàn tất thủ tục ký hợp đồng thuê phòng. 
            Chúng tôi sẽ liên hệ với bạn trong thời gian sớm nhất.
          </p>
          
          {/* Room Info */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-xl border border-blue-100 mb-8">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">Thông tin phòng đã ký:</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
              <div>
                <p className="text-sm text-gray-600">Tên phòng:</p>
                <p className="font-semibold text-gray-900">{room.room_name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Địa chỉ:</p>
                <p className="font-semibold text-gray-900">{room.address}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Giá thuê:</p>
                <p className="font-semibold text-gray-900">{room.price?.toLocaleString('vi-VN')} VNĐ/tháng</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Diện tích:</p>
                <p className="font-semibold text-gray-900">{room.size} m²</p>
              </div>
            </div>
          </div>
          
          {/* Action Buttons */}
          {/* <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => window.close()}
              className="px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              Đóng trang
            </button>
            <button
              onClick={() => setShowSuccessScreen(false)}
              className="px-8 py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-xl hover:border-gray-400 hover:bg-gray-50 transition-all duration-200"
            >
              Quay lại
            </button>
          </div> */}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 mx-auto">
      {/* Professional Header */}
      <div className="bg-white shadow-lg border-b border-gray-200">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                <KeenIcon icon="home-2" className="text-white text-xl" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                  {APP_NAME}
                </h1>
                <p className="text-sm text-gray-600 font-medium">Hệ thống quản lý cho thuê phòng trọ</p>
              </div>
            </div>
            <button
              onClick={handleCancel}
              className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-all duration-200"
            >
              <KeenIcon icon="cross" className="text-lg" />
              <span className="hidden sm:inline">Đóng</span>
            </button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Welcome Section */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full mb-4 shadow-lg">
            <KeenIcon icon="document" className="text-white text-2xl" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-3">
            Hợp đồng thuê phòng
          </h2>
          <p className="text-lg text-gray-600 mb-2">
            Phòng: <span className="font-bold text-blue-600">{room.room_name}</span>
          </p>
          <p className="text-gray-500 max-w-2xl mx-auto">
            Chúng tôi rất vui được chào đón bạn. Vui lòng điền đầy đủ thông tin bên dưới và ký tên để hoàn tất thủ tục thuê phòng.
          </p>
          
          {/* Progress Steps */}
          <div className="flex items-center justify-center gap-4 mt-8 mb-8">
            <div className="flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-full">
              <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold">1</div>
              <span className="text-sm font-medium">Xem thông tin phòng</span>
            </div>
            <div className="w-8 h-0.5 bg-gray-300"></div>
            <div className="flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-full">
              <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold">2</div>
              <span className="text-sm font-medium">Ký xác nhận</span>
            </div>
          </div>
        </div>

      {/* Main Content */}
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 contract-form">
        {/* Thông tin phòng */}
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
              <KeenIcon icon="home-2" className="text-blue-600 text-lg" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900">Thông tin phòng</h3>
          </div>
          
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-xl border border-blue-100">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <KeenIcon icon="home-2" className="text-blue-600" />
                  <div>
                    <p className="text-sm text-gray-500">Tên phòng</p>
                    <p className="font-semibold text-gray-900">{room.room_name}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <KeenIcon icon="geolocation" className="text-blue-600" />
                  <div>
                    <p className="text-sm text-gray-500">Địa chỉ</p>
                    <p className="font-semibold text-gray-900">{room.address}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <KeenIcon icon="abstract-26" className="text-blue-600" />
                  <div>
                    <p className="text-sm text-gray-500">Diện tích</p>
                    <p className="font-semibold text-gray-900">{room.size}m²</p>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <KeenIcon icon="dollar" className="text-green-600" />
                  <div>
                    <p className="text-sm text-gray-500">Giá thuê</p>
                    <p className="font-bold text-green-600 text-lg">{room.price?.toLocaleString('vi-VN')} VNĐ/tháng</p>
                  </div>
                </div>
                {room.home_name && (
                  <div className="flex items-center gap-3">
                    <KeenIcon icon="home-3" className="text-blue-600" />
                    <div>
                      <p className="text-sm text-gray-500">Tòa nhà</p>
                      <p className="font-semibold text-gray-900">{room.home_name}</p>
                    </div>
                  </div>
                )}
                <div className="flex items-center gap-3">
                  <KeenIcon icon="check-circle" className="text-green-600" />
                  <div>
                    <p className="text-sm text-gray-500">Trạng thái</p>
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                      <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                      {room.status}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>



        {/* Khu vực ký tên */}
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
              <KeenIcon icon="pencil" className="text-orange-600 text-lg" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900">Xác nhận thuê phòng</h3>
          </div>
          
          <div className="bg-gradient-to-r from-orange-50 to-yellow-50 p-6 rounded-xl border border-orange-100">
            {/* Signature Instructions */}
            <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-start gap-3">
                <KeenIcon icon="information-2" className="text-blue-600 text-xl mt-0.5" />
                <div>
                  <h4 className="font-semibold text-blue-900 mb-2">Hướng dẫn:</h4>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• Ký tên trong khung bên dưới để xác nhận thuê phòng</li>
                    <li>• Có thể sử dụng chuột hoặc ngón tay để ký</li>
                    <li>• Chữ ký sẽ được gửi cho chủ trọ</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Signature Canvas */}
            <div className="relative">
              <div className="absolute top-4 right-4 z-10">
                <button
                  type="button"
                  onClick={clearSignature}
                  className="flex items-center gap-2 px-3 py-2 bg-white bg-opacity-90 text-gray-600 hover:text-gray-800 hover:bg-opacity-100 rounded-lg shadow-sm transition-all duration-200"
                >
                  <KeenIcon icon="eraser" className="text-sm" />
                  <span className="text-sm font-medium">Xóa</span>
                </button>
              </div>
              
              <div className="bg-white rounded-xl border-2 border-dashed border-gray-300 hover:border-orange-400 transition-colors duration-200 overflow-hidden">
                <div className="signature-canvas-container" style={{ height: '200px' }}>
                  <SignatureCanvas
                    ref={signatureRef}
                    canvasProps={{
                      className: 'signature-canvas bg-white',
                      style: { width: '100%', height: '200px' }
                    }}
                    backgroundColor="white"
                    penColor="#1f2937"
                    onEnd={() => setSignatureError('')}
                  />
                </div>
                
                {/* Signature Placeholder */}
                {/* <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="text-gray-400 text-center">
                    <KeenIcon icon="pencil" className="text-3xl mb-2 opacity-50" />
                    <p className="text-sm font-medium">Ký tên tại đây</p>
                  </div>
                </div> */}
              </div>
            </div>
            
            {signatureError && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center gap-2">
                  <KeenIcon icon="information" className="text-red-600" />
                  <p className="text-red-700 text-sm font-medium">{signatureError}</p>
                </div>
              </div>
            )}
            
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <div className="flex items-start gap-3">
                <KeenIcon icon="shield-check" className="text-green-600 text-lg mt-0.5" />
                <div className="text-sm text-gray-700">
                  <p className="font-medium text-gray-900 mb-1">Xác nhận:</p>
                  <p>Bằng việc ký tên, tôi xác nhận muốn thuê phòng với thông tin đã hiển thị ở trên.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 pt-8 border-t border-gray-200">
          <button
            type="button"
            onClick={handleCancel}
            className="flex items-center justify-center gap-2 px-6 py-3 text-gray-700 bg-gray-100 hover:bg-gray-200 border border-gray-300 rounded-xl font-semibold transition-all duration-200 hover:scale-105"
          >
            <KeenIcon icon="arrow-left" className="text-lg" />
            Hủy bỏ
          </button>
          
          <button
            type="button"
            onClick={handleSave}
            disabled={isSigning}
            className={`flex items-center justify-center gap-2 px-8 py-3 text-white rounded-xl font-bold shadow-lg transition-all duration-200 flex-1 ${
              isSigning 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 hover:shadow-xl hover:scale-105'
            }`}
          >
            {isSigning ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                Đang ký hợp đồng...
              </>
            ) : (
              <>
                <KeenIcon icon="check-circle" className="text-lg" />
                Xác nhận thuê phòng
              </>
            )}
          </button>
        </div>
        
        {/* Footer Note */}
        <div className="mt-8 p-4 bg-blue-50 rounded-xl border border-blue-200">
          <div className="flex items-start gap-3">
            <KeenIcon icon="information-2" className="text-blue-600 text-lg mt-0.5" />
            <div className="text-sm text-blue-800">
              <p className="font-semibold mb-1">Lưu ý:</p>
              <p>Sau khi ký xác nhận, chủ trọ sẽ liên hệ với bạn để thực hiện các thủ tục tiếp theo.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  );
}; 