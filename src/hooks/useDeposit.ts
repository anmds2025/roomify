import { useCallback, useMemo } from 'react';
import { useAuthContext } from '@/auth';
import { DeleteTenantPayload } from '@/api/tenant';
import { deleteDeposit, getDepositList, GetDepositPayload, updateDeposit, UpdateDepositPayload } from '@/api/deposit';
import { IDepositFormData } from '@/types/deposit';

const AUTH_ERROR = 'No authentication token available';

export const useDeposit = () => {
  const { currentUser } = useAuthContext();

  const fetchDeposit = useCallback(async (hoom_pk?: string) => {
    if (!currentUser?.token) throw new Error(AUTH_ERROR);

    const payload: GetDepositPayload = {
      user_pk: currentUser._id.$oid,
      hoom_pk: hoom_pk || '',
      token: currentUser.token,
    };

    return getDepositList(payload);
  }, [currentUser?.token]);

  const createDeposit = useCallback(async (depositData: IDepositFormData) => {
    if (!currentUser?.token) throw new Error(AUTH_ERROR);

    const payload: UpdateDepositPayload = {
      ...depositData,
      token: currentUser.token,
    };

    return updateDeposit(payload);
  }, [currentUser?.token]);

  const removeDeposit = useCallback(async (depositPk: string) => {
    if (!currentUser?.token) throw new Error(AUTH_ERROR);

    const payload: DeleteTenantPayload = {
      pk: depositPk,
      token: currentUser.token,
    };

    return deleteDeposit(payload);
  }, [currentUser?.token]);

  // Memoize return object to prevent unnecessary re-renders
  return useMemo(() => ({
    fetchDeposit,
    createDeposit,
    removeDeposit,
  }), [fetchDeposit, createDeposit, removeDeposit]);
}; 