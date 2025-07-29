import { useCallback, useMemo } from 'react';
import { useAuthContext } from '@/auth';
import { ITenantFormData } from '@/types/tenant';
import { getUserClientList, updateUserClient, deleteUserClient, GetUserClientListPayload, UpdateTenantPayload, DeleteTenantPayload } from '@/api/tenant';

const AUTH_ERROR = 'No authentication token available';

export const useTenant = () => {
  const { currentUser } = useAuthContext();

  const fetchTenants = useCallback(async (roomPk: string) => {
    if (!currentUser?.token) throw new Error(AUTH_ERROR);

    const payload: GetUserClientListPayload = {
      _room_pk: roomPk,
      token: currentUser.token,
    };

    return getUserClientList(payload);
  }, [currentUser?.token]);

  const createTenant = useCallback(async (roomPk: string, tenantData: ITenantFormData) => {
    if (!currentUser?.token) throw new Error(AUTH_ERROR);

    const payload: UpdateTenantPayload = {
      ...tenantData,
      room_pk: roomPk,
      token: currentUser.token,
    };

    return updateUserClient(payload);
  }, [currentUser?.token]);

  const updateTenantInfo = useCallback(async (tenantPk: string, roomPk: string, tenantData: ITenantFormData) => {
    if (!currentUser?.token) throw new Error(AUTH_ERROR);

    const payload: UpdateTenantPayload = {
      ...tenantData,
      pk: tenantPk,
      room_pk: roomPk,
      token: currentUser.token,
    };

    return updateUserClient(payload);
  }, [currentUser?.token]);

  const removeTenant = useCallback(async (tenantPk: string) => {
    if (!currentUser?.token) throw new Error(AUTH_ERROR);

    const payload: DeleteTenantPayload = {
      pk: tenantPk,
      token: currentUser.token,
    };

    return deleteUserClient(payload);
  }, [currentUser?.token]);

  // Memoize return object to prevent unnecessary re-renders
  return useMemo(() => ({
    fetchTenants,
    createTenant,
    updateTenantInfo,
    removeTenant,
  }), [fetchTenants, createTenant, updateTenantInfo, removeTenant]);
}; 