import { useCallback } from 'react';
import { getRoomsApi, updateRoomApi, deleteRoomApi, UpdateRoomPayload, CreateContractPayload, createContractApi, getRoomsByHomeApi, UpdateDataRoomPayload, updateDataRoomApi } from '@/api/room';
import { IRoomData } from '@/pages/dashboards/light-sidebar/blocks/rooms/RoomsData';
import { useAuthContext } from '@/auth';
import { ITenantData } from '@/types/tenant';

export const useRoom = () => {
  const { currentUser } = useAuthContext();

  const getRooms = useCallback(async (): Promise<any> => {
    if (!currentUser) {
      throw new Error('User not authenticated');
    }
    return await getRoomsApi(currentUser);
  }, [currentUser]);

  const getRoomsByHome = useCallback(async (home_pk : string): Promise<any> => {
    if (!currentUser) {
      throw new Error('User not authenticated');
    }
    return await getRoomsByHomeApi(currentUser, home_pk);
  }, [currentUser]);

  const updateRoom = useCallback(async (payload: UpdateRoomPayload): Promise<boolean> => {
    if (!currentUser) {
      throw new Error('User not authenticated');
    }
    return await updateRoomApi(payload, currentUser);
  }, [currentUser]);

  const updateDataRoom = useCallback(async (payload: UpdateDataRoomPayload): Promise<boolean> => {
    if (!currentUser) {
      throw new Error('User not authenticated');
    }
    return await updateDataRoomApi(payload, currentUser);
  }, [currentUser]);

  const deleteRoom = useCallback(async (pk: string): Promise<boolean> => {
    if (!currentUser) {
      throw new Error('User not authenticated');
    }
    return await deleteRoomApi(pk, currentUser);
  }, [currentUser]);

  const createContract = useCallback(async (payload: CreateContractPayload, list_tenant: ITenantData[]): Promise<boolean> => {
    if (!currentUser) {
      throw new Error('User not authenticated');
    }
    return await createContractApi(payload, currentUser, list_tenant);
  }, [currentUser]);

  return {
    getRooms,
    updateRoom,
    deleteRoom,
    createContract,
    getRoomsByHome,
    updateDataRoom
  };
}; 