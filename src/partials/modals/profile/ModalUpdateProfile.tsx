import { forwardRef, useEffect, useRef, useState } from 'react';
import { Modal, ModalContent, ModalBody, ModalHeader } from '@/components/modal';
import { KeenIcon } from '@/components';
import { toast } from 'react-toastify';
import { useSnackbar } from 'notistack';
import useS3Uploader from '@/hooks/useS3Uploader';
import { User } from '@auth0/auth0-spa-js';
import { useAuthContext, UserModel } from '@/auth';
import { toAbsoluteUrl } from '@/utils/Assets';
import { useUser } from '@/hooks/useUser';
import { position } from 'stylis';

interface ModalUpdateProfileProps {
  open: boolean;
  onClose: () => void;
  user: UserModel
}


const ModalUpdateProfile = forwardRef<HTMLDivElement, ModalUpdateProfileProps>(
  ({ open, onClose, user }, ref) => {
  const { enqueueSnackbar } = useSnackbar();

  // const { updateUser } = useUser();
  // const [inputLastName, setInputLastName] = useState<string>('');
  // const [inputFirstName, setInputFirstName] = useState<string>('');
  // const [inputBirthday, setInputBirthday] = useState<string>('');
  // const [inputPhone, setInputPhone] = useState<string>('');
  // const { uploadFileToS3 } = useS3Uploader();
  // const [imageFile, setImageFile] = useState<File | null>(null);
  // const [imageFileStr, setImageFileStr] = useState<string | null>(null);
  // const [imageUrl, setImageUrl] = useState<string | null>(null);
  // const fileInputRef = useRef<HTMLInputElement | null>(null);

  // const [isError, setIsError] = useState({
  //   first_name: false,
  //   last_name: false,
  //   phone: false,
  //   birthday: false,
  // });


  // useEffect(() => {
  //   setInputLastName(user?.last_name || "")
  //   setInputFirstName(user?.first_name || "")
  //   setInputBirthday(user?.birthday || "")
  //   setInputPhone(user?.phone_number || "")
  //   setImageFileStr(user?.avatar || "");
  // }, [user]);

  // const validateFields = () => {
  //   const errors = {
  //     first_name: !inputFirstName.trim(),
  //     last_name: !inputLastName.trim(),
  //     birthday: !inputBirthday.trim(),
  //     phone: !inputPhone.trim(),
  //   };

  //   setIsError(errors);

  //   const hasError = Object.values(errors).some((error) => error);
  //   if (hasError) {
  //     if (errors.first_name) toast.error("Tên là bắt buộc");
  //     if (errors.last_name) toast.error("Họ là bắt buộc");
  //     if (errors.birthday) toast.error("Ngày sinh là bắt buộc");
  //     if (errors.phone) toast.error("Số điện thoại là bắt buộc");
  //   }
  //   return !hasError;
  // };

  // const handleClose = () => {
  //   setInputLastName('');
  //   setInputFirstName('');
  //   setInputPhone('');
  //   setInputBirthday('');
  //   setIsError({
  //     first_name: false,
  //     last_name: false,
  //     phone: false,
  //     birthday: false
  //   })
  //   onClose();
  // };

  // const handleInputChange = (
  //   field: "first_name" | "last_name" | "phone" | "birthday",
  //   value: any
  // ) => {
  //   switch (field) {
  //     case "first_name":
  //       setInputFirstName(value);
  //       break;
  //     case "last_name":
  //       setInputLastName(value);
  //       break;
  //     case "phone":
  //       setInputPhone(value);
  //       break;
  //     case "birthday":
  //       setInputBirthday(value);
  //       break;
  //   }
  //   setIsError((prev) => ({ ...prev, [field]: false })); 
  // };

  // const handleUpdate = async () => {
  //   if (validateFields()) {
  //     try {
  //       let  urlImage = user?.avatar || "miss-url"
  //       if (imageFile) {
  //         try {
  //           urlImage = await uploadFileToS3(imageFile);
  //           setImageUrl(urlImage)
  //         } catch (error) {
  //           console.error("Error uploading file:", error);
  //         }
  //       } else {
  //         console.log("No file selected.");
  //       }
  //       await updateUser({ 
  //         id: user?.id,
  //         email: user?.email, 
  //         first_name: inputFirstName, 
  //         last_name: inputLastName,
  //         avatar: urlImage,
  //         position: user?.position,
  //         birthday: inputBirthday,
  //         phone_number: inputPhone
  //       });
  //       loadData()
  //     } catch (error) {
  //       console.error('Failed to update Profile', error);
  //     }
  //   }
  // };

  // const loadData = () => {
  //   setTimeout(() => {
  //     window.location.reload();
  //   }, 500); 
  // };

  // const handleBoxClick = () => {
  //   if (fileInputRef.current) {
  //     fileInputRef.current.click(); // Mở hộp thoại chọn file
  //   }
  // };

  // const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
  //   const uploadedFile = e.target.files?.[0]; // Lấy file đầu tiên
  //   if (uploadedFile) {
  //       setImageFileStr(URL.createObjectURL(uploadedFile));
  //       setImageFile(uploadedFile);
  //       setIsError((prev) => ({ ...prev, image: false })); // Clear error
  //   }
  // };

  // const formatDateForInput = (isoString : string) => {
  //   if (!isoString) return '';
  //   return isoString.split('T')[0]; // lấy phần trước "T"
  // };

  // const days = Array.from({ length: 31 }, (_, i) => i + 1);
  // const months = Array.from({ length: 12 }, (_, i) => i + 1);
  // const years = Array.from({ length: 100 }, (_, i) => new Date().getFullYear() - i);

  return (
    <>
    {/* <Modal open={open} onClose={handleClose}>
      <ModalContent className="max-w-[600px] top-[10%]">
        <ModalHeader className="py-4 px-5">
          <div className="text-[#1A2B49] text-lg font-semibold">Cập nhật thông tin</div>
          <button className="btn btn-sm btn-icon btn-light btn-clear shrink-0" onClick={handleClose}>
            <KeenIcon icon="cross" />
          </button>
        </ModalHeader>
        <ModalBody className="py-4 px-5">
          <div className='w-full flex justify-center relative'>
            <div className="image-input size-16" onClick={handleBoxClick}>
              <div
                className="image-input-placeholder rounded-full border-2 border-success image-input-empty:border-gray-300"
                style={{ backgroundImage: `url(${toAbsoluteUrl(`/media/avatars/blank.png`)})` }}
              >
                <img
                  src={imageFileStr || toAbsoluteUrl(`/media/avatars/blank.png`)}
                  alt="avatar"
                  className="h-full object-cover rounded-full"
                  height={60}
                  width={60}
                />
                <input
                  id="file-upload"
                  type="file"
                  accept="image/*"
                  ref={fileInputRef}
                  className="hidden"
                  onChange={handleFileChange}
                />

                <div className="flex items-center justify-center cursor-pointer h-5 left-0 right-0 bottom-0 bg-dark-clarity absolute">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="14"
                    height="12"
                    viewBox="0 0 14 12"
                    className="fill-light opacity-80"
                  >
                    <path
                      d="M11.6665 2.64585H11.2232C11.0873 2.64749 10.9538 2.61053 10.8382 2.53928C10.7225 2.46803 10.6295 2.36541 10.5698 2.24335L10.0448 1.19918C9.91266 0.931853 9.70808 0.707007 9.45438 0.550249C9.20068 0.393491 8.90806 0.311121 8.60984 0.312517H5.38984C5.09162 0.311121 4.799 0.393491 4.5453 0.550249C4.2916 0.707007 4.08701 0.931853 3.95484 1.19918L3.42984 2.24335C3.37021 2.36541 3.27716 2.46803 3.1615 2.53928C3.04584 2.61053 2.91234 2.64749 2.7765 2.64585H2.33317C1.90772 2.64585 1.49969 2.81486 1.19885 3.1157C0.898014 3.41654 0.729004 3.82457 0.729004 4.25002V10.0834C0.729004 10.5088 0.898014 10.9168 1.19885 11.2177C1.49969 11.5185 1.90772 11.6875 2.33317 11.6875H11.6665C12.092 11.6875 12.5 11.5185 12.8008 11.2177C13.1017 10.9168 13.2707 10.5088 13.2707 10.0834V4.25002C13.2707 3.82457 13.1017 3.41654 12.8008 3.1157C12.5 2.81486 12.092 2.64585 11.6665 2.64585ZM6.99984 9.64585C6.39413 9.64585 5.80203 9.46624 5.2984 9.12973C4.79478 8.79321 4.40225 8.31492 4.17046 7.75532C3.93866 7.19572 3.87802 6.57995 3.99618 5.98589C4.11435 5.39182 4.40602 4.84613 4.83432 4.41784C5.26262 3.98954 5.80831 3.69786 6.40237 3.5797C6.99644 3.46153 7.61221 3.52218 8.1718 3.75397C8.7314 3.98576 9.2097 4.37829 9.54621 4.88192C9.88272 5.38554 10.0623 5.97765 10.0623 6.58335C10.0608 7.3951 9.73765 8.17317 9.16365 8.74716C8.58965 9.32116 7.81159 9.64431 6.99984 9.64585Z"
                      fill=""
                    />
                    <path
                      d="M7 8.77087C8.20812 8.77087 9.1875 7.7915 9.1875 6.58337C9.1875 5.37525 8.20812 4.39587 7 4.39587C5.79188 4.39587 4.8125 5.37525 4.8125 6.58337C4.8125 7.7915 5.79188 8.77087 7 8.77087Z"
                      fill=""
                    />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          <div className="text-sm text-[#1A2B49] mt-4">Họ</div>
          <div className="flex gap-2">
            <div className="input w-full text-sm mt-1" style={{borderColor : isError.last_name ? "red" : "#F4F4F4"}}>
              <input
                style={{ color: '#1A2B49', padding: '0.5rem 0', fontWeight: 600 }}
                type="text"
                value={inputLastName}
                onChange={(e) => handleInputChange("last_name", e.target.value)} 
              />
            </div>
          </div>

          <div className="text-sm text-[#1A2B49] mt-4">Tên</div>
          <div className="flex gap-2">
            <div className="input w-full text-sm mt-1" style={{borderColor : isError.first_name ? "red" : "#F4F4F4"}}>
              <input
                style={{ color: '#1A2B49', padding: '0.5rem 0', fontWeight: 600 }}
                type="text"
                value={inputFirstName}
                onChange={(e) => handleInputChange("first_name", e.target.value)} 
              />
            </div>
          </div>

          <div className="text-sm text-[#1A2B49] mt-4">Ngày sinh</div>
          <div className="flex gap-2">
            <div
              className="input w-full text-sm mt-1"
              style={{ borderColor: isError.birthday ? "red" : "#F4F4F4" }}
            >
              <input
                type="date"
                value={formatDateForInput(inputBirthday)}
                onChange={(e) => handleInputChange("birthday", e.target.value)}
                style={{
                  color: "#1A2B49",
                  padding: "0.5rem 0",
                  fontWeight: 600,
                }}
              />
            </div>
          </div> 

          <div className="text-sm text-[#1A2B49] mt-4">Số điện thoại</div>
          <div className="flex gap-2">
            <div className="input w-full text-sm mt-1" style={{borderColor : isError.phone ? "red" : "#F4F4F4"}}>
              <input
                style={{ color: '#1A2B49', padding: '0.5rem 0', fontWeight: 600 }}
                type="text"
                value={inputPhone}
                onChange={(e) => handleInputChange("phone", e.target.value)} 
              />
            </div>
          </div>         

          <div className="text-sm text-[#1A2B49] mt-4">Email</div>
          <div className="flex gap-2">
            <div className="input w-full text-sm mt-1" >
              <input
                style={{ color: '#99A1B7', padding: '0.5rem 0', fontWeight: 600 }}
                type="text"
                value={user?.email}
                disabled  
              />
            </div>
          </div>

          <div className="text-sm text-[#1A2B49] mt-4">Chức vụ</div>
          <div className="flex gap-2">
            <div className="input w-full text-sm mt-1" >
              <input
                style={{ color: '#99A1B7', padding: '0.5rem 0', fontWeight: 600 }}
                type="text"
                value={user?.position}
                disabled  
              />
            </div>
          </div>

          <div className="w-full flex gap-2 justify-end pt-4">
            <button onClick={handleClose} className="py-2 px-3 border border-[#F4F4F4] rounded text-sm font-medium text-[#161517]">
              Hủy bỏ
            </button>
            <button onClick={handleUpdate} className="py-2 px-3 border border-[#F4F4F4] rounded text-sm font-medium bg-[#1A2B49] text-white">
              Cập nhật
            </button>
          </div>
        </ModalBody>
      </ModalContent>
    </Modal> */}
    </>
  );
});

export { ModalUpdateProfile };
