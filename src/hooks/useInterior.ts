import { deleteInteriorApi, GetInteriorPayload, getInteriorsApi, InteriorResponse, updateInteriorApi, UpdateInteriorPayload } from '@/api/interior';
import { useAuthContext } from '@/auth';
import { useState, useCallback } from 'react';
import { toast } from 'react-toastify';


export const useInterior = () => {
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const { currentUser, setCurrentUser } = useAuthContext();
    
    const getInteriors = useCallback(async () => {
        setIsLoading(true);
        setError(null);

        try {
            if(currentUser)
            {
                const data = await getInteriorsApi(currentUser);
                return data;
            }
            else
            {
                toast.error("Lỗi không có token")
            }
           
        } catch (error: any) {
            console.error('useUser getUsers error:', error);
            setError(error.message || 'Failed to fetch Users');
            toast.error("Failed to fetch data!");
        } finally {
            setIsLoading(false);
        }
    }, [currentUser]);

    // Create a new Interior
    const createInterior = useCallback(async (data: UpdateInteriorPayload) => {
        setIsLoading(true);
        setError(null);
        setSuccessMessage(null);
    
        try {
            if(currentUser)
            {
                const response = await updateInteriorApi(data, currentUser);
                setSuccessMessage('Interior created successfully');
                toast.success('Tạo nội thất thành công');
                return response;
            }
        } catch (error: any) {
            setError(error.message || 'Failed to create Interior');
            toast.error(error.response.data.Error  || 'Tạo nội thất thất bại');
        } finally {
            setIsLoading(false);
        }
    }, [currentUser]);

    const updateInterior = async (data: UpdateInteriorPayload) => {
        setIsLoading(true);
        setError(null);
        setSuccessMessage(null);
        try {
            if(currentUser)
            {
                const response = await updateInteriorApi(data, currentUser);
                setSuccessMessage('Interior created successfully');
                toast.success('Cập nhật nội thất thành công');
                return response;
            }
        } catch (error: any) {
            setError(error.message || 'Failed to create Interior');
            toast.error('Cập nhật nội thất thấy bại');
        } finally {
            setIsLoading(false);
        }
    };

    const deleteInterior = async (id: string) => {
        setIsLoading(true);
        setError(null);
        setSuccessMessage(null);
        try {
            if(currentUser)
            {
                const response = await deleteInteriorApi(id, currentUser);
                setSuccessMessage('Interior deleted successfully');
                toast.success('Xóa nội thất thành công');
                return response;
            }
        } catch (error: any) {
            setError(error.message || 'Failed to delete Interior');
            toast.error('Có lỗi khi xóa nội thất');
        } finally {
            setIsLoading(false);
        }
    };
    
    return {
        isLoading,
        error,
        successMessage,
        getInteriors,
        createInterior,
        updateInterior,
        deleteInterior
    };
};
