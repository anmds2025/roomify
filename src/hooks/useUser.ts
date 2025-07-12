import { changePasswordApi, deleteUserApi, getUserApi, sendMailCheckPasswordApi, sendMailNewPasswordApi, updateUserApi, UpdateUserPayload } from '@/api/user';
import { useAuthContext } from '@/auth';
import { useState, useCallback } from 'react';
import { toast } from 'react-toastify';

export const useUser = () => {
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const { currentUser } = useAuthContext();

    // Fetch all user
    const getUsers = useCallback(async () => {
        setIsLoading(true);
        setError(null);

        try {
            if(currentUser)
            {
                const data = await getUserApi(currentUser);
                return data;
            }
            else
            {
                toast.error("Lỗi")
            }
           
        } catch (error: any) {
            setError(error.message || 'Failed to fetch Users');
            toast.error("Failed to fetch data!");
        } finally {
            setIsLoading(false);
        }
    }, [currentUser]);

    // Create a new user
    const createUser = useCallback(async (data: UpdateUserPayload) => {
        setIsLoading(true);
        setError(null);
        setSuccessMessage(null);
    
        try {
            if(currentUser)
            {
                const response = await updateUserApi(data, currentUser);
                setSuccessMessage('User created successfully');
                toast.success('Tạo tài khoản thành công');
                return response;
            }
        } catch (error: any) {
            setError(error.message || 'Failed to create user');
            toast.error(error.response.data.Error  || 'Tạo tài khoản thất bại');
        } finally {
            setIsLoading(false);
        }
    }, [currentUser]);

    const updateUser = async (data: UpdateUserPayload) => {
        setIsLoading(true);
        setError(null);
        setSuccessMessage(null);
    
        try {
            if(currentUser)
            {
                const response = await updateUserApi(data, currentUser);
                setSuccessMessage('User created successfully');
                toast.success('Cập nhật tài khoản thành công');
                return response;
            }
        } catch (error: any) {
            setError(error.message || 'Failed to create user');
            toast.error('Cập nhật tài khoản thấy bại');
        } finally {
            setIsLoading(false);
        }
    };

    const deleteUser = async (id: string) => {
        setIsLoading(true);
        setError(null);
        setSuccessMessage(null);
    
        try {
            if(currentUser)
            {
                const response = await deleteUserApi(id, currentUser);
                setSuccessMessage('User deleted successfully');
                toast.success('Xóa tài khoản thành công');
                return response;
            }
        } catch (error: any) {
            setError(error.message || 'Failed to delete user');
            toast.error('Có lỗi khi xóa tài khoản');
        } finally {
            setIsLoading(false);
        }
    };

    const changePassword = async (data: { 
        id: string; 
        old_password: string;
        new_password: string;
    }) => {
        setIsLoading(true);
        setError(null);
        setSuccessMessage(null);
    
        try {
            const response = await changePasswordApi(data);
            setSuccessMessage('Mật khẩu đã cập nhật thành công');
            toast.success('Mật khẩu đã cập nhật thành công');
            return response;
        } catch (error: any) {
            setError(error.message || 'Failed to update password');
            toast.error(error.response.data.message || 'Failed to update password');
        } finally {
            setIsLoading(false);
        }
    };

    const sendMailCheckPassword = async ( 
        email: string
    ) => {
        setIsLoading(true);
        setError(null);
        setSuccessMessage(null);
    
        try {
            const response = await sendMailCheckPasswordApi(email);
            return response;
        } catch (error: any) {
            setError(error.response.data.error || 'Failed to send mail');
            toast.error(error.response.data.error || 'Failed to send mail');
        } finally {
            setIsLoading(false);
        }
    };

    const sendMailNewPassword = async ({
        email,
        token,}: {
        email: string;
        token: string;
    }) => {
        setIsLoading(true);
        setError(null);
        setSuccessMessage(null);

    try {
        const response = await sendMailNewPasswordApi(email, token);
            return response;
        } catch (error: any) {
            setError(error.message || 'Failed to send mail');
            toast.error(error.response.data.message || 'Failed to send mail');
        } finally {
            setIsLoading(false);
        }
    };

    const updateUserProfile = async (data: { 
        id: string; 
        full_name?: string; 
        avatar?: string; 
    }) => {
        setIsLoading(true);
        setError(null);
        setSuccessMessage(null);
    
        try {
            const { id, full_name, avatar } = data;
            const updateFields: Record<string, any> = { id }; 
            if (full_name) updateFields.full_name = full_name;
            if (avatar) updateFields.avatar = avatar;``
            // Gọi API
            // const response = await updateProfileApi(updateFields);
            setSuccessMessage('User updated successfully');
            toast.success('User updated successfully');
            // return response;
        } catch (error: any) {
            setError(error.message || 'Failed to update user');
            toast.error('Failed to update user');
        } finally {
            setIsLoading(false);
        }
    };

    
    return {
        isLoading,
        error,
        successMessage,
        getUsers,
        createUser,
        updateUser,
        deleteUser,
        changePassword,
        sendMailCheckPassword,
        sendMailNewPassword,
        updateUserProfile
    };
};
