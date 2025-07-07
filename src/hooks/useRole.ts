import { useState } from 'react';
import { toast } from 'react-toastify';

import { createRoleApi, deleteRoleApi, getRolesApi, updateRoleApi } from '@/api/role';

export const useRole = () => {
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);


    // Fetch all Role
    const getRoles = async () => {
        setIsLoading(true);
        setError(null);

        try {
            const data = await getRolesApi();
            return data;
        } catch (error: any) {
            setError(error.message || 'Failed to fetch roles');
            toast.error("Failed to fetch data!");
        } finally {
            setIsLoading(false);
        }
    };

    return {
        isLoading,
        error,
        successMessage,
        getRoles
    };
};
