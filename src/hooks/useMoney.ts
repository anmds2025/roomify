import { useCallback } from 'react';
import { getMoneyList, GetMoneyListPayload } from '@/api/money';
import { MoneyListResponse } from '@/types/money';
import { useAuthContext } from '@/auth';

export const useMoney = () => {
  const { currentUser } = useAuthContext();

  const getMoneyListData = useCallback(async (payload: Omit<GetMoneyListPayload, 'token' | 'user_pk'>): Promise<MoneyListResponse> => {
    if (!currentUser?.token || !currentUser?._id?.$oid) {
      throw new Error('User not authenticated');
    }

    const fullPayload: GetMoneyListPayload = {
      ...payload,
      user_pk: currentUser._id.$oid,
      token: currentUser.token,
    };

    return await getMoneyList(fullPayload);
  }, [currentUser]);

  return {
    getMoneyListData,
  };
};
