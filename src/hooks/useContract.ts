import { useCallback, useMemo } from 'react';
import { useAuthContext } from '@/auth';
import { IMoneySlipFormData } from '@/types/moneySlip';
import { deleteMoneySlip, getMoneySlipList, GetMoneySlipListPayload, updateMoneySlip, UpdateMoneySlipPayload } from '@/api/moneySlip';
import { deleteContract, DeleteContractPayload } from '@/api';

const AUTH_ERROR = 'No authentication token available';

export const useContract = () => {
  const { currentUser } = useAuthContext();

  const removeContract = useCallback(async (contractPk: string) => {
    if (!currentUser?.token) throw new Error(AUTH_ERROR);

    const payload: DeleteContractPayload = {
      pk: contractPk,
      token: currentUser.token,
    };

    return deleteContract(payload);
  }, [currentUser?.token]);

  return useMemo(() => ({
      removeContract,
    }), [removeContract]);
}; 