import { useCallback } from 'react';
import { getHomesApi, updateHomeApi, UpdateHomePayload } from '@/api/home';
import { IHomeData } from '@/pages/dashboards/light-sidebar/blocks/homes/HomesData';
import { useAuthContext } from '@/auth';

export const useHome = () => {
  const { currentUser } = useAuthContext();

  const getHomes = useCallback(async (): Promise<IHomeData[]> => {
    if (!currentUser) {
      throw new Error('User not authenticated');
    }
    return await getHomesApi(currentUser);
  }, [currentUser]);

  const updateHome = useCallback(async (payload: UpdateHomePayload): Promise<boolean> => {
    if (!currentUser) {
      throw new Error('User not authenticated');
    }
    return await updateHomeApi(payload, currentUser);
  }, [currentUser]);

  // Tạm thời ẩn chức năng delete vì backend chưa có endpoint
  // const deleteHome = useCallback(async (pk: string): Promise<boolean> => {
  //   if (!currentUser) {
  //     throw new Error('User not authenticated');
  //   }
  //   return await deleteHomeApi(pk, currentUser);
  // }, [currentUser]);

  return {
    getHomes,
    updateHome,
    // deleteHome,
  };
}; 