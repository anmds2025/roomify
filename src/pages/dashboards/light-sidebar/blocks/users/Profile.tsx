/* eslint-disable prettier/prettier */
import React, { useEffect, useMemo, useState } from 'react';
import { useSnackbar } from 'notistack';
import { useUser } from '@/hooks/useUser';
import { CrudAvatarUpload } from '@/partials/crud/CrudAvatarUpload';
import { useAuthContext } from '@/auth/useAuthContext';
import { IImageInputFile } from '@/components/image-input/ImageInput';
import { toast } from 'react-toastify';
import useS3Uploader from '@/hooks/useS3Uploader';
import { ModalUpdatePassword } from '@/partials/modals/user/ModalUpdatePassword';

const Profile = () => {
    const [inputName, setInputName] = useState("");
    const { enqueueSnackbar } = useSnackbar();
    const { currentUser, updateCurrentUser} = useAuthContext();
    const [currentAvatar, setCurrentAvatar] = useState<IImageInputFile[]>();
    const { updateUserProfile} = useUser();
    const { uploadFileToS3 } = useS3Uploader();

    const [userId, setUserId] = useState<string>('');
    const [openEditModal, setOpenEditModal] = useState(false);

    useEffect(() => {
        setInputName(currentUser?.fullname || "");
    }, [currentUser]);

    const [isError, setIsError] = useState({
        name: false,
    });

    const handleInputChange = (
        field: "name" ,
        value: string
    ) => {
        switch (field) {
            case "name":
                setInputName(value);
                break;
            }
        setIsError((prev) => ({ ...prev, [field]: false })); 
    };

    const handleAvatarChange = (avatar: IImageInputFile[]) => {
        setCurrentAvatar(avatar);
        console.log("Updated Avatar:", avatar);
    };

    const validateFields = () => {
        const errors = {
            name: !inputName.trim(),
        };
    
        setIsError(errors);
    
        const hasError = Object.values(errors).some((error) => error);
        if (hasError) {
          if (errors.name) toast.error("Họ tên là bắt buộc");
        }
      
        return !hasError;
      };
    

    const handleUpdate = async () => {
        if (validateFields()) {
            if (currentAvatar && currentAvatar.length > 0 && currentAvatar[0].file) {
              try {
                
              } catch (error) {
                console.error("Error uploading file:", error);
              }
            } else {
              console.log("No file selected.");
            }
            try {
                console.log(currentUser)
                await updateUserProfile({
                    id: currentUser?._id.$oid || "",
                    full_name: inputName
                });

                updateCurrentUser({
                    fullname: inputName,
                });
            } catch (error) {
                console.error(error);
            }
        }
    };

    const handleOpenEditModal = () => {
        setUserId(currentUser?._id.$oid || "");
        setOpenEditModal(true)
    };
    
    const handleCloseEditModal = () => {
    setUserId("")
    setOpenEditModal(false);
    };

    return (
        <div className="card card-grid h-full min-w-full">
             <ModalUpdatePassword open={openEditModal} onClose={handleCloseEditModal} user_id={userId}/>
            <div className='card-header'>
                <h3 className="card-title">Thông tin tài khoản</h3>
            </div>
            <div className="card-body">
                <div className='p-4 flex-col gap-4 flex'>
                    <div className='flex items-center justify-between w-full'>
                        <div className='w-1/2 gap-4 flex'>
                            <div className="py-2 min-w-60 text-gray-600 font-normal">Photo</div>
                            <div className="py-2 text-gray700 font-normal min-w-32 text-2sm">
                                150x150px JPEG, PNG Image
                            </div>
                        </div>
                        <div className="py-2 text-center">
                            <div className="flex justify-center items-center">
                                <CrudAvatarUpload initialAvatarUrl={""} onAvatarChange={handleAvatarChange}/>
                            </div>
                        </div>
                    </div>
                    
                    <div className='flex items-center justify-between w-full'>
                        <div className='justify-between flex w-full'>
                            <div className="py-2 min-w-60 text-gray-600 font-normal mr-2">Họ và tên</div>
                            <div className="input w-full text-base" style={{borderColor : isError.name ? "red" : "#404041"}}>
                                <input
                                    style={{color: '#1A2B49', padding: '0.5rem 0'}}
                                    type="text"
                                    placeholder="Họ và tên"
                                    value={inputName}
                                    onChange={(e) => handleInputChange("name", e.target.value)} 
                                />
                            </div>
                        </div>
                    </div>

                    <div className='flex items-center justify-between w-full'>
                        <div className='flex w-full'>
                            <div className="py-2 min-w-60 text-gray-600 font-normal mr-2">Mật khẩu</div>
                            <button onClick={handleOpenEditModal} className="py-2 px-3 border border-[#F4F4F4] rounded text-base text-[#1A2B49]">
                                Thay đổi mật khẩu
                            </button>
                        </div>
                    </div>

                    <div className='flex justify-end'>
                        <button onClick={handleUpdate} className="btn btn-sm btn-primary">
                            Lưu thay đổi
                        </button>
                    </div>
                    

                </div>
            </div>
        </div>
    );
};

export { Profile };