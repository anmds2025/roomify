import { useCallback, useMemo } from 'react';
import { useAuthContext } from '@/auth';
import { ITenantFormData } from '@/types/tenant';
import { getUserClientList, updateUserClient, deleteUserClient, GetUserClientListPayload, UpdateTenantPayload, DeleteTenantPayload } from '@/api/tenant';
import { IMoneySlipFormData } from '@/types/moneySlip';
import { deleteMoneySlip, getMoneySlipList, GetMoneySlipListPayload, updateMoneySlip, UpdateMoneySlipPayload } from '@/api/moneySlip';

const AUTH_ERROR = 'No authentication token available';

export const useMoneySlip = () => {
  const { currentUser } = useAuthContext();

  const fetchMoneySlips = useCallback(async (roomPk: string) => {
    if (!currentUser?.token) throw new Error(AUTH_ERROR);

    const payload: GetMoneySlipListPayload = {
      room_pk: roomPk,
      token: currentUser.token,
    };

    return getMoneySlipList(payload);
  }, [currentUser?.token]);

  const createMoneySlip = useCallback(async (roomPk: string, moneySlipData: IMoneySlipFormData) => {
    if (!currentUser?.token) throw new Error(AUTH_ERROR);

    const payload: UpdateMoneySlipPayload = {
      ...moneySlipData,
      room_pk: roomPk,
      token: currentUser.token,
    };

    return updateMoneySlip(payload);
  }, [currentUser?.token]);

  const removeMoneySlip = useCallback(async (moneySlipPk: string) => {
    if (!currentUser?.token) throw new Error(AUTH_ERROR);

    const payload: DeleteTenantPayload = {
      pk: moneySlipPk,
      token: currentUser.token,
    };

    return deleteMoneySlip(payload);
  }, [currentUser?.token]);

  // Memoize return object to prevent unnecessary re-renders
  return useMemo(() => ({
    fetchMoneySlips,
    createMoneySlip,
    removeMoneySlip,
  }), [fetchMoneySlips, createMoneySlip, removeMoneySlip]);
}; 