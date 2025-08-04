import { IRoomData, IDataResponseRoom } from '@/pages/dashboards/light-sidebar/blocks/rooms/RoomsData';
import axios from 'axios';
import { createFormData, getStoredUser } from '.';
import { UserModel } from '@/auth';
import { ITenantData } from '@/types/tenant';

// Base API URL
const API_URL = import.meta.env.VITE_APP_API_URL;
const GET_ROOMS_URL = `${API_URL}/room/getMyRoom`;
const UPDATE_ROOM_URL = `${API_URL}/room/update`;
const DELETE_ROOM_URL = `${API_URL}/room/delete`;
const CREATE_CONTRACT_URL = `${API_URL}/contract/create`;

export interface UpdateRoomPayload {
  pk?: string;
  room_name: string;
  price: number;
  size: number;
  // address: string;
  note?: string;
  token: string;
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
      token: user.token || ''
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