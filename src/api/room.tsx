import axios from 'axios';
import { getStoredUser, createFormData } from '.';
import { IRoomData, IDataResponseRoom } from '@/pages/dashboards/light-sidebar/blocks/rooms/RoomsData';
import { UserModel } from '@/auth';
import { ITenantData } from '@/types/tenant';
import { SelectedInterior } from '@/partials/modals/room/ModalUpdateRoom';

// Base API URL
const API_URL = import.meta.env.VITE_APP_API_URL;
const GET_ROOMS_URL = `${API_URL}/room/getMyRoom`;
const UPDATE_ROOM_URL = `${API_URL}/room/update`;
const DELETE_ROOM_URL = `${API_URL}/room/delete`;
const CREATE_CONTRACT_URL = `${API_URL}/contract/create`;

export interface RoomResponse {
  success: boolean;
  data?: IRoomData;
  message?: string;
}

export interface UpdateRoomPayload {
  pk?: string;
  room_name: string;
  price: number;
  size: number;
  // address: string;
  type_collect_water: string;
  type_collect_electricity: string;
  note?: string;
  token: string;
  interiors: SelectedInterior[]
}

export interface CreateContractPayload {
  user_pkA: string;
  user_pkB?: string;
  room_name: string;
  room_pk?: string;
  home_pk?: string;
  address: string;
  today: string;

  name_a: string;
  phone_a: string;
  cccd_a: string;
  cccdDay_a: string;
  cccdAddress_a: string;

  name_b: string;
  phone_b: string;
  cccd_b: string;
  cccdDay_b: string;
  cccdAddress_b: string;
  address_b: string;

  numMonth: string;
  formDate: string;
  toDate: string;
  priceRoom: string;
  priceRoomText: string;
  deposit: string;
  depositText: string;
  priceElectricity: string;
  priceWater: string;
  electricityStart: string;
  priceWaterStart: string;
  priceGarbage: string;
  priceInternet?: string;
  priceCar: string;
  otherServices: string;
  note: string;
  typeWater: string;
}

/**
 * Fetch room data by contract ID
 * @param contractId - The contract ID to find the room for
 * @returns Promise<IRoomData | null>
 */
export const fetchRoomByContractId = async (contractId: string): Promise<IRoomData | null> => {
  try {
    const user = getStoredUser();
    if (!user?.token) {
      throw new Error('User not authenticated');
    }

    const response = await axios.get<RoomResponse>(
      `${API_URL}/room/by-contract/${contractId}`,
      {
        headers: {
          'Authorization': `Bearer ${user.token}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (response.data.success && response.data.data) {
      return response.data.data;
    }

    return null;
  } catch (error) {
    console.error('Failed to fetch room by contract ID:', error);
    return null;
  }
};

/**
 * Fetch room data by room ID
 * @param roomId - The room ID
 * @returns Promise<IRoomData | null>
 */
export const fetchRoomById = async (roomId: string): Promise<IRoomData | null> => {
  try {
    const user = getStoredUser();
    if (!user?.token) {
      throw new Error('User not authenticated');
    }

    const response = await axios.get<RoomResponse>(
      `${API_URL}/room/${roomId}`,
      {
        headers: {
          'Authorization': `Bearer ${user.token}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (response.data.success && response.data.data) {
      return response.data.data;
    }

    return null;
  } catch (error) {
    console.error('Failed to fetch room by ID:', error);
    return null;
  }
};

export const getRoomsApi = async (user: UserModel): Promise<IRoomData[]> => {
  try {
    const formData = createFormData({
      user_pk: user._id?.$oid || '',
      token: user.token || ''
    });

    const response = await axios.post<IDataResponseRoom>(GET_ROOMS_URL, formData);
    
    // Kiểm tra response structure
    if (response.data && response.data.objects) {
      return response.data.objects;
    } else if (Array.isArray(response.data)) {
      return response.data;
    } else {
      console.warn('Unexpected response structure:', response.data);
      return [];
    }
  } catch (error) {
    console.error('Error fetching rooms:', error);
    throw error;
  }
};

export const updateRoomApi = async (payload: UpdateRoomPayload, user: UserModel): Promise<boolean> => {
  try {
    const formData = createFormData({
      ...payload,
      token: user.token || '',
      interiors: JSON.stringify(payload.interiors)
    });

    const response = await axios.post(UPDATE_ROOM_URL, formData);
    return response.status === 200;
  } catch (error) {
    console.error('Error updating room:', error);
    throw error;
  }
};

export const deleteRoomApi = async (pk: string, user: UserModel): Promise<boolean> => {
  try {
    const formData = createFormData({
      pk,
      token: user.token || ''
    });

    const response = await axios.post(DELETE_ROOM_URL, formData);
    return response.status === 200;
  } catch (error) {
    console.error('Error deleting room:', error);
    throw error;
  }
}; 

export const createContractApi = async (payload: CreateContractPayload, user: UserModel, list_tenant: ITenantData[]): Promise<boolean> => {
  try {
    const formData = createFormData({
      ...payload,
      token: user.token || '',
      list_user: JSON.stringify(list_tenant)
    });

    const response = await axios.post(CREATE_CONTRACT_URL, formData);
    return response.status === 200;
  } catch (error) {
    console.error('Error updating room:', error);
    throw error;
  }
};