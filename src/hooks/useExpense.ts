import { deleteExpenseApi, getExpensesApi, getFilterExpensesApi, IExpenseData, updateExpenseApi, UpdateExpensePayload } from '@/api/expense';
import { useAuthContext } from '@/auth';
import { useState, useCallback } from 'react';
import { toast } from 'react-toastify';

export interface GetExpensePayload {
  user_pk: string;
  home_pk?: string;
  month?: string;
  token: string;
}

export interface ExpenseResponse {
  num_pages: number;
  currentPage: number;
  totalObject: number;
  has_next: boolean;
  has_previous: boolean;
  objects: IExpenseData[];
}

export const useExpense = () => {
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const { currentUser, setCurrentUser } = useAuthContext();

    const getFilterExpenses = useCallback(async (payload: Omit<GetExpensePayload, 'token' | 'user_pk'>): Promise<ExpenseResponse> => {
        if (!currentUser?.token || !currentUser?._id?.$oid) {
            throw new Error('User not authenticated');
        }
        const fullPayload: GetExpensePayload = {
        ...payload,
        user_pk: currentUser._id.$oid,
        token: currentUser.token,
        };
    
        return await getFilterExpensesApi(fullPayload);
    }, [currentUser]);
    // Fetch all Expense
    const getExpenses = useCallback(async () => {
        setIsLoading(true);
        setError(null);

        try {
            if(currentUser)
            {
                const data = await getExpensesApi(currentUser);
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

    // Create a new Expense
    const createExpense = useCallback(async (data: UpdateExpensePayload) => {
        setIsLoading(true);
        setError(null);
        setSuccessMessage(null);
    
        try {
            if(currentUser)
            {
                const response = await updateExpenseApi(data, currentUser);
                setSuccessMessage('Expense created successfully');
                toast.success('Tạo chi phí thành công');
                return response;
            }
        } catch (error: any) {
            setError(error.message || 'Failed to create Expense');
            toast.error(error.response.data.Error  || 'Tạo chi phí thất bại');
        } finally {
            setIsLoading(false);
        }
    }, [currentUser]);

    const updateExpense = async (data: UpdateExpensePayload) => {
        setIsLoading(true);
        setError(null);
        setSuccessMessage(null);
        try {
            if(currentUser)
            {
                const response = await updateExpenseApi(data, currentUser);
                setSuccessMessage('Expense created successfully');
                toast.success('Cập nhật chi phí thành công');
                return response;
            }
        } catch (error: any) {
            setError(error.message || 'Failed to create Expense');
            toast.error('Cập nhật chi phí thấy bại');
        } finally {
            setIsLoading(false);
        }
    };

    const deleteExpense = async (id: string) => {
        setIsLoading(true);
        setError(null);
        setSuccessMessage(null);
        try {
            if(currentUser)
            {
                const response = await deleteExpenseApi(id, currentUser);
                setSuccessMessage('Expense deleted successfully');
                toast.success('Xóa chi phí thành công');
                return response;
            }
        } catch (error: any) {
            setError(error.message || 'Failed to delete Expense');
            toast.error('Có lỗi khi xóa chi phí');
        } finally {
            setIsLoading(false);
        }
    };
    
    return {
        isLoading,
        error,
        successMessage,
        getExpenses,
        getFilterExpenses,
        createExpense,
        updateExpense,
        deleteExpense
    };
};
